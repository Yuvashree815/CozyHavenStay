import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createReviewApi } from '../../api/reviewApi';

const WriteReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createReviewApi({
        hotelId: booking.hotelId,
        bookingId: Number(id),
        rating,
        comment,
      });
      navigate('/my-bookings', { state: { reviewSuccess: true } });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.join(' '));
      } else {
        setError(err.response?.data?.message || 'Failed to submit review.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div
            className="card-header text-white"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">⭐ Write a Review</h5>
          </div>
          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div className="mb-4">
                <label className="form-label fw-bold">Your Rating</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0"
                      style={{ fontSize: '2rem' }}
                      onClick={() => setRating(star)}
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <small className="text-muted">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </small>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="form-label fw-bold">
                  Your Review <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Share your experience about this hotel..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                />
                <small className="text-muted">
                  {comment.length}/1000 characters
                </small>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/my-bookings')}
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

export default WriteReviewPage;