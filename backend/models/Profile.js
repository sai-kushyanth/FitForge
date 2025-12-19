const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  height: Number, // in cm
  weight: Number, // in kg
  activityLevel: {
    type: String,
    enum: ["low", "moderate", "high"]
  },
  goal: {
    type: String,
    enum: ["lose_weight", "gain_muscle", "maintain"]
  }
});

module.exports = mongoose.model("Profile", ProfileSchema);
