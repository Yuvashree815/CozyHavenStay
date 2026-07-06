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

  useEffect(() => {
    fetchProfile();
  }, []);

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
          ? response.data.dateOfBirth.split('T')[0]
          : '',
      });
    } catch (err) {
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
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
      });
      setProfile(response.data);
      updateProfile({ fullName: response.data.fullName });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card shadow-sm">
          <div
            className="card-header text-white d-flex justify-content-between align-items-center"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">👤 My Profile</h5>
            {!editing && (
              <button
                className="btn btn-light btn-sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>

          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!editing ? (
              // View mode
              <div>
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {profile?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <h5 className="mt-2 mb-0">{profile?.fullName}</h5>
                  <span className="badge bg-primary mt-1">{profile?.role}</span>
                </div>

                {[
                  { label: 'Email', value: profile?.email },
                  { label: 'Gender', value: profile?.gender },
                  { label: 'Phone', value: profile?.phoneNumber },
                  { label: 'Address', value: profile?.address },
                  {
                    label: 'Date of Birth',
                    value: profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN')
                      : 'Not provided'
                  },
                  {
                    label: 'Member Since',
                    value: new Date(profile?.createdAt).toLocaleDateString('en-IN', {
                      month: 'long', year: 'numeric'
                    })
                  },
                ].map(({ label, value }) => (
                  <div className="row mb-2" key={label}>
                    <div className="col-4 text-muted">{label}</div>
                    <div className="col-8 fw-bold">{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              // Edit mode
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Date of Birth <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditing(false)}
                  >
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