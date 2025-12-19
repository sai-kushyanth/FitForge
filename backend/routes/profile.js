const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Profile = require("../models/Profile");

// GET profile
router.get("/", auth,async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    res.json(profile || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// UPDATE or CREATE profile
router.post("/",auth, async (req, res) => {
  try {
    const data = req.body;
    const existing = await Profile.findOne({ user: req.userId });

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return res.json(existing);
    }

    const newProfile = await Profile.create({
      user: req.userId,
      ...data
    });

    res.json(newProfile);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
