import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Page Components
import Home from './pages/Home' 
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import GeneratePlan from './pages/GeneratePlan'
import MyPlans from './pages/MyPlans'
import Progress from './pages/Progress'
import Reminders from "./pages/Reminders"
import WorkoutPlan from "./pages/WorkoutPlan"
import Chat from "./pages/Chat"

// API and Styles
import { api } from './api'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoadingUser(false)
      return
    }

    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
      } catch (err) {
        console.error('Session expired or invalid', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchMe()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loadingUser) {
    return (
      <div className="loading-screen">
        <div className="pulse-loader"></div>
        <p>Syncing with AI Coach...</p>
      </div>
    )
  }

  return (
    <div id="root">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Dashboard user={user} /> : <Home />} 
          />

          <Route 
            path="/register" 
            element={!user ? <Register onAuthSuccess={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login onAuthSuccess={setUser} /> : <Navigate to="/" />} 
          />

          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/generate-plan" 
            element={user ? <GeneratePlan user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/plans" 
            element={user ? <MyPlans user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/progress" 
            element={user ? <Progress user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reminders" 
            element={user ? <Reminders user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/workout-plan" 
            element={user ? <WorkoutPlan user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat" 
            element={user ? <Chat user={user} /> : <Navigate to="/login" />} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}