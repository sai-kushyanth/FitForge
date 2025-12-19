import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import './Progress.css'

export default function Progress({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ weight: '', calories: '', workoutCompleted: false })

  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
    const fetchProgress = async () => {
      try {
        const res = await api.get('/progress')
        setEntries(res.data || [])
      } catch (err) {
        setError('Failed to load progress data')
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await api.post('/progress', {
        weight: form.weight ? Number(form.weight) : undefined,
        calories: form.calories ? Number(form.calories) : undefined,
        workoutCompleted: form.workoutCompleted
      })
      setEntries(prev => [...prev, res.data])
      setMessage('✅ Daily progress logged!')
      setForm({ weight: '', calories: '', workoutCompleted: false })
    } catch (err) {
      setError('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null
  if (loading) return <div className="progress-container">Calculating your stats...</div>

  const chartData = (entries || []).slice(-14).map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: e.weight
  }))

  return (
    <div className="progress-container">
      <div className="checkin-card">
        <h2 style={{marginTop: 0, fontSize: '1.4rem'}}>Daily Check-in</h2>
        <form onSubmit={handleSubmit}>
          <div className="checkin-grid">
            <div className="form-group">
              <label className="label-text">Weight (kg)</label>
              <input className="profile-input" type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="0.0" step="0.1" />
            </div>
            <div className="form-group">
              <label className="label-text">Calories</label>
              <input className="profile-input" type="number" name="calories" value={form.calories} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <label className="checkbox-container">
            <input type="checkbox" name="workoutCompleted" checked={form.workoutCompleted} onChange={handleChange} />
            <span style={{fontSize: '0.9rem', fontWeight: 500}}>I crushed my workout today! 🏋️‍♀️</span>
          </label>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '20px'}} disabled={saving}>
            {saving ? 'Saving...' : 'Log Progress'}
          </button>
        </form>
        {message && <p className="status-msg msg-success" style={{marginTop: '15px'}}>{message}</p>}
      </div>

      <div className="chart-card">
        <h3 style={{margin: '0 0 20px 0', fontSize: '1.1rem'}}>Weight Trend</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#4f46e5" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="recent-entries-card">
        <div style={{padding: '20px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0'}}>History</div>
        <table className="progress-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Calories</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...entries].reverse().slice(0, 5).map(e => (
              <tr key={e._id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.weight ? `${e.weight} kg` : '—'}</td>
                <td>{e.calories ? `${e.calories} kcal` : '—'}</td>
                <td>{e.workoutCompleted ? '✅ Done' : '❌ Missed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}