import React, { useState, useEffect } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import './GeneratePlan.css' // Import the new styles

export default function GeneratePlan({ user }) {
  const [type, setType] = useState('workout')
  const [extraGoal, setExtraGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPlan(null)

    try {
      const res = await api.post('/plans/generate', { type, extraGoal })
      setPlan(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate plan.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="generate-container">
      <div className="generate-card">
        <h2 className="generate-title">✨ AI Plan Generator</h2>
        <p className="generate-subtitle">Our AI will create a customized routine based on your goals.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label-text">I want a personalized...</label>
            <select
              className="custom-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="workout">🏋️‍♂️ Workout Plan</option>
              <option value="meal">🥗 Meal Plan</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label-text">Specific details or constraints</label>
            <textarea
              className="custom-textarea"
              rows={4}
              placeholder="e.g. No equipment available, vegetarian diet, 30 minutes max, focus on weight loss..."
              value={extraGoal}
              onChange={(e) => setExtraGoal(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }} 
            disabled={loading}
          >
            {loading ? 'Creating your masterpiece...' : 'Generate My Plan'}
          </button>
        </form>

        {error && <p style={{ color: '#ef4444', marginTop: 15, textAlign: 'center' }}>{error}</p>}
      </div>

      {loading && (
        <div className="loading-box">
          <div className="pulse-loader"></div>
          <p style={{ color: '#64748b' }}>The AI Coach is analyzing your profile...</p>
        </div>
      )}

      {plan && (
        <div className="plan-result">
          <div className="plan-result-header">
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{plan.title}</h3>
            <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '4px 10px', borderRadius: '20px' }}>
              {type.toUpperCase()}
            </span>
          </div>
          <div className="plan-body">
            {plan.content}
          </div>
          <div style={{ padding: '16px', textAlign: 'center', background: '#fff' }}>
            <button onClick={() => window.print()} className="btn-outline-custom" style={{fontSize: '0.8rem'}}>
              🖨️ Print or Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}