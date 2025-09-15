const PATTERNS = {
  battleStart: [/You intercepted the/, /You have been intercepted by the/],
  battleEnd: [/The victors plundered/],
  elimination: /\[\d{2}:\d{2}:\d{2}\]\s(.+?)\s+is eliminated!/,
  sink: /The ship has been sunk!/,
  greedyPurse:
    /^\[\d{2}:\d{2}:\d{2}\]\sYe slash open the purse to find\s+(\d+)\s+pieces of eight/,
  greedyStrike:
    /\[\d{2}:\d{2}:\d{2}\]\s(.+?)\s(?:swing|perform|execute|deliver)s a/,
  timestamp: /\[\d{2}:\d{2}:\d{2}\]\s*/,
  number: /[\d,]+/g,
};

const {
  battleStart,
  battleEnd,
  elimination,
  sink,
  greedyPurse,
  greedyStrike,
  timestamp,
  number: numberPattern,
} = PATTERNS;

function extractPlunderedGoods(line) {
  const text = line.replace(timestamp, "");
  const matches = text.match(numberPattern) || [];
  const [poe = "0", goods = "0"] = matches;
  return {
    piecesOfEight: parseInt(poe.replace(/,/g, ""), 10),
    unitsOfGoods: parseInt(goods.replace(/,/g, ""), 10),
  };
}

function isBattleStart(line) {
  return battleStart.some((r) => r.test(line));
}

function isBattleEnd(line) {
  return battleEnd.some((r) => r.test(line));
}

function extractBattlesAndStats(lines) {
  const battles = [];
  let sinks = 0;
  let greedyPursesOpened = 0;
  let greedyPursesEarnings = 0;
  let startIndex = null;
  let sawStart = false;

  lines.forEach((line, idx) => {
    if (sink.test(line)) sinks++;

    const purseMatch = line.match(greedyPurse);
    if (purseMatch) {
      greedyPursesOpened++;
      greedyPursesEarnings += parseInt(purseMatch[1], 10);
    }

    if (isBattleStart(line)) {
      sawStart = true;
      if (startIndex !== null) {
        battles.push({ logs: lines.slice(startIndex, idx) });
      }
      startIndex = idx;
    }

    if (isBattleEnd(line)) {
      if (startIndex !== null) {
        battles.push({ logs: lines.slice(startIndex, idx + 1) });
        startIndex = null;
      } else if (!sawStart) {
        battles.push({ logs: lines.slice(0, idx + 1) });
      }
    }
  });

  if (startIndex !== null) {
    battles.push({ logs: lines.slice(startIndex) });
  }

  return { battles, sinks, greedyPursesOpened, greedyPursesEarnings };
}

function wasBattleWon(line) {
  const winnersPart = line.split("Winners: ")[1];
  if (!winnersPart) return false;
  return winnersPart.split(",").some((n) => !n.trim().includes(" "));
}

function analyzeBattle(logs) {
  const winnerLine = logs.find((l) => l.includes("Winners:"));
  const won = winnerLine ? wasBattleWon(winnerLine) : null;

  const eliminations = logs
    .map((line) => {
      const m = line.match(elimination);
      return m ? m[1] : null;
    })
    .filter(Boolean);

  const winners = winnerLine
    ? winnerLine
        .split("Winners: ")[1]
        .split(",")
        .map((s) => s.trim())
    : [];

  const successCount = winners.length;
  const failureCount = eliminations.filter(
    (name) => !winners.includes(name)
  ).length;

  const fray =
    won === null
      ? null
      : {
          attackers: won ? successCount : failureCount,
          defenders: won ? failureCount : successCount,
        };

  return { won, winners, eliminations, fray };
}

export async function processChatFile(linesIn) {
  try {
    const lines = linesIn.split(/\r?\n/);
    const { battles, sinks, greedyPursesOpened, greedyPursesEarnings } =
      extractBattlesAndStats(lines);

    const globalGreedyStrikes = {};
    let totalGreedyStrikes = 0;
    let wins = 0;
    let losses = 0;

    battles.forEach(({ logs }, idx) => {
      const { won, fray } = analyzeBattle(logs);

      if (won === true) wins++;
      else if (won === false) losses++;

      const endLine = logs.find(isBattleEnd);
      const { piecesOfEight, unitsOfGoods } = endLine
        ? extractPlunderedGoods(endLine)
        : { piecesOfEight: 0, unitsOfGoods: 0 };

      const greedyStrikes = {};
      logs.forEach((line) => {
        const m = line.match(greedyStrike);
        if (m) {
          const player = m[1];
          greedyStrikes[player] = (greedyStrikes[player] || 0) + 1;
          globalGreedyStrikes[player] = (globalGreedyStrikes[player] || 0) + 1;
          totalGreedyStrikes++;
        }
      });

      Object.assign(battles[idx], {
        won,
        incomplete: won === null,
        players: fray?.attackers ?? 0,
        enemies: fray?.defenders ?? 0,
        poe: piecesOfEight,
        goods: unitsOfGoods,
        greedyStrikes,
      });
    });

    return {
      battles,
      wins,
      losses,
      sinks,
      greedyPursesOpened,
      greedyPursesEarnings,
      globalGreedyStrikes,
    };
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}
