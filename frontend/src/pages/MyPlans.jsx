import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './MyPlans.css'; 

export default function MyPlans({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  // 1. Initial Data Fetch
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        const data = res.data || [];
        setPlans(data);
        // Auto-select the first plan if available
        if (data.length > 0) setSelectedPlan(data[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user, navigate]);

  // 2. Delete Plan
  const handleDelete = async () => {
    if (!selectedPlan) return;
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/plans/${selectedPlan._id}`);
      const updatedPlans = plans.filter(p => p._id !== selectedPlan._id);
      setPlans(updatedPlans);
      // Move selection to the next available plan
      setSelectedPlan(updatedPlans[0] || null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  // 3. Regenerate Plan (Restored)
  const handleRegenerate = async () => {
    if (!selectedPlan) return;
    setRegenerating(true);
    setError('');

    try {
      const res = await api.post(`/plans/${selectedPlan._id}/regenerate`);
      const newPlan = res.data;
      setPlans(prev => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.msg ||
        'Failed to regenerate plan'
      );
    } finally {
      setRegenerating(false);
    }
  };

  // 4. Download PDF
  const handleDownloadPdf = () => {
    if (!selectedPlan) return;
    setDownloading(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - (margin * 2);
      let y = margin + 10;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo color
      doc.text(selectedPlan.title || 'Your Fitness Plan', margin, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate color
      doc.text(`Generated on: ${new Date(selectedPlan.createdAt).toLocaleDateString()}`, margin, y);

      y += 15;
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // Dark slate
      
      const text = selectedPlan.content || '';
      const lines = doc.splitTextToSize(text, usableWidth);

      lines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 7;
      });

      const filename = (selectedPlan.title || 'plan').replace(/\s+/g, '_').toLowerCase() + '.pdf';
      doc.save(filename);
    } catch (err) {
      setError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="loading-state">Loading your plans...</div>;

  return (
    <div className="plans-layout">
      {/* LEFT SIDEBAR LIST */}
      <div className="plans-list">
        <div className="sidebar-header">My Fitness History</div>
        {plans.length === 0 ? (
          <div className="empty-list-msg">No plans generated yet.</div>
        ) : (
          plans.map(p => (
            <div
              key={p._id}
              className={`plans-list-item ${selectedPlan?._id === p._id ? 'plans-list-item-active' : ''}`}
              onClick={() => setSelectedPlan(p)}
            >
              <span className="plan-item-title">{p.title}</span>
              <div className="plan-item-meta">
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
              <span className={`plan-type-badge type-${p.type}`}>
                {p.type}
              </span>
            </div>
          ))
        )}
      </div>

      {/* RIGHT DETAIL VIEW */}
      <div className="plan-detail-view">
        {error && <div className="status-msg msg-error">{error}</div>}

        {selectedPlan ? (
          <>
            <div className="plan-header-row">
              <div>
                <h2 className="detail-title">{selectedPlan.title}</h2>
                <div className="detail-subtitle">
                  {selectedPlan.type.toUpperCase()} PLAN • CREATED {new Date(selectedPlan.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  onClick={handleDownloadPdf} 
                  className="btn-outline-custom" 
                  disabled={downloading}
                >
                  {downloading ? 'Preparing...' : '📄 Download PDF'}
                </button>
                
                <button 
                  onClick={handleRegenerate} 
                  className="btn-outline-custom"
                  style={{ borderColor: '#4f46e5', color: '#4f46e5' }}
                  disabled={regenerating}
                >
                  {regenerating ? '🔄 Processing...' : '🔄 Regenerate'}
                </button>

                <button 
                  onClick={handleDelete} 
                  className="btn-outline-custom" 
                  style={{ borderColor: '#fee2e2', color: '#ef4444' }} 
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>

            <div className="plan-content-display">
              {selectedPlan.content}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <p>Select a plan from the sidebar to view details or generate a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}