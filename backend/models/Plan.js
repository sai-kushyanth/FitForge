const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema({
  name: String,
  quantity: { type: String, default: "1 serving" },
  calories: { type: Number, default: 300 },
  done: { type: Boolean, default: false }
});

const DaySchema = new mongoose.Schema({
  day: Number,
  meals: [MealSchema]
});

const WorkoutExerciseSchema = new mongoose.Schema({
  name: String,
  setsReps: String,          // e.g. "4 x 8–10 reps"
  restSeconds: { type: Number, default: 60 },
  videoUrl: { type: String, default: "" }, // YouTube or any link
  steps: { type: String, default: "" },    // Short instructions
  done: { type: Boolean, default: false }
});

const WorkoutDaySchema = new mongoose.Schema({
  day: Number,
  exercises: [WorkoutExerciseSchema]
});

const PlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["workout", "meal"], required: true },
    title: String,
    content: String,         // full markdown from Gemini
    extraGoal: String,
    structuredMeals: [DaySchema],          // for meal plans
    structuredWorkouts: [WorkoutDaySchema] // for workout plans
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", PlanSchema);
