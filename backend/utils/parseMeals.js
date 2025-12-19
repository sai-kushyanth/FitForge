// Parse Gemini meal plan text into structured days + meals.
//
// Expected format for each meal line (we enforce this via prompt):
// Day 1:
// - Breakfast: Oats with milk | 250 g | 350 kcal
// - Snack: Apple | 1 medium (150 g) | 80 kcal
//
// We will:
//  - Detect "Day X" headings
//  - For each line starting with "-" and containing "|" split into:
//    name | quantity | calories

function parseMealPlan(text) {
  const lines = text.split("\n");

  const days = [];
  let currentDay = null;
  let currentDayNumber = 0;

  const startNewDay = (dayNum) => {
    if (currentDay && currentDay.meals.length > 0) {
      days.push(currentDay);
    }
    currentDayNumber = dayNum;
    currentDay = { day: currentDayNumber, meals: [] };
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Detect day headings like "Day 1:" or "## Day 1"
    const dayMatch = line.match(/day\s+(\d+)/i);
    if (dayMatch) {
      const dNum = parseInt(dayMatch[1], 10) || (currentDayNumber + 1);
      startNewDay(dNum);
      continue;
    }

    // Detect meal lines starting with "-" and containing "|"
    if (line.startsWith("-") && line.includes("|") && currentDay) {
      const cleaned = line.replace(/^-+\s*/, ""); // remove starting "- "
      const parts = cleaned.split("|").map((p) => p.trim());

      // parts[0] => "Breakfast: Oats with milk"
      // parts[1] => "250 g"
      // parts[2] => "350 kcal"
      const namePart = parts[0] || "Meal";
      const quantityPart = parts[1] || "1 serving";
      const caloriesPart = parts[2] || "";

      let calories = 300;
      const calMatch = caloriesPart.match(/(\d+)/);
      if (calMatch) {
        calories = parseInt(calMatch[1], 10);
      }

      currentDay.meals.push({
        name: namePart,
        quantity: quantityPart,
        calories,
        done: false,
      });
    }
  }

  // Push last day
  if (currentDay && currentDay.meals.length > 0) {
    days.push(currentDay);
  }

  // Fallback: if parsing totally failed, create a simple generic 7-day plan
  if (days.length === 0) {
    for (let d = 1; d <= 7; d++) {
      days.push({
        day: d,
        meals: [
          {
            name: "Breakfast",
            quantity: "1 serving",
            calories: 350,
            done: false,
          },
          {
            name: "Lunch",
            quantity: "1 serving",
            calories: 600,
            done: false,
          },
          {
            name: "Dinner",
            quantity: "1 serving",
            calories: 450,
            done: false,
          },
        ],
      });
    }
  }

  return days;
}

module.exports = parseMealPlan;
