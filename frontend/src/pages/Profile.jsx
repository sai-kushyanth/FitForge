import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import './Profile.css' // Import new styles

export default function Profile({ user }) {
  const [form, setForm] = useState({
    age: '', gender: '', height: '', weight: '', activityLevel: '', goal: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile')
        const data = res.data || {}
        setForm({
          age: data.age || '', gender: data.gender || '',
          height: data.height || '', weight: data.weight || '',
          activityLevel: data.activityLevel || '', goal: data.goal || ''
        })
      } catch (err) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined
      }
      await api.post('/profile', payload)
      setMessage('✅ Your stats have been updated!')
    } catch (err) {
      setError('Failed to save profile. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null
  if (loading) return <div className="profile-container">Loading profile...</div>

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Your Fitness Profile</h2>
        <p className="profile-subtitle">These details help the AI Coach tailor plans specifically for your body type.</p>
        
        <form onSubmit={handleSubmit}>
          {/* Top Grid for stats */}
          <div className="profile-form-grid">
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} className="profile-input" placeholder="25" />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="profile-select">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input name="height" type="number" value={form.height} onChange={handleChange} className="profile-input" placeholder="175" />
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input name="weight" type="number" value={form.weight} onChange={handleChange} className="profile-input" placeholder="70" />
            </div>
          </div>

          {/* Full width dropdowns */}
          <div className="form-group">
            <label>Activity Level</label>
            <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className="profile-select">
              <option value="">Select your activity...</option>
              <option value="low">Low (Sedentary / Desk Job)</option>
              <option value="moderate">Moderate (Exercise 3-4x/week)</option>
              <option value="high">High (Daily Intense Exercise)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label>Primary Goal</label>
            <select name="goal" value={form.goal} onChange={handleChange} className="profile-select">
              <option value="">What's your main objective?</option>
              <option value="lose_weight">🔥 Lose Weight</option>
              <option value="gain_muscle">💪 Gain Muscle</option>
              <option value="maintain">⚖️ Maintain Health</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={saving}>
            {saving ? 'Updating Profile...' : 'Save Profile Settings'}
          </button>
        </form>

        {message && <div className="status-msg msg-success">{message}</div>}
        {error && <div className="status-msg msg-error">{error}</div>}
      </div>
    </div>
  )
}