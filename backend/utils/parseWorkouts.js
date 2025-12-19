// Parse workout plan text into days + exercises.
//
// Expected format for each exercise line (we enforce this via prompt):
//
// Day 1:
// - Squats | 4 x 10 reps | 90 | VIDEO: https://... | STEPS: 1. ... 2. ...
//
// We will:
//  - Detect "Day X" headings
//  - For each line starting with "-" and containing "|" split into parts:
//    name | setsReps | restSeconds | VIDEO: url | STEPS: text

function parseWorkoutPlan(text) {
  const lines = text.split("\n");

  const days = [];
  let currentDay = null;
  let currentDayNumber = 0;

  const startNewDay = (dayNum) => {
    if (currentDay && currentDay.exercises.length > 0) {
      days.push(currentDay);
    }
    currentDayNumber = dayNum;
    currentDay = { day: currentDayNumber, exercises: [] };
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // "Day 1:", "## Day 2", etc.
    const dayMatch = line.match(/day\s+(\d+)/i);
    if (dayMatch) {
      const dNum = parseInt(dayMatch[1], 10) || currentDayNumber + 1;
      startNewDay(dNum);
      continue;
    }

    // Exercise lines starting with "-" and containing "|"
    if (line.startsWith("-") && line.includes("|") && currentDay) {
      // Example:
      // - Squats | 4 x 10 reps | 90 | VIDEO: https://... | STEPS: 1. ...
      const parts = line.split("|").map((p) => p.trim());

      // parts[0] => "- Squats"
      // parts[1] => "4 x 10 reps"
      // parts[2] => "90"
      const name = parts[0].replace(/^-+\s*/, "").trim() || "Exercise";
      const setsReps = parts[1] || "";
      const restRaw = parts[2] || "";
      let restSeconds = parseInt(restRaw, 10);
      if (isNaN(restSeconds)) restSeconds = 60;

      let videoUrl = "";
      let steps = "";

      const videoMatch = line.match(/VIDEO:\s*(https?:\/\/\S+)/i);
      if (videoMatch) {
        videoUrl = videoMatch[1].trim();
      }

      const stepsMatch = line.match(/STEPS:\s*(.*)/i);
      if (stepsMatch) {
        steps = stepsMatch[1].trim();
      }

      currentDay.exercises.push({
        name,
        setsReps,
        restSeconds,
        videoUrl,
        steps,
        done: false
      });
    }
  }

  if (currentDay && currentDay.exercises.length > 0) {
    days.push(currentDay);
  }

  // Fallback dummy data if parsing fails completely
  if (days.length === 0) {
    for (let d = 1; d <= 3; d++) {
      days.push({
        day: d,
        exercises: [
          {
            name: "Squats",
            setsReps: "3 x 10",
            restSeconds: 90,
            videoUrl: "",
            steps: "Stand with feet shoulder-width, sit back and down, then stand up.",
            done: false
          },
          {
            name: "Push-ups",
            setsReps: "3 x 12",
            restSeconds: 60,
            videoUrl: "",
            steps: "Hands under shoulders, lower chest to floor, push back up.",
            done: false
          }
        ]
      });
    }
  }

  return days;
}

module.exports = parseWorkoutPlan;
