import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRefundsApi, approveRefundApi } from '../../api/bookingApi';

const PendingRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await getPendingRefundsApi();
      setRefunds(response.data || []);
    } catch (err) {
      setError('Failed to load pending refunds.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    setApprovingId(bookingId);
    try {
      await approveRefundApi(bookingId);
      // Remove approved refund from list
      setRefunds(refunds.filter(r => r.id !== bookingId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve refund.');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading pending refunds...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Pending Refunds</h4>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/owner/dashboard')}
        >
          ← Dashboard
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {refunds.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">✅</div>
          <h5 className="mt-3">No pending refunds</h5>
          <p className="text-muted">
            All refund requests have been processed.
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">
            {refunds.length} refund(s) awaiting approval
          </p>
          {refunds.map((booking) => (
            <div className="card shadow-sm mb-3 border-warning" key={booking.id}>
              <div
                className="card-header bg-warning bg-opacity-10 d-flex
                justify-content-between align-items-center"
              >
                <span className="fw-bold">Booking #{booking.id}</span>
                <span className="badge bg-warning text-dark">
                  Refund Pending
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">
                      👤 Guest ID: {booking.userId}
                    </p>
                    <p className="text-muted small mb-1">
                      📅 {new Date(booking.checkIn).toLocaleDateString('en-IN')}
                      {' → '}
                      {new Date(booking.checkOut).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-muted small mb-1">
                      💳 Payment Method: {booking.payment?.method}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted small mb-1">
                      Total Fare:
                      <span className="fw-bold ms-1">
                        ₹{booking.totalFare?.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-muted small mb-1">
                      Refund Amount:
                      <span className="fw-bold text-info ms-1">
                        ₹{booking.payment?.refundAmount !== null &&
                          booking.payment?.refundAmount !== undefined
                          ? booking.payment.refundAmount.toLocaleString()
                          : booking.totalFare?.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white border-0">
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(booking.id)}
                  disabled={approvingId === booking.id}
                >
                  {approvingId === booking.id
                    ? 'Approving...'
                    : '✅ Approve Refund'}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PendingRefundsPage;