import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ workoutDone: 0, workoutTotal: 0, mealsDone: 0, mealsTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Fetching both plans to calculate today's progress
        const [wRes, mRes] = await Promise.all([
          api.get("/plans/latest-workout"),
          api.get("/plans/latest")
        ]);

        const calcWorkout = () => {
          if (!wRes.data?.structuredWorkouts) return { done: 0, total: 0 };
          let total = 0, done = 0;
          wRes.data.structuredWorkouts.forEach(day => {
            day.exercises.forEach(ex => {
              total++;
              if (ex.done) done++;
            });
          });
          return { done, total };
        };

        const calcMeals = () => {
          if (!mRes.data?.structuredMeals) return { done: 0, total: 0 };
          let total = 0, done = 0;
          mRes.data.structuredMeals.forEach(day => {
            day.meals.forEach(m => {
              total++;
              if (m.done) done++;
            });
          });
          return { done, total };
        };

        const w = calcWorkout();
        const m = calcMeals();
        setStats({ workoutDone: w.done, workoutTotal: w.total, mealsDone: m.done, mealsTotal: m.total });
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const workoutPct = stats.workoutTotal > 0 ? Math.round((stats.workoutDone / stats.workoutTotal) * 100) : 0;
  const mealPct = stats.mealsTotal > 0 ? Math.round((stats.mealsDone / stats.mealsTotal) * 100) : 0;

  if (loading) return <div className="loading-screen">Loading Coach's Desk...</div>;

  return (
    <div className="dashboard-container">
      {/* 1. HERO BRIEFING */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome back, {user?.name.split(" ")[0]}! 👋</h1>
          <p className="coach-quote">
            "The body achieves what the mind believes. You have <strong>{stats.workoutTotal - stats.workoutDone}</strong> exercises left to hit your weekly goal."
          </p>
          <div className="hero-actions">
            <Link to="/generate-plan" className="btn btn-primary">Evolve Strategy</Link>
            <Link to="/chat" className="btn btn-outline">Ask Coach a Question</Link>
          </div>
        </div>
      </section>

      {/* 2. PROGRESS RINGS SECTION */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Training Consistency</h3>
            <p>{stats.workoutDone} / {stats.workoutTotal} Exercises</p>
          </div>
          <div className="progress-circle" style={{ '--percent': workoutPct }}>
            <svg>
              <circle cx="45" cy="45" r="40"></circle>
              <circle cx="45" cy="45" r="40" className="pct-bar"></circle>
            </svg>
            <span className="pct-text">{workoutPct}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Nutrition Adherence</h3>
            <p>{stats.mealsDone} / {stats.mealsTotal} Meals</p>
          </div>
          <div className="progress-circle color-meal" style={{ '--percent': mealPct }}>
            <svg>
              <circle cx="45" cy="45" r="40"></circle>
              <circle cx="45" cy="45" r="40" className="pct-bar"></circle>
            </svg>
            <span className="pct-text">{mealPct}%</span>
          </div>
        </div>
      </section>

      {/* 3. QUICK NAV TILES */}
      <section className="quick-nav">
        <Link to="/workout-plan" className="nav-tile">
          <span className="tile-icon">🏋️‍♂️</span>
          <h4>Open Gym Log</h4>
        </Link>
        <Link to="/reminders" className="nav-tile">
          <span className="tile-icon">🥗</span>
          <h4>Check Meals</h4>
        </Link>
        <Link to="/progress" className="nav-tile">
          <span className="tile-icon">📈</span>
          <h4>View Growth</h4>
        </Link>
      </section>
    </div>
  );
}