import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUserApi, registerHotelOwnerApi } from '../../api/authApi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    gender: '', phoneNumber: '', address: '', dateOfBirth: '', role: 'User',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName, email: formData.email,
        password: formData.password, confirmPassword: formData.confirmPassword,
        gender: formData.gender, phoneNumber: formData.phoneNumber,
        address: formData.address, dateOfBirth: formData.dateOfBirth || null,
      };
      if (formData.role === 'HotelOwner') {
        await registerHotelOwnerApi(payload);
      } else {
        await registerUserApi(payload);
      }
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length > 0
        ? errors.join(' ')
        : err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-7 col-lg-6">
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem',
            marginBottom: '1rem', boxShadow: 'var(--shadow-md)'
          }}>🏨</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join thousands of travelers on CozyHavenStay
          </p>
        </div>

        <div className="cozy-form-card">
          <div className="cozy-form-body">
            {error && (
              <div style={{
                background: '#f8d7da', border: '1px solid #f5c6cb',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.9rem'
              }}>⚠️ {error}</div>
            )}
            {success && (
              <div style={{
                background: '#d4edda', border: '1px solid #c3e6cb',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                marginBottom: '1.25rem', color: 'var(--success)', fontSize: '0.9rem'
              }}>✅ {success}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role selection */}
              <div className="mb-4">
                <label className="form-label">I want to</label>
                <div className="d-flex gap-2">
                  {[
                    { value: 'User', label: '🧳 Book Hotels', desc: 'As a Guest' },
                    { value: 'HotelOwner', label: '🏨 List Hotels', desc: 'As an Owner' },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: value })}
                      style={{
                        flex: 1, padding: '0.75rem',
                        background: formData.role === value
                          ? 'var(--primary)' : 'var(--surface)',
                        border: `2px solid ${formData.role === value
                          ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        color: formData.role === value
                          ? 'white' : 'var(--text-primary)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.8, marginTop: '0.1rem'
                      }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" name="fullName"
                  value={formData.fullName} onChange={handleChange}
                  required placeholder="Your full name" />
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" name="email"
                  value={formData.email} onChange={handleChange}
                  required placeholder="you@example.com" />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" name="password"
                    value={formData.password} onChange={handleChange}
                    required placeholder="Min 8 chars" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control"
                    name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} required placeholder="Repeat password" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender"
                    value={formData.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" name="phoneNumber"
                    value={formData.phoneNumber} onChange={handleChange}
                    required placeholder="9876543210" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" name="address"
                  value={formData.address} onChange={handleChange}
                  required placeholder="Your address" />
              </div>

              <div className="mb-4">
                <label className="form-label">
                  Date of Birth{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input type="date" className="form-control"
                  name="dateOfBirth" value={formData.dateOfBirth}
                  onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary w-100"
                disabled={loading} style={{ padding: '0.75rem', fontSize: '1rem' }}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>

            <hr className="divider mt-4" />
            <p className="text-center mb-0" style={{ fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;