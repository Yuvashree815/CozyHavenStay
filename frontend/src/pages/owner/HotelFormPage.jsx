import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createHotelApi, updateHotelApi, getHotelByIdApi } from '../../api/hotelApi';

const HotelFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    hasDining: false,
    hasParking: false,
    hasFreeWifi: false,
    hasRoomService: false,
    hasSwimmingPool: false,
    hasFitnessCenter: false,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    setFetching(true);
    try {
      const response = await getHotelByIdApi(id);
      const h = response.data;
      setFormData({
        name: h.name,
        location: h.location,
        description: h.description || '',
        hasDining: h.hasDining,
        hasParking: h.hasParking,
        hasFreeWifi: h.hasFreeWifi,
        hasRoomService: h.hasRoomService,
        hasSwimmingPool: h.hasSwimmingPool,
        hasFitnessCenter: h.hasFitnessCenter,
      });
    } catch (err) {
      setError('Failed to load hotel details.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
      if (errors && errors.length > 0) {
        setError(errors.join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to save hotel.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading hotel details...</p>
    </div>
  );

  const amenities = [
    { key: 'hasFreeWifi', label: '📶 Free WiFi' },
    { key: 'hasDining', label: '🍽️ Dining' },
    { key: 'hasParking', label: '🚗 Parking' },
    { key: 'hasSwimmingPool', label: '🏊 Swimming Pool' },
    { key: 'hasFitnessCenter', label: '💪 Fitness Center' },
    { key: 'hasRoomService', label: '🛎️ Room Service' },
  ];

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card shadow-sm">
          <div
            className="card-header text-white"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">
              {isEditing ? '✏️ Edit Hotel' : '➕ Add New Hotel'}
            </h5>
          </div>

          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Hotel Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Cozy Haven Mumbai"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mumbai, Maharashtra"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Description <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your hotel..."
                  maxLength={1000}
                />
                <small className="text-muted">
                  {formData.description.length}/1000
                </small>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <label className="form-label">Amenities</label>
                <div className="row">
                  {amenities.map(({ key, label }) => (
                    <div className="col-md-4 col-6 mb-2" key={key}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={key}
                          name={key}
                          checked={formData[key]}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor={key}>
                          {label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : isEditing ? 'Save Changes' : 'Create Hotel'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/owner/hotels')}
                >
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