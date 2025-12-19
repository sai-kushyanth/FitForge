import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-overlay">
          <h1>Your Elite AI Personal Trainer <br/><span>Available 24/7</span></h1>
          <p>
            Stop guessing. Start growing. Get science-backed workout routines 
            and precision meal plans powered by advanced AI.
          </p>
          <div className="hero-btns">
            <button className="btn-main" onClick={() => navigate('/register')}>Start Your Transformation</button>
            <button className="btn-sub" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="home-features">
        <div className="section-title">
          <h2>Why Choose FitBuddy AI?</h2>
          <div className="underline"></div>
        </div>
        
        <div className="feature-grid">
          <div className="f-card">
            <div className="f-icon">🧠</div>
            <h3>Intelligent Plans</h3>
            <p>Gemini AI analyzes your goals to build workouts that actually work.</p>
          </div>
          <div className="f-card">
            <div className="f-icon">⏱️</div>
            <h3>Live Tracking</h3>
            <p>Interactive gym logs with rest timers and video form guides.</p>
          </div>
          <div className="f-card">
            <div className="f-icon">🥗</div>
            <h3>Precision Nutrition</h3>
            <p>Meal plans that match your macros and dietary preferences.</p>
          </div>
        </div>
      </section>

      {/* COMPARISON SECTION */}
      <section className="home-comparison">
        <div className="comp-card">
          <h3>The AI Advantage</h3>
          <div className="comp-row">
            <span>Human Trainer</span>
            <span className="price-tag">$500+/mo</span>
          </div>
          <div className="comp-row">
            <span>FitForge</span>
            <span className="price-tag success">Free / Fraction of Cost</span>
          </div>
        </div>
      </section>
    </div>
  );
}