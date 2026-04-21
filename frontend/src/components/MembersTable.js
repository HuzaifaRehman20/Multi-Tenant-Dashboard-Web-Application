import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function MembersTable() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/org-members')
      .then(res => setMembers(res.data.members))
      .catch(err => setError(err.response?.data?.error || 'Failed to load members'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-text">Loading members…</div>;
  if (error) return <div className="error-msg">⚠️ {error}</div>;
  if (!members.length) return <div className="empty-state">No team members found.</div>;

  return (
    <div className="table-card members-section">
      <div className="table-card-title">👥 Team Members</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Member Since</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id}>
              <td style={{ fontWeight: 500 }}>{m.full_name}</td>
              <td style={{ color: 'var(--color-text-muted)' }}>{m.email}</td>
              <td>
                <span className={`role-badge ${m.role}`}>{m.role}</span>
              </td>
              <td style={{ color: 'var(--color-text-muted)' }}>
                {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
