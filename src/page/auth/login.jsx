import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Link,
  Paper,
  Grid, // Import standard Grid
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Custom Google Icon
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

// Healthcare SVG Illustration
const HealthcareSVG = () => (
  <svg
    width="100%"
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="250" cy="250" r="200" fill="#E3F2FD" />
    <path
      d="M350 250H150"
      stroke="#3b82f6"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <path
      d="M250 150V350"
      stroke="#3b82f6"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <circle
      cx="250"
      cy="250"
      r="180"
      stroke="#3b82f6"
      strokeWidth="2"
      strokeDasharray="10 10"
    />
    <rect x="230" y="230" width="40" height="40" fill="white" />
    <path
      d="M240 250H260M250 240V260"
      stroke="#EF4444"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M180 180C200 160 300 160 320 180"
      stroke="#90CAF9"
      strokeWidth="10"
      strokeLinecap="round"
      opacity="0.5"
    />
    <path
      d="M180 320C200 340 300 340 320 320"
      stroke="#90CAF9"
      strokeWidth="10"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const theme = createTheme({
  typography: {
    fontFamily: '"Sarabun", sans-serif',
  },
  palette: {
    primary: {
      main: "#3b82f6",
    },
  },
});

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/main");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", display: "flex", width: "100%" }}>
        <Grid container sx={{ flexGrow: 1, width: "100%" }}>
          {/* Left Side: 50% */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              bgcolor: "#ffffff",
            }}
          >
            <Box sx={{ maxWidth: 400, width: "100%" }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please enter your details
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="#111827"
                  gutterBottom
                >
                  Welcome back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Healthcare Management System
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  required
                  id="email"
                  placeholder="name@company.com"
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label={
                      <Typography variant="body2">
                        Remember for 30 days
                      </Typography>
                    }
                  />
                  <Link href="#" variant="body2" underline="hover">
                    Forgot password
                  </Link>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    py: 1.5,
                    mb: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  Sign in
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{
                    py: 1.5,
                    mb: 4,
                    textTransform: "none",
                    color: "#374151",
                    borderColor: "#e5e7eb",
                  }}
                >
                  Sign in with Google
                </Button>

                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                >
                  Don't have an account?{" "}
                  <Link href="#" fontWeight="bold" underline="hover">
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side: 50% with SVG */}
          <Grid
            size={{ xs: 0, md: 6 }}
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#f8fafc",
              borderLeft: "1px solid #e2e8f0",
              p: 6,
            }}
          >
            <Box sx={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
              <HealthcareSVG />
              <Typography
                variant="h4"
                fontWeight="bold"
                color="#1e293b"
                sx={{ mt: 4, mb: 2 }}
              >
                Digital Health Solutions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Empowering healthcare providers with modern technology to
                deliver better patient care.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
