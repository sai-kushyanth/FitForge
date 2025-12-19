const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require("../models/Profile");
const parseMealPlan = require("../utils/parseMeals");
const parseWorkoutPlan = require("../utils/parseWorkouts");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate a workout or meal plan using Gemini and user's profile.
 * Returns plan text + structuredMeals / structuredWorkouts.
 */
async function generatePlan({ userId, type, extraGoal }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new Error("Profile not found. Please create your fitness profile first.");
  }

  const goalText =
    profile.goal === "lose_weight"
      ? "lose body fat and weight"
      : profile.goal === "gain_muscle"
      ? "gain muscle and strength"
      : "maintain current body composition";

  const baseProfileText = `
User profile:
- Age: ${profile.age || "unknown"}
- Gender: ${profile.gender || "unknown"}
- Height: ${profile.height || "unknown"} cm
- Weight: ${profile.weight || "unknown"} kg
- Activity level: ${profile.activityLevel || "unknown"}
- Goal: ${goalText}

Additional user instructions (if any): ${extraGoal || "none"}
`.trim();

  let prompt;

  if (type === "workout") {
    // STRICT workout format with VIDEO + STEPS
    prompt = `
You are a certified strength and conditioning coach.

${baseProfileText}

Task:
Generate a detailed 7-day workout plan.

For EACH DAY:
- Include 4–6 exercises (compound + accessory).
- Use safe, realistic gym or home exercises.

STRICT FORMAT (VERY IMPORTANT):

Day 1:
- Squats | 4 x 8–10 reps | 90 | VIDEO: https://www.youtube.com/results?search_query=squat+exercise | STEPS: 1. Stand with feet shoulder-width. 2. Sit hips back and down. 3. Keep chest up. 4. Drive through heels to stand.
- Bench press | 4 x 8–10 reps | 90 | VIDEO: https://www.youtube.com/results?search_query=bench+press+exercise | STEPS: 1. Lie on bench. 2. Grip slightly wider than shoulders. 3. Lower bar to chest. 4. Press back up.

Day 2:
- ...

Rules:
- ALWAYS use this pattern for EACH exercise line:
  "- Exercise name | sets x reps (or time) | restSecondsOnly | VIDEO: link | STEPS: short numbered steps"
- "restSecondsOnly" must be just a number (e.g. "90", "60", "45"), no text.
- VIDEO should usually be a YouTube search URL, e.g. "https://www.youtube.com/results?search_query=romanian+deadlift+exercise".
- STEPS should be a short 2–6 step description (e.g. "1. ... 2. ...").
- Clearly separate days using "Day 1:", "Day 2:", etc.
- Also provide the full plan in readable markdown so humans can read it easily.
`.trim();
  } else {
    // Meal plan with strict format we already use
    prompt = `
You are a helpful nutrition coach.

${baseProfileText}

Task:
Generate a detailed 7-day meal plan for this user.

For EACH DAY, include:
- Breakfast
- 1–2 Snacks
- Lunch
- Dinner

STRICT FORMAT (very important):
Write each day like this:

Day 1:
- Breakfast: Oats with milk and banana | 250 g | 350 kcal
- Snack: Apple | 1 medium (150 g) | 80 kcal
- Lunch: Grilled paneer with brown rice | 350 g | 650 kcal
- Snack: Mixed nuts | 30 g | 180 kcal
- Dinner: Vegetable dal with roti | 300 g | 500 kcal

Day 2:
- ...

Rules:
- ALWAYS use this pattern: "Meal name | quantity | calories".
- Quantity realistic (e.g. "200 g", "2 chapatis", "1 bowl").
- Calories = number + "kcal" (e.g. "350 kcal").
- Separate days: "Day 1:", "Day 2:", etc.
- Also provide the full plan in clear markdown.
`.trim();
  }

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text ? response.text() : response.text;

  let structuredMeals = [];
  let structuredWorkouts = [];

  if (type === "meal") {
    structuredMeals = parseMealPlan(text);
  } else if (type === "workout") {
    structuredWorkouts = parseWorkoutPlan(text);
  }

  return { text, structuredMeals, structuredWorkouts };
}

/**
 * Chat-style AI coach answer using user's profile.
 */
async function chatWithCoach({ userId, message }) {
  if (!message || !message.trim()) {
    throw new Error("Message is empty");
  }

  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new Error("Profile not found. Please create your fitness profile first.");
  }

  const profileSummary = `
User profile:
- Age: ${profile.age || "N/A"}
- Gender: ${profile.gender || "N/A"}
- Height: ${profile.height || "N/A"} cm
- Weight: ${profile.weight || "N/A"} kg
- Activity level: ${profile.activityLevel || "N/A"}
- Goal: ${profile.goal || "N/A"}
`;

  const prompt = `
You are a friendly, practical fitness and nutrition coach.

Use the user's profile to personalise your advice.
Be specific, safe, and clear. Avoid medical claims; if something seems medical, ask them to consult a doctor.

User question:
"${message}"

${profileSummary}
`.trim();

  const result = await model.generateContent(prompt);
  const resp = result.response;
  const text = resp.text ? resp.text() : resp.text;

  return text;
}

module.exports = {
  generatePlan,
  chatWithCoach
};
