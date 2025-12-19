const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weight: Number,
  calories: Number,
  workoutCompleted: Boolean,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Progress", ProgressSchema);
