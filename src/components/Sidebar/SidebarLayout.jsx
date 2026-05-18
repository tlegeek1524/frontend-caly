import React, { useState } from "react";
import {
  Box,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/navbar";
import Sidebar from "./Sidebar";

const defaultTheme = createTheme({
  typography: {
    fontFamily: '"Sarabun", sans-serif',
  },
  palette: {
    primary: {
      main: "#3b82f6",
    },
    background: {
      default: "#f8fafc",
    },
  },
});

const SidebarLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <CssBaseline />

        {/* Navbar Component */}
        <Navbar onMenuToggle={handleMenuToggle} />

        {/* Spacer for Fixed AppBar */}
        <Toolbar />

        {/* Main Content Container */}
        <Box sx={{ position: "relative", flexGrow: 1, display: "flex" }}>
          {/* Sidebar Component */}
          <Sidebar isOpen={isMenuOpen} onClose={handleMenuClose} />

          {/* Dynamic Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              bgcolor: "background.default",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SidebarLayout;
