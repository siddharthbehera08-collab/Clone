const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const { startCronJobs } = require("./cron");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Error handler (must be last)
app.use(errorHandler);

// Start background cron jobs
startCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
