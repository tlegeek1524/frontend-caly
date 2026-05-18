import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { Menu as MenuIcon, Logout as LogoutIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "white",
        color: "#1e293b",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={onMenuToggle}
          edge="start"
          sx={{ marginRight: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          CALY
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, color: "#374151" }}
          >
            User : Admin
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              borderColor: "#e5e7eb",
              color: "#ef4444", // Red color for logout usually indicates a destructive/exit action
              "&:hover": {
                borderColor: "#ef4444",
                bgcolor: "rgba(239, 68, 68, 0.04)",
              },
            }}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
