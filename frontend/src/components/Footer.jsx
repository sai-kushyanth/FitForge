import React from 'react';
import { Link } from 'react-router-dom';
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Brand & Mission */}
          <div className="footer-brand">
            <h3>FitForge</h3>
            <p>
              Professional-grade coaching without the premium price tag. 
              Available 24/7 to help you reach your peak potential.
            </p>
          </div>

          {/* Training Navigation */}
          <div>
            <h4 className="footer-heading">Your Training</h4>
            <ul className="footer-links">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/generate-plan">New Strategy</Link></li>
              <li><Link to="/plans">Saved Routines</Link></li>
              <li><Link to="/progress">Body Stats</Link></li>
            </ul>
          </div>

          {/* Coach Resources */}
          <div>
            <h4 className="footer-heading">Coach Expertise</h4>
            <ul className="footer-links">
              <li><Link to="/chat">Ask AI Coach</Link></li>
              <li><Link to="/profile">Physical Profile</Link></li>
              <li><Link to="/reminders">Meal Tracker</Link></li>
            </ul>
          </div>

          {/* Value Proposition Box */}
          <div className="coach-value-card">
            <h4 className="footer-heading" style={{color: '#818cf8'}}>Why AI Coach?</h4>
            <p>
              "Personal trainers can cost $50-$100 per session. FitForge 
              gives you science-backed workouts and meal plans instantly, 
              at a fraction of the cost."
            </p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} <b>FitForge</b> • Powered by Gemini Intelligence
          </p>
          <p style={{fontSize: '0.75rem', marginTop: '8px', opacity: 0.6}}>
            FitForge AI provides general fitness guidance. Always consult a physician before starting a new exercise program.
          </p>
        </div>
      </div>
    </footer>
  );
}