import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function SignupPage({ onNavigate }) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', organization_id: '' });
  const [orgs, setOrgs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/organizations')
      .then(res => setOrgs(res.data.organizations))
      .catch(() => setError('Could not load organizations.'));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.organization_id) { setError('Please select an organization.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      setSuccess('Account created! Please check your email to confirm, then log in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📊</div>
          <div className="auth-logo-text">Tenant<span>Dash</span></div>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your organization's dashboard</p>

        {error && <div className="error-msg">⚠️ {error}</div>}
        {success && <div className="success-msg">✅ {success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="full_name" placeholder="Jane Smith"
                value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email" placeholder="you@company.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Organization</label>
              <select className="form-select" name="organization_id"
                value={form.organization_id} onChange={handleChange} required>
                <option value="">— Select your organization —</option>
                {orgs.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => onNavigate('login')}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
