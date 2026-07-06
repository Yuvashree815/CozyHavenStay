import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRoomApi, updateRoomApi, getRoomByIdApi } from '../../api/hotelApi';

const RoomFormPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!roomId;

  const [formData, setFormData] = useState({
    roomSize: '',
    bedType: 'Single',
    isAC: false,
    baseFare: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = async () => {
    setFetching(true);
    try {
      const response = await getRoomByIdApi(roomId);
      const r = response.data;
      setFormData({
        roomSize: r.roomSize,
        bedType: r.bedType,
        isAC: r.isAC,
        baseFare: r.baseFare,
      });
    } catch (err) {
      setError('Failed to load room details.');
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
        await updateRoomApi(roomId, {
          ...formData,
          baseFare: Number(formData.baseFare),
        });
      } else {
        await createRoomApi(hotelId, {
          ...formData,
          baseFare: Number(formData.baseFare),
        });
      }
      navigate('/owner/hotels');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to save room.');
      }
    } finally {
      setLoading(false);
    }
  };

  const maxOccupancyMap = {
    Single: 2,
    Double: 4,
    King: 6,
  };

  if (fetching) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading room details...</p>
    </div>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div
            className="card-header text-white"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">
              {isEditing ? '✏️ Edit Room' : '🛏️ Add New Room'}
            </h5>
          </div>

          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Bed Type</label>
                <select
                  className="form-select"
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleChange}
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="King">King</option>
                </select>
                <small className="text-muted">
                  Max occupancy: {maxOccupancyMap[formData.bedType]} guests
                  (auto-calculated)
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Room Size</label>
                <input
                  type="text"
                  className="form-control"
                  name="roomSize"
                  value={formData.roomSize}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 45 m²"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Base Fare (₹ per night)</label>
                <input
                  type="number"
                  className="form-control"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="e.g. 2500"
                />
              </div>

              <div className="mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isAC"
                    name="isAC"
                    checked={formData.isAC}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isAC">
                    ❄️ Air Conditioned
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="alert alert-light border mb-4">
                <strong>Room Preview:</strong>
                <div className="mt-2 small">
                  <span className="me-3">🛏️ {formData.bedType} Bed</span>
                  <span className="me-3">
                    👥 Max {maxOccupancyMap[formData.bedType]} guests
                  </span>
                  <span className="me-3">
                    ❄️ {formData.isAC ? 'AC' : 'Non-AC'}
                  </span>
                  {formData.baseFare && (
                    <span>
                      💰 ₹{Number(formData.baseFare).toLocaleString()}/night
                    </span>
                  )}
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
                    : isEditing ? 'Save Changes' : 'Add Room'}
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

export default RoomFormPage;