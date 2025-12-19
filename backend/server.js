require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("Fitness AI backend running");
});

// auth routes
app.use("/api/auth", require("./routes/auth"));

// profile routes
app.use("/api/profile", require("./routes/profile"));

// plans routes (AI)
app.use("/api/plans", require("./routes/plans"));

//progress tracker
app.use("/api/progress", require("./routes/progress"));

//AI chatbot
app.use("/api/chat", require("./routes/chat"))



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
