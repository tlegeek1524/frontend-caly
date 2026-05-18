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
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuToggle, user }) => {
  const navigate = useNavigate();

  const handlePortalExit = () => {
    navigate("/portal");
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
            sx={{ fontWeight: 600, color: "#1e293b", fontSize: "0.95rem" }}
          >
            {user?.full_name || 'Guest'}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handlePortalExit}
            sx={{
              textTransform: "none",
              borderColor: "#e5e7eb",
              color: "#1e293b", 
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#3b82f6",
                bgcolor: "rgba(59, 130, 246, 0.04)",
              },
            }}
          >
            Portal
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
