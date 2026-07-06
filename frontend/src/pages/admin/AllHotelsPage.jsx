import { useState, useEffect } from 'react';
import { getAllHotelsAdminApi, deactivateHotelApi } from '../../api/hotelApi';

const AllHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => {
    fetchHotels();
  }, [pageNumber]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await getAllHotelsAdminApi(pageNumber, 10);
      setHotels(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (hotelId) => {
    if (!window.confirm('Are you sure you want to deactivate this hotel?')) return;
    setDeactivatingId(hotelId);
    try {
      await deactivateHotelApi(hotelId);
      setHotels(hotels.map(h =>
        h.id === hotelId ? { ...h, isActive: false } : h
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate hotel.');
    } finally {
      setDeactivatingId(null);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading hotels...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">All Hotels</h4>
          <small className="text-muted">{totalCount} total hotels</small>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Hotel Name</th>
              <th>Location</th>
              <th>Owner ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id}>
                <td className="text-muted small">#{hotel.id}</td>
                <td className="fw-bold">{hotel.name}</td>
                <td className="text-muted small">📍 {hotel.location}</td>
                <td className="text-muted small">#{hotel.ownerId}</td>
                <td>
                  <span className={`badge ${hotel.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {hotel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-muted small">
                  {new Date(hotel.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td>
                  {hotel.isActive ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeactivate(hotel.id)}
                      disabled={deactivatingId === hotel.id}
                    >
                      {deactivatingId === hotel.id
                        ? 'Deactivating...'
                        : 'Deactivate'}
                    </button>
                  ) : (
                    <span className="text-muted small">Deactivated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            ← Previous
          </button>
          <span className="btn btn-light disabled">
            Page {pageNumber} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AllHotelsPage;