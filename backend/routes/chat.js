const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const { chatWithCoach } = require("../controllers/aiController")

// POST /api/chat
router.post("/", auth, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ msg: "Message is required" })
    }

    const reply = await chatWithCoach({
      userId: req.userId,
      message
    })

    res.json({ reply })
  } catch (err) {
    console.error("Chat error:", err)
    if (err.message && err.message.includes("Profile not found")) {
      return res.status(400).json({ msg: err.message })
    }
    res.status(500).json({
      msg: "Failed to get AI response",
      error: err.message || String(err)
    })
  }
})

module.exports = router
