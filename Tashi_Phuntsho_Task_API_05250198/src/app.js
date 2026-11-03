const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Tashi Phuntsho's Task API",
    studentId: "05250198",
    endpoints: {
      tasks: "/api/tasks",
      health: "/api/health"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

module.exports = app;
