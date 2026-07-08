import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createReviewApi } from "../../api/reviewApi";

const WriteReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createReviewApi({
        hotelId: booking.hotelId,
        bookingId: Number(id),
        rating,
        comment,
      });
      navigate("/my-bookings", { state: { reviewSuccess: true } });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.length > 0
          ? errors.join(" ")
          : err.response?.data?.message || "Failed to submit review.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-6">
        <div className="cozy-form-card">
          <div className="cozy-form-header">
            <h5
              style={{
                color: "white",
                margin: 0,
                fontFamily: "Playfair Display, serif",
              }}
            >
              ⭐ Share Your Experience
            </h5>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                margin: "0.25rem 0 0",
                fontSize: "0.85rem",
              }}
            >
              Help other travelers make the right choice
            </p>
          </div>

          <div className="cozy-form-body">
            {error && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "var(--danger)",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div className="mb-4 text-center">
                <label className="form-label d-block mb-3">
                  How would you rate your stay?
                </label>
                <div className="d-flex justify-content-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "2.5rem",
                        cursor: "pointer",
                        color:
                          star <= (hoveredRating || rating)
                            ? "var(--accent)"
                            : "#ddd",
                        transition: "all 0.1s ease",
                        transform:
                          star <= (hoveredRating || rating)
                            ? "scale(1.15)"
                            : "scale(1)",
                        padding: "0 0.1rem",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--primary)",
                    fontSize: "1rem",
                    fontFamily: "Playfair Display, serif",
                  }}
                >
                  {ratingLabels[hoveredRating || rating]}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="form-label">
                  Your Review{" "}
                  <span style={{ color: "var(--text-light)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Share details about your room, service, location, or anything that stood out..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  style={{ resize: "none", lineHeight: 1.6 }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "0.78rem",
                    color: "var(--text-light)",
                    marginTop: "0.25rem",
                  }}
                >
                  {comment.length}/1000
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={loading}
                  style={{ padding: "0.75rem" }}
                >
                  {loading ? "Submitting..." : "✅ Submit Review"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/my-bookings")}
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
