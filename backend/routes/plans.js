const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Plan = require("../models/Plan");
const { generatePlan } = require("../controllers/aiController");

//
// POST /api/plans/generate
//
router.post("/generate", auth, async (req, res) => {
  try {
    const { type, extraGoal } = req.body;

    if (!type || !["workout", "meal"].includes(type)) {
      return res.status(400).json({ msg: "type must be 'workout' or 'meal'" });
    }

    const { text, structuredMeals, structuredWorkouts } = await generatePlan({
      userId: req.userId,
      type,
      extraGoal
    });

    const title = `${type === "workout" ? "Workout" : "Meal"} plan - ${new Date().toLocaleDateString()}`;

    const plan = await Plan.create({
      user: req.userId,
      type,
      title,
      content: text,
      extraGoal: extraGoal || "",
      structuredMeals: type === "meal" ? structuredMeals : [],
      structuredWorkouts: type === "workout" ? structuredWorkouts : []
    });

    res.json(plan);
  } catch (err) {
    console.error("Generate plan error:", err);
    if (err.message && err.message.includes("Profile not found")) {
      return res.status(400).json({ msg: err.message });
    }
    res
      .status(500)
      .json({ msg: "Failed to generate plan", error: err.message || String(err) });
  }
});

//
// GET /api/plans
//
router.get("/", auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// GET /api/plans/latest (meal)
//
router.get("/latest", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({
      user: req.userId,
      type: "meal"
    }).sort({ createdAt: -1 });

    res.json(plan || null);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// GET /api/plans/latest-workout
//
router.get("/latest-workout", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({
      user: req.userId,
      type: "workout"
    }).sort({ createdAt: -1 });

    res.json(plan || null);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// GET /api/plans/:id
//
router.get("/:id", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.userId });
    if (!plan) return res.status(404).json({ msg: "Plan not found" });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// PUT /api/plans/:id
// Update structuredMeals or structuredWorkouts
//
router.put("/:id", auth, async (req, res) => {
  try {
    const update = {};
    if (req.body.structuredMeals) update.structuredMeals = req.body.structuredMeals;
    if (req.body.structuredWorkouts)
      update.structuredWorkouts = req.body.structuredWorkouts;

    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true }
    );
    if (!plan) return res.status(404).json({ msg: "Plan not found" });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// DELETE /api/plans/:id
//
router.delete("/:id", auth, async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!plan) {
      return res.status(404).json({ msg: "Plan not found" });
    }

    res.json({ msg: "Plan deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//
// POST /api/plans/:id/regenerate
//
router.post("/:id/regenerate", auth, async (req, res) => {
  try {
    const basePlan = await Plan.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!basePlan) {
      return res.status(404).json({ msg: "Base plan not found" });
    }

    const body = req.body || {};
    const newExtraGoal = body.extraGoal ?? basePlan.extraGoal ?? "";

    const { text, structuredMeals, structuredWorkouts } = await generatePlan({
      userId: req.userId,
      type: basePlan.type,
      extraGoal: newExtraGoal
    });

    const title = `${
      basePlan.type === "workout" ? "Workout" : "Meal"
    } plan (regenerated) - ${new Date().toLocaleDateString()}`;

    const newPlan = await Plan.create({
      user: req.userId,
      type: basePlan.type,
      title,
      content: text,
      extraGoal: newExtraGoal,
      structuredMeals: basePlan.type === "meal" ? structuredMeals : [],
      structuredWorkouts: basePlan.type === "workout" ? structuredWorkouts : []
    });

    res.json(newPlan);
  } catch (err) {
    console.error("Regenerate plan error:", err);
    if (err.message && err.message.includes("Profile not found")) {
      return res.status(400).json({ msg: err.message });
    }
    res
      .status(500)
      .json({ msg: "Failed to regenerate plan", error: err.message || String(err) });
  }
});

module.exports = router;
