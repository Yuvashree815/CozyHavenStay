import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createHotelApi, updateHotelApi, getHotelByIdApi } from '../../api/hotelApi';

const HotelFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '', location: '', description: '',
    hasDining: false, hasParking: false, hasFreeWifi: false,
    hasRoomService: false, hasSwimmingPool: false, hasFitnessCenter: false,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    setFetching(true);
    try {
      const response = await getHotelByIdApi(id);
      const h = response.data;
      setFormData({
        name: h.name, location: h.location,
        description: h.description || '',
        hasDining: h.hasDining, hasParking: h.hasParking,
        hasFreeWifi: h.hasFreeWifi, hasRoomService: h.hasRoomService,
        hasSwimmingPool: h.hasSwimmingPool, hasFitnessCenter: h.hasFitnessCenter,
        imageUrl: h.imageUrl || '',
      });
    } catch {
      setError('Failed to load hotel details.');
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
        await updateHotelApi(id, formData);
      } else {
        await createHotelApi(formData);
      }
      navigate('/owner/hotels');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length > 0
        ? errors.join(' ')
        : err.response?.data?.message || 'Failed to save hotel.');
    } finally {
      setLoading(false);
    }
  };

  const amenities = [
    { key: 'hasFreeWifi', label: '📶 Free WiFi' },
    { key: 'hasDining', label: '🍽️ Dining' },
    { key: 'hasParking', label: '🚗 Parking' },
    { key: 'hasSwimmingPool', label: '🏊 Swimming Pool' },
    { key: 'hasFitnessCenter', label: '💪 Fitness Center' },
    { key: 'hasRoomService', label: '🛎️ Room Service' },
  ];

  if (fetching) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-7">
        <div className="cozy-form-card">
          <div className="cozy-form-header">
            <h5 style={{
              color: 'white', margin: 0,
              fontFamily: 'Playfair Display, serif'
            }}>
              {isEditing ? '✏️ Edit Hotel' : '➕ Add New Hotel'}
            </h5>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              margin: '0.25rem 0 0', fontSize: '0.85rem'
            }}>
              {isEditing
                ? 'Update your hotel details'
                : 'Fill in the details to list your hotel'}
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
                <label className="form-label">Hotel Name</label>
                <input type="text" className="form-control" name="name"
                  value={formData.name} onChange={handleChange}
                  required placeholder="e.g. Cozy Haven Mumbai" />
              </div>

              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" name="location"
                  value={formData.location} onChange={handleChange}
                  required placeholder="e.g. Mumbai, Maharashtra" />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Description{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea className="form-control" name="description"
                  value={formData.description} onChange={handleChange}
                  rows={3} placeholder="Describe your hotel..."
                  maxLength={1000} style={{ resize: 'none' }} />
                <div style={{
                  textAlign: 'right', fontSize: '0.78rem',
                  color: 'var(--text-light)', marginTop: '0.25rem'
                }}>
                  {formData.description.length}/1000
                </div>
              </div>

              {/* Image URL */}
              <div className="mb-3">
                <label className="form-label">
                  Hotel Image URL{' '}
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
                      alt="Hotel preview"
                      style={{
                        width: '100%', height: 160,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)'
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <label className="form-label">Amenities</label>
                <div className="row mt-1">
                  {amenities.map(({ key, label }) => (
                    <div className="col-md-4 col-6 mb-2" key={key}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 0.75rem',
                        background: formData[key]
                          ? 'rgba(26,60,94,0.06)' : 'var(--surface-warm)',
                        border: `1.5px solid ${formData[key]
                          ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        fontSize: '0.85rem', fontWeight: 500,
                        userSelect: 'none'
                      }}>
                        <input
                          type="checkbox" id={key} name={key}
                          checked={formData[key]} onChange={handleChange}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1"
                  disabled={loading} style={{ padding: '0.75rem' }}>
                  {loading
                    ? 'Saving...'
                    : isEditing ? 'Save Changes' : 'Create Hotel'}
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

export default HotelFormPage;