const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Progress = require("../models/Progress");

// Add new progress entry
router.post("/", auth, async (req, res) => {
  try {
    const progress = await Progress.create({ user: req.userId, ...req.body });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Get progress history for user
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Progress.find({ user: req.userId }).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;
