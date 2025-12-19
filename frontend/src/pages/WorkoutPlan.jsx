import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import "./WorkoutPlan.css";

export default function WorkoutPlan({ user }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newExercise, setNewExercise] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchLatest = async () => {
      try {
        const res = await api.get("/plans/latest-workout");
        setPlan(res.data);
      } catch (err) {
        setError("Failed to load workout plan");
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [user, navigate]);

  useEffect(() => {
    if (!activeTimer) return;
    const id = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.remaining <= 1) return null;
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  const toggleExercise = async (dayIdx, exIdx) => {
    if (!plan) return;
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredWorkouts[dayIdx].exercises[exIdx].done = !updated.structuredWorkouts[dayIdx].exercises[exIdx].done;
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredWorkouts: updated.structuredWorkouts });
    } catch (err) {
      setError("Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleResetWorkout = async () => {
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredWorkouts = updated.structuredWorkouts.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => ({ ...ex, done: false }))
      }));
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredWorkouts: updated.structuredWorkouts });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to reset workout");
    } finally {
      setSaving(false);
    }
  };

  const handleNewExerciseChange = (dayIdx, field, value) => {
    setNewExercise(prev => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: field === "restSeconds" ? Number(value) : value }
    }));
  };

  const addExercise = async (dayIdx) => {
    const form = newExercise[dayIdx] || {};
    if (!form.name || !form.setsReps) return alert("Fill Name and Reps");
    setSaving(true);
    try {
      const updated = { ...plan };
      updated.structuredWorkouts[dayIdx].exercises.push({ ...form, done: false });
      setPlan(updated);
      await api.put(`/plans/${plan._id}`, { structuredWorkouts: updated.structuredWorkouts });
      setNewExercise(prev => ({ ...prev, [dayIdx]: { name: "", setsReps: "", restSeconds: 60, videoUrl: "" } }));
    } catch (err) {
      setError("Failed to add exercise");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="workout-container">Loading your routine...</div>;
  
  if (!plan?.structuredWorkouts?.length) {
    return (
      <div className="workout-container">
        <div className="workout-day-card" style={{textAlign: 'center'}}>
          <h2>🏋️‍♀️ My Workout Plan</h2>
          <p>No active routine found. Let's generate one!</p>
          <button className="btn btn-primary" onClick={() => navigate("/generate-plan")}>Generate Now</button>
        </div>
      </div>
    );
  }

  const allDone = plan.structuredWorkouts.every(day => day.exercises.every(ex => ex.done));

  return (
    <div className="workout-container">
      <div className="header-flex">
        <div>
          <h2 className="page-title">🏋️‍♀️ Training Log</h2>
          <p className="page-subtitle">Track your sets, reps, and recovery.</p>
        </div>
        {saving && <span className="saving-tag">Syncing...</span>}
      </div>

      {plan.structuredWorkouts.map((day, d) => {
        const form = newExercise[d] || { name: "", setsReps: "", restSeconds: 60, videoUrl: "" };
        return (
          <div key={d} className="workout-day-card">
            <h3 className="day-title">Day {day.day}</h3>
            <div style={{overflowX: 'auto'}}>
              <table className="workout-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets x Reps</th>
                    <th>Rest</th>
                    <th>Video Guide</th>
                    <th style={{ textAlign: "center" }}>Done</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((ex, i) => {
                    const isActive = activeTimer?.dayIdx === d && activeTimer?.exIdx === i;
                    // FIX: Ensure the URL is absolute
                    const validUrl = ex.videoUrl ? (ex.videoUrl.startsWith('http') ? ex.videoUrl : `https://${ex.videoUrl}`) : null;

                    return (
                      <tr key={i} className={`workout-row ${ex.done ? 'is-done' : ''}`}>
                        <td><strong>{ex.name}</strong></td>
                        <td>{ex.setsReps}</td>
                        <td>
                          <div className={`timer-badge ${isActive ? 'timer-active' : 'timer-inactive'}`}>
                            {isActive ? `⏱ ${activeTimer.remaining}s` : `${ex.restSeconds || 60}s`}
                            <button className="timer-btn" onClick={() => isActive ? setActiveTimer(null) : setActiveTimer({ dayIdx: d, exIdx: i, remaining: ex.restSeconds || 60 })}>
                              {isActive ? 'Stop' : 'Start'}
                            </button>
                          </div>
                        </td>
                        <td>
                          {validUrl ? (
                            <a href={validUrl} target="_blank" rel="noopener noreferrer" className="video-link-btn">
                              ▶ Watch
                            </a>
                          ) : (
                            <span className="no-video">No Link</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input type="checkbox" checked={!!ex.done} onChange={() => toggleExercise(d, i)} />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="add-row">
                    <td><input className="inline-input" placeholder="Name" value={form.name} onChange={e => handleNewExerciseChange(d, "name", e.target.value)} /></td>
                    <td><input className="inline-input" placeholder="3x10" value={form.setsReps} onChange={e => handleNewExerciseChange(d, "setsReps", e.target.value)} /></td>
                    <td><input className="inline-input" type="number" value={form.restSeconds} onChange={e => handleNewExerciseChange(d, "restSeconds", e.target.value)} /></td>
                    <td><input className="inline-input" placeholder="Video URL" value={form.videoUrl} onChange={e => handleNewExerciseChange(d, "videoUrl", e.target.value)} /></td>
                    <td style={{ textAlign: "center" }}><button className="btn btn-primary btn-sm" onClick={() => addExercise(d)}>Add</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {allDone && (
        <div className="congrats-card workout-success">
          <div className="congrats-icon">🔥</div>
          <h2>Routine Complete!</h2>
          <p>You hit every rep. Shall we repeat this block or evolve the program?</p>
          <div className="congrats-actions">
            <button className="btn btn-primary" onClick={handleResetWorkout} disabled={saving}>
              {saving ? 'Resetting...' : 'Repeat Block'}
            </button>
            <button className="btn-outline-custom" onClick={() => navigate("/generate-plan")}>Evolve Program</button>
          </div>
        </div>
      )}
    </div>
  );
}