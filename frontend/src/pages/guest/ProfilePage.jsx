import { useState, useEffect } from 'react';
import { getProfileApi, updateProfileApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getProfileApi();
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName,
        gender: response.data.gender,
        phoneNumber: response.data.phoneNumber,
        address: response.data.address,
        dateOfBirth: response.data.dateOfBirth
          ? response.data.dateOfBirth.split('T')[0] : '',
      });
    } catch {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateProfileApi({
        ...formData, dateOfBirth: formData.dateOfBirth || null,
      });
      setProfile(response.data);
      updateProfile({ fullName: response.data.fullName });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length > 0
        ? errors.join(' ')
        : err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    const map = {
      Admin: 'var(--danger)',
      HotelOwner: 'var(--accent)',
      User: 'var(--primary)',
    };
    return map[role] || 'var(--primary)';
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-7">
        {error && (
          <div style={{
            background: '#f8d7da', border: '1px solid #f5c6cb',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
            marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.9rem'
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: '#d4edda', border: '1px solid #c3e6cb',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
            marginBottom: '1rem', color: 'var(--success)', fontSize: '0.9rem'
          }}>✅ {success}</div>
        )}

        <div className="cozy-form-card">
          {/* Header */}
          <div className="cozy-form-header d-flex justify-content-between align-items-center">
            <h5 style={{ color: 'white', margin: 0, fontFamily: 'Playfair Display, serif' }}>
              👤 My Profile
            </h5>
            {!editing && (
              <button
                className="btn-gold btn-sm"
                onClick={() => setEditing(true)}
                style={{
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 1rem',
                  fontSize: '0.85rem'
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          <div className="cozy-form-body">
            {!editing ? (
              <div>
                {/* Avatar section */}
                <div className="text-center mb-4">
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: 'white',
                    display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2rem',
                    fontFamily: 'Playfair Display, serif', fontWeight: 700,
                    boxShadow: 'var(--shadow-md)', marginBottom: '0.75rem'
                  }}>
                    {profile?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <h5 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.25rem' }}>
                    {profile?.fullName}
                  </h5>
                  <span style={{
                    background: `${getRoleColor(profile?.role)}15`,
                    color: getRoleColor(profile?.role),
                    border: `1.5px solid ${getRoleColor(profile?.role)}30`,
                    borderRadius: '20px',
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {profile?.role}
                  </span>
                </div>

                <hr className="divider" />

                {/* Profile details */}
                <div className="row">
                  {[
                    { label: 'Email', value: profile?.email, icon: '📧' },
                    { label: 'Gender', value: profile?.gender, icon: '👤' },
                    { label: 'Phone', value: profile?.phoneNumber, icon: '📱' },
                    { label: 'Address', value: profile?.address, icon: '📍' },
                    {
                      label: 'Date of Birth',
                      value: profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                        : 'Not provided',
                      icon: '🎂'
                    },
                    {
                      label: 'Member Since',
                      value: new Date(profile?.createdAt).toLocaleDateString('en-IN', {
                        month: 'long', year: 'numeric'
                      }),
                      icon: '📅'
                    },
                  ].map(({ label, value, icon }) => (
                    <div className="col-md-6 mb-3" key={label}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--surface-warm)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-light)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.2rem'
                        }}>
                          {icon} {label}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" name="fullName"
                    value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender"
                      value={formData.gender} onChange={handleChange} required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" name="phoneNumber"
                      value={formData.phoneNumber} onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" name="address"
                    value={formData.address} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    Date of Birth{' '}
                    <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <input type="date" className="form-control" name="dateOfBirth"
                    value={formData.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1"
                    disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;