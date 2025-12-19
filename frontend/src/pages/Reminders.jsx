import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import "./Reminders.css";

export default function Reminders({ user }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newMeal, setNewMeal] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchLatest = async () => {
      try {
        const res = await api.get("/plans/latest");
        setPlan(res.data);
      } catch (err) {
        setError("Failed to load meal plan");
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [user, navigate]);

  const toggleMeal = async (dayIdx, mealIdx) => {
    if (!plan) return;
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredMeals[dayIdx].meals[mealIdx].done = !updated.structuredMeals[dayIdx].meals[mealIdx].done;
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredMeals: updated.structuredMeals });
    } catch (err) {
      setError("Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPlan = async () => {
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredMeals = updated.structuredMeals.map(day => ({
        ...day,
        meals: day.meals.map(m => ({ ...m, done: false }))
      }));
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredMeals: updated.structuredMeals });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to reset plan");
    } finally {
      setSaving(false);
    }
  };

  const handleNewMealChange = (dayIdx, field, value) => {
    setNewMeal(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: field === "calories" ? Number(value) : value }
    }));
  };

  const addMeal = async (dayIdx) => {
    const form = newMeal[dayIdx] || {};
    if (!form.name || !form.quantity) return alert("Please fill in meal details.");
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredMeals[dayIdx].meals.push({ ...form, done: false });
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredMeals: updated.structuredMeals });
      setNewMeal(prev => ({ ...prev, [dayIdx]: { name: "", quantity: "", calories: "" } }));
    } catch (err) {
      setError("Failed to add meal");
    } finally {
      setSaving(false);
    }
  };

  const deleteMeal = async (dayIdx, mealIdx) => {
    if (!window.confirm("Remove this meal?")) return;
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredMeals[dayIdx].meals.splice(mealIdx, 1);
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredMeals: updated.structuredMeals });
    } catch (err) {
      setError("Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="reminders-container">Loading your nutrition tracker...</div>;
  if (!plan?.structuredMeals?.length) {
    return (
      <div className="reminders-container">
        <div className="day-section" style={{textAlign: 'center'}}>
          <h2>🥗 My Meal Plan</h2>
          <p>No active plan found. Ask the AI Coach to generate your diet strategy!</p>
          <button className="btn btn-primary" onClick={() => navigate("/generate-plan")}>Generate Now</button>
        </div>
      </div>
    );
  }

  const allDone = plan.structuredMeals.every(day => day.meals.every(m => m.done));

  return (
    <div className="reminders-container">
      <div className="header-flex">
        <div>
          <h2 className="page-title">🥗 Nutrition Tracker</h2>
          <p className="page-subtitle">Track your meals and hit your macros.</p>
        </div>
        {saving && <span className="saving-tag">Saving...</span>}
      </div>

      {error && <div className="status-msg msg-error">{error}</div>}

      {plan.structuredMeals.map((day, d) => {
        const form = newMeal[d] || { name: "", quantity: "", calories: "" };
        return (
          <div key={d} className="day-section">
            <h3 className="day-title">Day {day.day}</h3>
            <table className="meal-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Quantity</th>
                  <th>Kcal</th>
                  <th style={{ textAlign: "center" }}>Done</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {day.meals.map((meal, i) => (
                  <tr key={i} className={`meal-row ${meal.done ? 'is-done' : ''}`}>
                    <td><strong>{meal.name}</strong></td>
                    <td>{meal.quantity}</td>
                    <td>{meal.calories}</td>
                    <td style={{ textAlign: "center" }}>
                      <input type="checkbox" checked={!!meal.done} onChange={() => toggleMeal(d, i)} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn-delete" onClick={() => deleteMeal(d, i)}>Remove</button>
                    </td>
                  </tr>
                ))}
                <tr className="add-row">
                  <td><input className="inline-input" placeholder="New meal..." value={form.name} onChange={e => handleNewMealChange(d, "name", e.target.value)} /></td>
                  <td><input className="inline-input" placeholder="Qty" value={form.quantity} onChange={e => handleNewMealChange(d, "quantity", e.target.value)} /></td>
                  <td><input className="inline-input" type="number" placeholder="0" value={form.calories} onChange={e => handleNewMealChange(d, "calories", e.target.value)} /></td>
                  <td></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => addMeal(d)}>Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      {allDone && (
        <div className="congrats-card meal-success">
          <div className="congrats-icon">🎉</div>
          <h2>Week Complete!</h2>
          <p>You stayed 100% consistent with your nutrition. Ready for a new challenge?</p>
          <div className="congrats-actions">
            <button className="btn btn-primary" onClick={handleResetPlan} disabled={saving}>
              {saving ? 'Resetting...' : 'Continue This Plan'}
            </button>
            <button className="btn-outline-custom" onClick={() => navigate("/generate-plan")}>Generate New Plan</button>
          </div>
        </div>
      )}
    </div>
  );
}