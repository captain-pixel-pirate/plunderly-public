/** Core framework */
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { usePathname } from "next/navigation";

/** UI library imports */
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  Tooltip,
  MenuItem,
  Divider,
  ListSubheader,
  Select,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FiSettings } from "react-icons/fi";
import { FaExchangeAlt } from "react-icons/fa";
import MenuIcon from "@mui/icons-material/Menu";

/** Internal project imports */
import {
  useGlobalContext,
  useThemeMode,
  useNotificationContext,
  useLoadingContext,
} from "@context";
import { Employer, Worker } from "@interfaces";
import { THEMES } from "@theme/theme";
import changelogJson from "@data/changelog.json";
import api from "@utils/api";

/** Local component imports */
import { ConfirmDialog } from "@components/ux";
import { EditCostsModal } from "@components/recipes";
import CopyScoreSettingsModal from "./CopyScoreSettingsModal";
import MailFeedback from "./MailFeedback";
import ImportWorkerJson from "./ImportWorkerJson";
import ChangelogModal, { ChangelogEntry } from "./ChangeLog";

const pages = [
  { name: "First Mate", link: "/first-mate" },
  { name: "Greedy Counter+", link: "/greedy-counter" },
  { name: "Shoppe Recipes", link: "/shoppe-recipes" },
  { name: "Labor Management", link: "/labor-management" },
  { name: "Commodities & Markets", link: "/commodity-markets" },
];

