"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Box, Button, Paper } from "@mui/material";

import { useAvailableHeight } from "@hooks";
import { useGlobalContext } from "@context";
import { processChatFile } from "@utils/log-parser";
import { Battle, Vessel, GreedyCounter } from "@interfaces";

import { VesselCard, FirstMateTitleBar } from "@components/firstmate";
import GreedyCounterModal from "@components/greedycounter/GreedyCountModal";

export default function FirstMate() {
  const { vessels, userSettings, setUserSettings } = useGlobalContext();
  const availableHeight = useAvailableHeight();

  const [result, setResult] = useState<GreedyCounter | null>(null);

  const [battle, setBattle] = useState<Battle>(() => {
    const fallback: Battle = {
      playerVessel: vessels[0],
      enemyVessel: vessels[0],
      playerDamageTaken: 0,
      enemyDamageTaken: 0,
      type: "brigands",
      expandCardInfo: false,
      wins: 0,
      losses: 0,
    };

    try {
      const raw = localStorage.getItem("battle");
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);

      const ensureSecs = (v: Vessel) => {
        if (!v) return v;
        const ok =
          typeof v.secondsPerLPAtMaxSpeed === "number" &&
          Number.isFinite(v.secondsPerLPAtMaxSpeed) &&
          v.secondsPerLPAtMaxSpeed > 0;
        return ok ? v : { ...v, secondsPerLPAtMaxSpeed: 60 };
      };

      if (parsed?.playerVessel)
        parsed.playerVessel = ensureSecs(parsed.playerVessel);
      if (parsed?.enemyVessel)
        parsed.enemyVessel = ensureSecs(parsed.enemyVessel);

      return parsed;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    if (!vessels?.length) return;

    const getSec = (v: Vessel) =>
      typeof v?.secondsPerLPAtMaxSpeed === "number" &&
      Number.isFinite(v.secondsPerLPAtMaxSpeed) &&
      v.secondsPerLPAtMaxSpeed > 0
        ? v.secondsPerLPAtMaxSpeed
        : 0;

    const patchFromDataset = (savedVessel: Vessel) => {
      if (!savedVessel) return savedVessel;

      // If it already has a good value that isn’t the temp 60, keep it
      const existing = getSec(savedVessel);
      if (existing !== null && existing !== 60) return savedVessel;

      // Try to refresh from current dataset by name
      const fresh = savedVessel.name
        ? vessels.find((x) => x.name === savedVessel.name)
        : undefined;

      let secs;
      if (fresh) {
        secs = getSec(fresh) ?? getSec(savedVessel) ?? 60;
      } else {
        secs = 60;
      }

      return { ...savedVessel, secondsPerLPAtMaxSpeed: secs };
    };

    try {
      const raw = localStorage.getItem("battle");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const patchedPlayer = patchFromDataset(parsed?.playerVessel);
      const patchedEnemy = patchFromDataset(parsed?.enemyVessel);

      if (
        parsed?.playerVessel?.secondsPerLPAtMaxSpeed ===
          patchedPlayer?.secondsPerLPAtMaxSpeed &&
        parsed?.enemyVessel?.secondsPerLPAtMaxSpeed ===
          patchedEnemy?.secondsPerLPAtMaxSpeed
      ) {
        return;
      }

      const patched = {
        ...parsed,
        playerVessel: patchedPlayer,
        enemyVessel: patchedEnemy,
      };
      setBattle((prev) => ({ ...prev, ...patched }));
      localStorage.setItem("battle", JSON.stringify(patched));
      console.warn(
        "[HOTFIX] Rehydrated secondsPerLPAtMaxSpeed from dataset (or 60 fallback)."
      );
    } catch (e) {
      console.error("[HOTFIX] Failed to rehydrate saved battle", e);
    }
  }, [vessels]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          try {
            const parsedResult = await processChatFile(text);
            setResult(parsedResult as GreedyCounter);
          } catch (error) {
            console.error("Error processing file:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    localStorage.setItem("battle", JSON.stringify(battle));
  }, [battle]);

  const handleVesselChange = (identity: string, vesselSelected: Vessel) => {
    setBattle({
      ...battle,
      [identity === "player" ? "playerVessel" : "enemyVessel"]: vesselSelected,
      playerDamageTaken: 0,
      enemyDamageTaken: 0,
    });
  };

  const recordShotsTaken = (identity: string, shots: number, undo = false) => {
    setBattle((prevBattle) => {
      const recipientDamageTakenKey =
        identity === "player" ? "playerDamageTaken" : "enemyDamageTaken";
      let updatedDamage = prevBattle[recipientDamageTakenKey];

      if (undo) {
        updatedDamage = Math.max(0, updatedDamage - shots);
      } else {
        updatedDamage += shots;
      }

      return {
        ...prevBattle,
        [recipientDamageTakenKey]: updatedDamage,
      };
    });
  };

  const getDamage = (identity: string) => {
    let damageTaken, maxDamage;

    if (identity === "player") {
      const enemyCannonSize = battle.enemyVessel.cannonSize;
      maxDamage = battle.playerVessel.maxPillageDamage[enemyCannonSize];
      damageTaken = battle.playerDamageTaken;
    } else {
      const playerCannonSize = battle.playerVessel.cannonSize;
      maxDamage = battle.enemyVessel.maxPillageDamage[playerCannonSize];
      damageTaken = battle.enemyDamageTaken;
    }

    const damagePercent = (damageTaken / maxDamage) * 100;
    return parseFloat(damagePercent.toFixed(0));
  };

  const toggleExpandShipInfo = () => {
    setBattle((PB) => {
      return {
        ...PB,
        expandCardInfo: !PB.expandCardInfo,
      };
    });
  };

  const toggleBattleType = () => {
    setBattle((PB) => {
      return {
        ...PB,
        type: PB.type === "barbarians" ? "brigands" : "barbarians",
      };
    });
  };

  const getVesselDamageStatus = (identity: string, showAsFraction = true) => {
    let damageTaken, maxPillageDamage;

    if (identity === "player") {
      damageTaken = battle.playerDamageTaken;
      maxPillageDamage =
        battle.playerVessel.maxPillageDamage[battle.enemyVessel.cannonSize];
    } else {
      damageTaken = battle.enemyDamageTaken;
      maxPillageDamage =
        battle.enemyVessel.maxPillageDamage[battle.playerVessel.cannonSize];
    }

    const formatNumber = (num: number) => {
      return num % 1 === 0 ? num.toString() : num.toFixed(1);
    };

    if (showAsFraction) {
      return `${formatNumber(damageTaken)}/${formatNumber(maxPillageDamage)}`;
    } else {
      return formatNumber(damageTaken);
    }
  };

  const recordRockDamage = (identity: string, undo = false) => {
    setBattle((prevBattle) => {
      if (identity === "player") {
        const damageAmount =
          prevBattle.playerVessel.rockDamage[prevBattle.enemyVessel.cannonSize];
        const updatedDamage = undo
          ? Math.max(0, prevBattle.playerDamageTaken - damageAmount)
          : prevBattle.playerDamageTaken + damageAmount;

        return {
          ...prevBattle,
          playerDamageTaken: updatedDamage,
        };
      } else {
        const damageAmount =
          prevBattle.enemyVessel.rockDamage[prevBattle.playerVessel.cannonSize];
        const updatedDamage = undo
          ? Math.max(0, prevBattle.enemyDamageTaken - damageAmount)
          : prevBattle.enemyDamageTaken + damageAmount;

        return {
          ...prevBattle,
          enemyDamageTaken: updatedDamage,
        };
      }
    });
  };

  const recordRamDamage = () => {
    setBattle({
      ...battle,
      playerDamageTaken:
        battle.playerDamageTaken +
        battle.enemyVessel.ramDamage[battle.enemyVessel.cannonSize],
      enemyDamageTaken:
        battle.enemyDamageTaken +
        battle.playerVessel.ramDamage[battle.playerVessel.cannonSize],
    });
  };

  const copyScoreToClipboard = async () => {
    const { reverseOrder, showAsFraction, showPercentage } =
      userSettings.copyScoreSettings;

    const formatWithPercentage = (
      identity: string,
      showPercentage: boolean
    ) => {
      const baseScore = getVesselDamageStatus(identity, showAsFraction);
      const percentage = Math.min(getDamage(identity), 100) + "%";
      return showPercentage ? `${baseScore}(${percentage})` : baseScore;
    };

    const player = formatWithPercentage("player", showPercentage);
    const enemy = formatWithPercentage("enemy", showPercentage);

    const score = reverseOrder
      ? `${enemy} - ${player}`
      : `${player} - ${enemy}`;

    try {
      await navigator.clipboard.writeText(score);
    } catch (err) {
      alert("Failed to copy: " + err);
    }
  };

  const reverseCardOrder = () => {
    setUserSettings((US) => ({
      ...US,
      reverseVesselCardOrder: !US.reverseVesselCardOrder,
    }));
  };

  const adjustWinLoss = (type: string, result: string) => {
    setBattle((B) => {
      let newValue;

      if (type === "wins") {
        newValue = result === "increase" ? B.wins + 1 : Math.max(B.wins - 1, 0);
      } else if (type === "losses") {
        newValue =
          result === "increase" ? B.losses + 1 : Math.max(B.losses - 1, 0);
      }

      return {
        ...B,
        [type]: newValue,
      };
    });
  };

  const identities = (
    userSettings.reverseVesselCardOrder
      ? ["enemy", "player"]
      : ["player", "enemy"]
  ) as Array<"player" | "enemy">;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: availableHeight,
        overflow: "auto",
        pt: 0.5,
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%),
          radial-gradient(800px 400px at 50% 120%, rgba(255,255,255,0.04), transparent 60%),
          linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)
        `,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          maxWidth: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          p: 1,
          width: "100%",
        }}
      >
        <FirstMateTitleBar
          wins={battle.wins}
          losses={battle.losses}
          adjustWinLoss={adjustWinLoss}
          vesselSelection={battle.playerVessel}
        />

        <Box
          sx={{
            position: "relative",
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left / first card */}
          <VesselCard
            key={identities[0]}
            identity={identities[0]}
            battle={battle}
            vessel={
              identities[0] === "player"
                ? battle.playerVessel
                : battle.enemyVessel
            }
            vessels={vessels}
            getDamage={getDamage}
            getVesselDamageStatus={getVesselDamageStatus}
            handleVesselChange={handleVesselChange}
            toggleExpandShipInfo={toggleExpandShipInfo}
            recordShotsTaken={recordShotsTaken}
            toggleBattleType={toggleBattleType}
            recordRockDamage={recordRockDamage}
            recordRamDamage={recordRamDamage}
            meterSide="left"
          />

          {/* Right / second card */}
          <VesselCard
            key={identities[1]}
            identity={identities[1]}
            battle={battle}
            vessel={
              identities[1] === "player"
                ? battle.playerVessel
                : battle.enemyVessel
            }
            vessels={vessels}
            getDamage={getDamage}
            getVesselDamageStatus={getVesselDamageStatus}
            handleVesselChange={handleVesselChange}
            toggleExpandShipInfo={toggleExpandShipInfo}
            recordShotsTaken={recordShotsTaken}
            toggleBattleType={toggleBattleType}
            recordRockDamage={recordRockDamage}
            recordRamDamage={recordRamDamage}
            meterSide="right"
          />
        </Box>

        {/* Controls strip (kept same button sizes; just improved contrast) */}
        <Paper
          elevation={1}
          sx={{
            px: 1,
            py: 1,
            borderRadius: 2,
            backdropFilter: "blur(3px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              flexWrap: "wrap",
              mx: "auto",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() =>
                setBattle({
                  ...battle,
                  playerDamageTaken: 0,
                  enemyDamageTaken: 0,
                })
              }
            >
              Reset Score
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={copyScoreToClipboard}
            >
              Copy Score
            </Button>
            <Button size="small" variant="outlined" onClick={reverseCardOrder}>
              Reverse Card Order
            </Button>
            <Button
              size="small"
              variant="outlined"
              component="label"
              sx={{
                minWidth: 0,
                px: 1,
                py: 0.5,
                fontSize: "0.75rem",
              }}
            >
              <Image
                src="/images/icons/greedy_pirate_4.png"
                alt="captain"
                width={20}
                height={20}
              />
              <span style={{ paddingLeft: 2 }}>Greedy Strikes</span>
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Box>
        </Paper>
      </Box>

      {result && (
        <GreedyCounterModal
          battle={result.battles.reverse()[0]}
          battleNum={result.battles.length - 1}
          greedySettings={userSettings.greedySettings}
          setUserSettings={setUserSettings}
          onCloseQuickPreview={() => setResult(null)}
          primary={false}
          quickView={true}
        />
      )}
    </Box>
  );
}
