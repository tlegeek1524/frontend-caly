import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  Checkbox,
  Chip,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import {
  Users,
  Clock,
  CheckSquare,
  MoreVertical,
  ArrowRight,
  Calendar,
} from "lucide-react";

const MainPage = () => {
  // Mock data for tasks/requests
  const [tasks, setTasks] = useState([
    {
      id: 1,
      requester: "Somchai Jaidee",
      title: "Request for Annual Leave",
      date: "2023-10-25",
      time: "09:30 AM",
      status: "กำลังดำเนินการ",
      avatar: "S",
    },
    {
      id: 2,
      requester: "Suda Rakthai",
      title: "Equipment Requisition: Laptop",
      date: "2023-10-24",
      time: "02:15 PM",
      status: "สำเร็จ",
      avatar: "S",
    },
    {
      id: 3,
      requester: "John Doe",
      title: "System Access Request",
      date: "2023-10-24",
      time: "11:45 AM",
      status: "ยกเลิก",
      avatar: "J",
    },
    {
      id: 4,
      requester: "Jane Smith",
      title: "Budget Approval for Q4",
      date: "2023-10-23",
      time: "04:50 PM",
      status: "กำลังดำเนินการ",
      avatar: "J",
    },
    {
      id: 5,
      requester: "Mana Jaihan",
      title: "Update Project Timeline",
      date: "2023-10-22",
      time: "10:00 AM",
      status: "สำเร็จ",
      avatar: "M",
    },
  ]);

  const [checked, setChecked] = useState([]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ยกเลิก":
        return "error"; // Red
      case "กำลังดำเนินการ":
        return "warning"; // Orange
      case "สำเร็จ":
        return "success"; // Green
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Welcome Banner */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 3,
              backgroundImage:
                "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 20px rgba(37, 99, 235, 0.2)",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              Welcome back, Admin!{" "}
              <span style={{ fontSize: "0.6em", opacity: 0.8 }}>👋</span>
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              You have {tasks.length} pending requests to review today.
            </Typography>
          </Paper>
        </Grid>

        {/* Dashboard Stats */}
        {[
          {
            label: "Total Requests",
            value: "24",
            icon: <Users size={24} />,
            color: "#e0f2fe",
            textColor: "#0369a1",
          },
          {
            label: "Pending Approval",
            value: "12",
            icon: <Clock size={24} />,
            color: "#fef9c3",
            textColor: "#a16207",
          },
          {
            label: "Task Completed",
            value: "85%",
            icon: <CheckSquare size={24} />,
            color: "#dcfce7",
            textColor: "#15803d",
          },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: stat.color,
                      color: stat.textColor,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Button
                    size="small"
                    sx={{ color: "text.secondary", minWidth: "auto" }}
                  >
                    <MoreVertical size={18} />
                  </Button>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Request List */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1e293b" }}
              >
                Recent Requests
              </Typography>
              <Button
                endIcon={<ArrowRight size={16} />}
                sx={{ textTransform: "none" }}
              >
                View All
              </Button>
            </Box>

            <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
              {tasks.map((task, index) => {
                const labelId = `checkbox-list-label-${task.id}`;

                return (
                  <React.Fragment key={task.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        "&:hover": { bgcolor: "#f8fafc" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      {/* Left: Avatar & Text */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flex: 1,
                          minWidth: "200px",
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 40,
                            height: 40,
                            fontSize: 16,
                          }}
                        >
                          {task.avatar}
                        </Avatar>

                        <Box>
                          <Typography
                            id={labelId}
                            variant="subtitle1"
                            fontWeight="600"
                            color="#1e293b"
                          >
                            {task.requester}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.title}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: Date/Time, Status, Checkbox */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        {/* Date & Time */}
                        <Box
                          sx={{
                            display: { xs: "none", md: "flex" },
                            flexDirection: "column",
                            alignItems: "end",
                            minWidth: 100,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                              color: "#64748b",
                            }}
                          >
                            <Calendar size={14} />
                            <Typography variant="caption" fontWeight="500">
                              {task.date}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "#64748b",
                            }}
                          >
                            <Clock size={14} />
                            <Typography variant="caption" fontWeight="500">
                              {task.time}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Status Chip */}
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            fontWeight: 600,
                            height: 24,
                            width: 110, // Fixed width for uniformity
                          }}
                        />

                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: "6px",
                            minWidth: "auto",
                            px: 2,
                            borderColor: "#e2e8f0",
                            color: "#475569",
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "primary.main",
                              color: "primary.main",
                              bgcolor: "#eff6ff",
                            },
                          }}
                        >
                          Read
                        </Button>
                      </Box>
                    </ListItem>
                    {index < tasks.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainPage;
