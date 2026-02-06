import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid, // Just import Grid
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  typography: {
    fontFamily: '"Sarabun", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: "#3b82f6",
    },
    background: {
      default: "#f3f4f6",
    },
  },
});

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          flexGrow: 1,
          height: "100vh",
          bgcolor: "background.default",
          overflow: "auto",
        }}
      >
        {/* Navigation Bar */}
        <AppBar
          position="static"
          color="default"
          elevation={1}
          sx={{ bgcolor: "white" }}
        >
          <Toolbar>
            <DashboardIcon
              sx={{ color: "primary.main", mr: 2, fontSize: 30 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold", color: "#111827" }}
            >
              Caly Dashboard
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Grid Container */}
          <Grid container spacing={3}>
            {/* Welcome Banner */}
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  fontWeight="bold"
                >
                  Welcome to Caly!
                </Typography>
                <Typography variant="body1">
                  We are glad to have you back. Here is your overview for today.
                </Typography>
              </Paper>
            </Grid>

            {/* Dashboard Cards */}
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      Statistic {item}
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {(Math.random() * 1000).toFixed(0)} +
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Active Users
                    </Typography>
                    <Typography variant="body2">
                      Growth across different regions in the last 24 hours.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MainPage;