const ResponsiveAppBar: React.FC = () => {
  const [openMailFeedback, setOpenMailFeedback] = useState(false);
  const [openChangelog, setOpenChangelog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const { addAlertMessage } = useNotificationContext();
  const { setIsPageLoading } = useLoadingContext();
  const theme = useTheme();
  const { userSettings, setUserSettings, commods, labor, setLabor } =
    useGlobalContext();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const { mode, setMode } = useThemeMode();

  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function handleMailFeedbackSubmit({
    category,
    message,
  }: {
    category: string;
    message: string;
  }) {
    setIsPageLoading(true);
    try {
      const response = await api.post("/feedback", {
        category,
        message,
      });
      if (response.status === 200) {
        addAlertMessage({
          text: "Feedback submitted successfully!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      addAlertMessage({
        text: "Failed to submit feedback. Please try again later.",
        severity: "error",
      });
    }
    setIsPageLoading(false);
    setOpenMailFeedback(false);
  }

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleToggleOcean = () => {
    const oceans = ["Emerald", "Meridian", "Cerulean"] as const;
    const currentIndex = oceans.indexOf(userSettings.ocean);
    setUserSettings((us) => ({
      ...us,
      ocean: oceans[(currentIndex + 1) % oceans.length],
    }));

    addAlertMessage({
      text: `Changed configured ocean to ${
        oceans[(currentIndex + 1) % oceans.length]
      }.`,
      severity: "success",
    });
  };

  const deleteWorkers = () => {
    setLabor((L) => ({
      ...L,
      activeWorkers: [],
      dormantWorkers: [],
      employers: [],
    }));

    addAlertMessage({ text: "Labor data deleted.", severity: "success" });
    setOpenConfirmDialog((OCD) => !OCD);
  };

  const downloadJson = (
    workers: Worker[],
    employers: Employer[],
    filename = "workers.json"
  ) => {
    const payload = {
      app: "plunderly",
      workers,
      employers,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleYaargRefresh = async () => {
    setIsPageLoading(true);
    try {
      const response = await api.post("/yaarg/refresh");
      if (response.status === 200) {
        addAlertMessage({
          text: "YARRG data refreshed successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Error: ", err.response?.data.error);
        addAlertMessage({
          severity: "error",
          text: err.response?.data?.error,
        });
      } else {
        console.error("Failed to fetch crafting skills", err);
        addAlertMessage({
          severity: "error",
          text: "Failed to fetch crafting skills.",
        });
      }
    }
    setIsPageLoading(false);
  };

  const referenceTaxCommod = commods.items.length
    ? commods.items.find((c) => c.commodname === "Wood")
    : undefined;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backdropFilter: "saturate(180%) blur(20px)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
      id="app-bar-mui"
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              mr: 2,
            }}
          >
            <Image
              src="/images/logo/plunderly_2.png"
              alt="Logo"
              width={30}
              height={30}
            />
            <Typography
              variant="h6"
              component="a"
              href="/"
              sx={{
                ml: 1,
                fontFamily: "monospace",
                fontWeight: "bold",
                letterSpacing: ".3rem",
                textDecoration: "none",
              }}
              color="primary"
            >
              Plunderly
            </Typography>
          </Box>

          {/* Mobile nav icon */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              onClick={handleOpenNavMenu}
              sx={{ color: theme.palette.common.white }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => {
                const active = isActive(page.link);
                return (
                  <Link
                    key={page.name}
                    href={page.link}
                    passHref
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <MenuItem
                      onClick={handleCloseNavMenu}
                      selected={active}
                      aria-current={active ? "page" : undefined}
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.secondary.main, 0.12),
                          fontWeight: 600,
                        },
                        "&.Mui-selected:hover": {
                          bgcolor: alpha(theme.palette.secondary.main, 0.18),
                        },
                      }}
                    >
                      <Typography>{page.name}</Typography>
                    </MenuItem>
                  </Link>
                );
              })}
            </Menu>
          </Box>

          {/* Logo & Title xs */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              mr: 1,
            }}
          >
            <Image
              src="/images/logo/plunderly_2.png"
              alt="Logo"
              width={30}
              height={30}
            />
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              ml: 1,
              fontWeight: "bold",
              letterSpacing: ".3rem",
              textDecoration: "none",
            }}
            color="primary"
          >
            Plunderly
          </Typography>

          {/* Desktop nav buttons */}
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 2 }}
          >
            {pages.map((page) => {
              const active = isActive(page.link);
              return (
                <Link
                  key={page.name}
                  href={page.link}
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    onClick={handleCloseNavMenu}
                    aria-current={active ? "page" : undefined}
                    sx={{
                      color: theme.palette.common.white,
                      fontWeight: active ? 700 : 500,
                      textTransform: "none",
                      position: "relative",
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: 4,
                        height: 2,
                        width: active ? "100%" : 0,
                        bgcolor: theme.palette.secondary.main,
                        transition: "width 0.3s",
                      },
                      "&:hover:after": {
                        width: "100%",
                      },
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    {page.name}
                  </Button>
                </Link>
              );
            })}
          </Box>

          {/* SETTINGS MENU */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0,
                  color: theme.palette.common.white,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                  },
                  transition: "background 0.3s",
                }}
              >
                <FiSettings />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <ListSubheader
                sx={{
                  bgcolor: "transparent",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                Shoppe Recipes
              </ListSubheader>
              <EditCostsModal type="MenuItem" shoppeType="shipyard" />
              <MenuItem onClick={handleToggleOcean}>
                <Typography display="flex" alignItems="center" gap={1}>
                  Ocean: <b>{userSettings.ocean}</b>
                  <FaExchangeAlt size={16} />
                </Typography>
              </MenuItem>
              <Divider />
              <ListSubheader
                sx={{
                  bgcolor: "transparent",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                First Mate
              </ListSubheader>
              <CopyScoreSettingsModal type="MenuItem" />
              <Divider />
              <ListSubheader
                sx={{
                  bgcolor: "transparent",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                Data
              </ListSubheader>
              <MenuItem
                onClick={() => {
                  downloadJson(
                    labor.activeWorkers,
                    labor.employers,
                    "workers.json"
                  );
                }}
              >
                Export Labor
              </MenuItem>
              <ImportWorkerJson />
              <MenuItem
                onClick={() => {
                  setOpenConfirmDialog(true);
                }}
              >
                Delete Labor
              </MenuItem>
              <MenuItem
                onClick={handleYaargRefresh}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Refresh YARRG Data
              </MenuItem>
              <MenuItem
                sx={{
                  bgcolor: "transparent",
                  color: theme.palette.text.secondary,
                }}
                disabled
              >
                Taxes Updated:{" "}
                {referenceTaxCommod?.updatedAt &&
                  new Date(referenceTaxCommod.updatedAt).toLocaleString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                    }
                  )}
              </MenuItem>
              <Divider />
              <ListSubheader
                sx={{
                  bgcolor: "transparent",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                Contact and Info
              </ListSubheader>
              <MenuItem
                onClick={() => {
                  setOpenMailFeedback(true);
                }}
              >
                Send Feedback
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenChangelog(true);
                }}
              >
                Changelog
              </MenuItem>

              <MenuItem
                sx={{
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ paddingRight: ".8rem" }}>Theme: </span>
                <Select
                  variant="standard"
                  size="small"
                  value={mode}
                  onChange={(e) =>
                    setMode(e.target.value as keyof typeof THEMES)
                  }
                  sx={{ minWidth: 100 }}
                >
                  {Object.keys(THEMES).map((k) => (
                    <MenuItem key={k} value={k}>
                      {k}
                    </MenuItem>
                  ))}
                </Select>
              </MenuItem>
              <MenuItem
                sx={{
                  bgcolor: "transparent",
                  color: theme.palette.text.secondary,
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                <Box component="span" sx={{ pr: 0.5 }}>
                  Created by
                </Box>
                <Box
                  component="a"
                  href="https://emerald.puzzlepirates.com/yoweb/pirate.wm?classic=false&target=Chimpanze"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "inherit",
                    textDecoration: "underline",
                    fontWeight: 500,
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Chimpanze{" "}
                  <Box
                    sx={{
                      display: "inline-block",
                      verticalAlign: "middle",
                      marginLeft: 1,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/icons/chimpanze_1.png"
                      alt="Chimpanze Logo"
                      width={20}
                      height={20}
                      style={{ display: "block" }}
                    />
                  </Box>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      <MailFeedback
        open={openMailFeedback}
        handleClose={() => setOpenMailFeedback(false)}
        onSubmit={handleMailFeedbackSubmit}
      />
      <ChangelogModal
        open={openChangelog}
        onClose={() => setOpenChangelog(false)}
        changelog={changelogJson as ChangelogEntry[]}
      />
      {openConfirmDialog && (
        <ConfirmDialog
          open
          onConfirm={deleteWorkers}
          onClose={() => {
            setOpenConfirmDialog((OCD) => !OCD);
          }}
          message="This action is permanent and cannot be undone."
          title="Delete all workers and employers?"
        />
      )}
    </AppBar>
  );
};

export default ResponsiveAppBar;
