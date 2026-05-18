import React, { useState, useEffect } from "react";
import {
  Box,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../navbar/navbar";
import Sidebar from "./Sidebar";
import { fetchWithAuth } from "../../utils/api";

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // ตรวจสอบก่อนว่ามีข้อมูลใน localStorage หรือไม่เพื่อความเร็วสูงสุด
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        // เรายังคงเรียก fetch เพื่ออัปเดตข้อมูลในพื้นหลัง (ถ้ามี Cache ใน api.js มันจะเร็วมาก)
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // ใช้ cache: true เฉพาะข้อมูล user-info ตามคำขอ
        const response = await fetchWithAuth("/users/user-info", { useCache: true });
        
        if (!response) return; 

        const result = await response.json();
        if (response.ok && result.status === 200) {
          setUser(result.data);
          localStorage.setItem("user", JSON.stringify(result.data));
        }
      } catch (err) {
        console.error("SidebarLayout: Failed to fetch user info", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-10 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
        </div>
        <p className="mt-4 font-black text-gray-400 uppercase tracking-widest text-[10px] animate-pulse">
          กำลังเตรียมข้อมูลระบบ...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <CssBaseline />

        {/* Navbar Component */}
        <Navbar onMenuToggle={handleMenuToggle} user={user} />

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
              p: 0, 
              bgcolor: "background.default",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <Outlet context={{ user }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SidebarLayout;
