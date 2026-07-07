import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRoomApi, updateRoomApi, getRoomByIdApi } from '../../api/hotelApi';

const RoomFormPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!roomId;

  const [formData, setFormData] = useState({
    roomSize: '', bedType: 'Single', isAC: false, baseFare: '', imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    setFetching(true);
    try {
      const response = await getRoomByIdApi(roomId);
      const r = response.data;
      setFormData({
        roomSize: r.roomSize, bedType: r.bedType,
        isAC: r.isAC, baseFare: r.baseFare,
        imageUrl: r.imageUrl || '',
      });
    } catch {
      setError('Failed to load room details.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await updateRoomApi(roomId, {
          ...formData, baseFare: Number(formData.baseFare)
        });
      } else {
        await createRoomApi(hotelId, {
          ...formData, baseFare: Number(formData.baseFare)
        });
      }
      navigate('/owner/hotels');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length > 0
        ? errors.join(' ')
        : err.response?.data?.message || 'Failed to save room.');
    } finally {
      setLoading(false);
    }
  };

  const maxOccupancyMap = { Single: 2, Double: 4, King: 6 };

  if (fetching) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-6">
        <div className="cozy-form-card">
          <div className="cozy-form-header">
            <h5 style={{
              color: 'white', margin: 0,
              fontFamily: 'Playfair Display, serif'
            }}>
              {isEditing ? '✏️ Edit Room' : '🛏️ Add New Room'}
            </h5>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              margin: '0.25rem 0 0', fontSize: '0.85rem'
            }}>
              {isEditing
                ? 'Update room details and pricing'
                : 'Add a room to your hotel'}
            </p>
          </div>

          <div className="cozy-form-body">
            {error && (
              <div style={{
                background: '#f8d7da', border: '1px solid #f5c6cb',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                marginBottom: '1.25rem', color: 'var(--danger)',
                fontSize: '0.875rem'
              }}>⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Bed Type</label>
                <select className="form-select" name="bedType"
                  value={formData.bedType} onChange={handleChange} required>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="King">King</option>
                </select>
                <div style={{
                  fontSize: '0.78rem', color: 'var(--text-light)',
                  marginTop: '0.3rem'
                }}>
                  Max occupancy: {maxOccupancyMap[formData.bedType]} guests
                  (auto-set)
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Room Size</label>
                <input type="text" className="form-control" name="roomSize"
                  value={formData.roomSize} onChange={handleChange}
                  required placeholder="e.g. 45 m²" />
              </div>

              <div className="mb-3">
                <label className="form-label">Base Fare (₹ per night)</label>
                <input type="number" className="form-control" name="baseFare"
                  value={formData.baseFare} onChange={handleChange}
                  required min="1" placeholder="e.g. 2500" />
              </div>

              <div className="mb-3">
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: formData.isAC
                    ? 'rgba(26,60,94,0.06)' : 'var(--surface-warm)',
                  border: `1.5px solid ${formData.isAC
                    ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}>
                  <input type="checkbox" name="isAC"
                    checked={formData.isAC} onChange={handleChange}
                    style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontWeight: 500 }}>❄️ Air Conditioned</span>
                </label>
              </div>

              {/* Room Image URL */}
              <div className="mb-3">
                <label className="form-label">
                  Room Image URL{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                />
                <small style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                  Paste a direct image URL — recommended size 800×500px
                </small>
                {formData.imageUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={formData.imageUrl}
                      alt="Room preview"
                      style={{
                        width: '100%', height: 140,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              <div style={{
                background: 'var(--surface-warm)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  fontSize: '0.75rem', color: 'var(--text-light)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  marginBottom: '0.4rem'
                }}>
                  Room Preview
                </div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <span className="amenity-badge">🛏️ {formData.bedType} Bed</span>
                  <span className="amenity-badge">
                    👥 Max {maxOccupancyMap[formData.bedType]}
                  </span>
                  <span className="amenity-badge">
                    ❄️ {formData.isAC ? 'AC' : 'Non-AC'}
                  </span>
                  {formData.baseFare && (
                    <span className="amenity-badge">
                      💰 ₹{Number(formData.baseFare).toLocaleString()}/night
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1"
                  disabled={loading} style={{ padding: '0.75rem' }}>
                  {loading
                    ? 'Saving...'
                    : isEditing ? 'Save Changes' : 'Add Room'}
                </button>
                <button type="button" className="btn btn-outline-secondary"
                  onClick={() => navigate('/owner/hotels')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomFormPage;