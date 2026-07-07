import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPasswordApi } from '../../api/authApi';

const getPasswordStrength = (password) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { label: 'Weak', color: '#e74c3c', width: '25%' };
  if (score === 3) return { label: 'Fair', color: '#f39c12', width: '50%' };
  if (score === 4) return { label: 'Good', color: '#2ecc71', width: '75%' };
  return { label: 'Strong', color: '#27ae60', width: '100%' };
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(formData.newPassword);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="row justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}>
      <div className="col-md-5 col-lg-4">
        <div className="cozy-form-card">
          <div className="cozy-form-body text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h5 style={{ fontFamily: 'Playfair Display, serif' }}>
              Invalid Reset Link
            </h5>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              This reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="row justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}>
      <div className="col-md-5 col-lg-4">
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', marginBottom: '1rem',
            boxShadow: 'var(--shadow-md)'
          }}>🔒</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create a new strong password for your account
          </p>
        </div>

        <div className="cozy-form-card">
          <div className="cozy-form-body">
            {!success ? (
              <>
                {error && (
                  <div style={{
                    background: '#f8d7da', border: '1px solid #f5c6cb',
                    borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                    marginBottom: '1.25rem', color: 'var(--danger)',
                    fontSize: '0.9rem'
                  }}>⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* New Password */}
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      placeholder="Create a strong password"
                      style={{ padding: '0.7rem 1rem' }}
                    />

                    {/* Password strength bar */}
                    {formData.newPassword && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{
                          height: 4, background: '#e0e0e0',
                          borderRadius: 4, overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: passwordStrength?.width,
                            background: passwordStrength?.color,
                            borderRadius: 4,
                            transition: 'all 0.3s ease'
                          }} />
                        </div>
                        <div style={{
                          fontSize: '0.78rem', marginTop: '0.25rem',
                          color: passwordStrength?.color, fontWeight: 600
                        }}>
                          Password strength: {passwordStrength?.label}
                        </div>
                      </div>
                    )}

                    {/* Requirements checklist */}
                    {formData.newPassword && (
                      <div style={{
                        marginTop: '0.5rem', padding: '0.6rem 0.75rem',
                        background: 'var(--surface-warm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.78rem'
                      }}>
                        {[
                          { rule: formData.newPassword.length >= 8, text: 'At least 8 characters' },
                          { rule: /[A-Z]/.test(formData.newPassword), text: 'One uppercase letter' },
                          { rule: /[a-z]/.test(formData.newPassword), text: 'One lowercase letter' },
                          { rule: /[0-9]/.test(formData.newPassword), text: 'One number' },
                          { rule: /[^a-zA-Z0-9]/.test(formData.newPassword), text: 'One special character' },
                        ].map(({ rule, text }) => (
                          <div key={text} style={{
                            color: rule ? '#27ae60' : '#e74c3c',
                            marginBottom: '0.15rem'
                          }}>
                            {rule ? '✓' : '✗'} {text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Repeat your new password"
                      style={{ padding: '0.7rem 1rem' }}
                    />
                    {formData.confirmPassword && (
                      <div style={{
                        fontSize: '0.8rem', marginTop: '0.25rem',
                        color: formData.newPassword === formData.confirmPassword
                          ? '#27ae60' : '#e74c3c'
                      }}>
                        {formData.newPassword === formData.confirmPassword
                          ? '✓ Passwords match'
                          : '✗ Passwords do not match'}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{ padding: '0.75rem', fontSize: '1rem' }}
                  >
                    {loading ? 'Resetting...' : '🔒 Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: 64, height: 64,
                  background: '#d4edda', borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '2rem',
                  marginBottom: '1rem'
                }}>
                  ✅
                </div>
                <h5 style={{
                  fontFamily: 'Playfair Display, serif',
                  marginBottom: '0.75rem'
                }}>
                  Password Reset Successfully!
                </h5>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.9rem',
                  marginBottom: '1.25rem'
                }}>
                  Your password has been updated. Redirecting to login
                  in 3 seconds...
                </p>
                <Link to="/login" className="btn btn-primary w-100">
                  Go to Login →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;