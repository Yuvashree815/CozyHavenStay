import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getBookingByIdApi,
  cancelBookingApi,
  getRefundPolicyApi,
} from "../../api/bookingApi";

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingSuccess = location.state?.bookingSuccess || false;

  const [booking, setBooking] = useState(null);
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await getBookingByIdApi(id);
      setBooking(response.data);
    } catch {
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowCancelConfirm = async () => {
    setShowCancelConfirm(true);
    setPolicyLoading(true);
    try {
      const response = await getRefundPolicyApi(id);
      setRefundPolicy(response.data);
    } catch {
      // Policy fetch failing doesn't block cancellation
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      await cancelBookingApi(id);
      await fetchBooking();
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      Confirmed: "badge-confirmed",
      Pending: "badge-pending",
      Cancelled: "badge-cancelled",
    };
    return map[status] || "badge-pending";
  };

  const getPaymentClass = (status) => {
    const map = {
      Completed: "badge-confirmed",
      RefundPending: "badge-pending",
      Refunded: "badge-refunded",
      Pending: "badge-pending",
      Failed: "badge-cancelled",
    };
    return map[status] || "badge-pending";
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--primary)" }} />
      </div>
    );

  if (error)
    return (
      <div
        style={{
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          color: "var(--danger)",
        }}
      >
        ⚠️ {error}
      </div>
    );

  if (!booking) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        {/* Success banner */}
        {bookingSuccess && (
          <div
            style={{
              background: "linear-gradient(135deg, var(--success), #27ae60)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem 1.5rem",
              color: "white",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🎉</span>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  marginBottom: "0.2rem",
                }}
              >
                Booking Confirmed!
              </div>
              <div style={{ opacity: 0.9, fontSize: "0.875rem" }}>
                Your room has been reserved and payment processed successfully.
              </div>
            </div>
          </div>
        )}

        {cancelError && (
          <div
            style={{
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "var(--radius-sm)",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "var(--danger)",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {cancelError}
          </div>
        )}

        <div className="cozy-card mb-4">
          {/* Booking header */}
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-light))",
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "0.25rem",
                }}
              >
                Booking Reference
              </div>
              <h5
                style={{
                  color: "white",
                  margin: 0,
                  fontFamily: "Playfair Display, serif",
                }}
              >
                #{String(booking.id).padStart(6, "0")}
              </h5>
            </div>
            <span className={getStatusClass(booking.status)}>
              {booking.status}
            </span>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {/* Dates */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "var(--surface-warm)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "0.25rem",
                  }}
                >
                  Check-in
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  {new Date(booking.checkIn).getFullYear()}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-light)",
                  fontSize: "1.5rem",
                }}
              >
                →
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "0.25rem",
                  }}
                >
                  Check-out
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  {new Date(booking.checkOut).getFullYear()}
                </div>
              </div>
            </div>

            {/* Guest info */}
            <div className="row mb-4">
              {[
                { label: "Adults", value: booking.numberOfAdults },
                { label: "Children", value: booking.numberOfChildren },
                {
                  label: "Guest Ages",
                  value: booking.guestAges?.join(", ") || "-",
                },
              ].map(({ label, value }) => (
                <div className="col-md-4 mb-2" key={label}>
                  <div
                    style={{
                      padding: "0.6rem 0.75rem",
                      background: "var(--surface-warm)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-light)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fare breakdown */}
            <div
              style={{
                background: "var(--surface-warm)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <h6 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>
                💰 Fare Breakdown
              </h6>
              {[
                {
                  label: "Base Fare",
                  value: `₹${booking.baseFare?.toLocaleString()}`,
                },
                {
                  label: "Surcharge",
                  value: `₹${booking.surchargeAmount?.toLocaleString()}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                    marginBottom: "0.4rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <hr
                style={{ borderColor: "var(--border)", margin: "0.6rem 0" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600 }}>Total Fare</span>
                <span className="price-tag">
                  ₹{booking.totalFare?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment info */}
            {booking.payment && (
              <div
                style={{
                  background: "var(--surface-warm)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.25rem",
                }}
              >
                <h6 style={{ marginBottom: "0.75rem", fontWeight: 600 }}>
                  💳 Payment Details
                </h6>
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-light)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Status
                    </div>
                    <span className={getPaymentClass(booking.payment.status)}>
                      {booking.payment.status}
                    </span>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-light)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Method
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {booking.payment.method}
                    </div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-light)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Reference
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {booking.payment.transactionReference || "-"}
                    </div>
                  </div>
                  {booking.payment.refundAmount !== null &&
                    booking.payment.refundAmount !== undefined && (
                      <div className="col-md-4 mt-1">
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-light)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "0.2rem",
                          }}
                        >
                          Refund Amount
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--info)" }}>
                          ₹{booking.payment.refundAmount?.toLocaleString()}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Actions */}
            {booking.status === "Confirmed" && (
              <div>
                {!showCancelConfirm ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleShowCancelConfirm}
                    >
                      Cancel Booking
                    </button>
                    {new Date(booking.checkOut) < new Date() && (
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          navigate(`/bookings/${id}/review`, {
                            state: { booking },
                          })
                        }
                      >
                        ⭐ Write Review
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#fff3cd",
                      border: "1px solid #ffeeba",
                      borderRadius: "var(--radius-md)",
                      padding: "1.25rem",
                    }}
                  >
                    {policyLoading ? (
                      <p style={{ color: "#856404", margin: 0 }}>
                        Loading refund policy...
                      </p>
                    ) : (
                      refundPolicy && (
                        <div style={{ marginBottom: "1rem" }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#856404",
                              marginBottom: "0.4rem",
                            }}
                          >
                            ⚠️ Cancellation Notice
                          </div>
                          <p
                            style={{
                              color: "#856404",
                              fontSize: "0.875rem",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {refundPolicy.policy}
                          </p>
                          <div style={{ fontWeight: 700, color: "#856404" }}>
                            You will receive: ₹
                            {refundPolicy.refundAmount?.toLocaleString()} (
                            {refundPolicy.refundPercentage}% of ₹
                            {refundPolicy.totalFare?.toLocaleString()})
                          </div>
                        </div>
                      )
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Keep Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/my-bookings")}
          >
            ← My Bookings
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/")}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
