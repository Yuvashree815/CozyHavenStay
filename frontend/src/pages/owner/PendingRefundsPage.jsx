import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingRefundsApi, approveRefundApi } from "../../api/bookingApi";
import { getHotelByIdApi } from "../../api/hotelApi";

const PendingRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [hotelNames, setHotelNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await getPendingRefundsApi();
      const data = response.data || [];
      setRefunds(data);

      // Fetch hotel names for all unique hotel IDs
      const uniqueHotelIds = [...new Set(data.map((b) => b.hotelId))];
      const hotelMap = {};
      await Promise.all(
        uniqueHotelIds.map(async (hotelId) => {
          try {
            const hotelRes = await getHotelByIdApi(hotelId);
            hotelMap[hotelId] = hotelRes.data;
          } catch {
            hotelMap[hotelId] = null;
          }
        })
      );
      setHotelNames(hotelMap);
    } catch {
      setError("Failed to load pending refunds.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    setApprovingId(bookingId);
    try {
      await approveRefundApi(bookingId);
      setRefunds(refunds.filter((r) => r.id !== bookingId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve refund.");
    } finally {
      setApprovingId(null);
    }
  };

  const nights = (checkIn, checkOut) =>
    Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--primary)" }} />
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Loading pending refunds...
        </p>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h4 className="page-title">Pending Refunds</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
            {refunds.length > 0
              ? `${refunds.length} refund(s) awaiting your approval`
              : "All refunds processed"}
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/owner/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {error && (
        <div style={{
          background: "#f8d7da", border: "1px solid #f5c6cb",
          borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem",
          marginBottom: "1rem", color: "var(--danger)", fontSize: "0.875rem",
        }}>
          ⚠️ {error}
        </div>
      )}

      {refunds.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h5 style={{ fontFamily: "Playfair Display, serif", marginBottom: "0.5rem" }}>
            All caught up!
          </h5>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            No pending refunds at this time.
          </p>
        </div>
      ) : (
        <div>
          {refunds.map((booking) => {
            const hotel = hotelNames[booking.hotelId];
            const stayNights = nights(booking.checkIn, booking.checkOut);

            return (
              <div
                key={booking.id}
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid #ffeeba",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Header */}
                <div style={{
                  background: "#fffbf0",
                  borderBottom: "1px solid #ffeeba",
                  padding: "0.85rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      Booking #{String(booking.id).padStart(6, "0")}
                    </span>
                    <span style={{
                      marginLeft: "0.75rem", fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}>
                      Guest #{booking.userId}
                    </span>
                  </div>
                  <span className="badge-pending">⏳ Refund Pending</span>
                </div>

                {/* Hotel info banner */}
                <div style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  padding: "0.75rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Hotel image if available */}
                  {hotel?.imageUrl && (
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      style={{
                        width: 60, height: 60,
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                        border: "2px solid rgba(255,255,255,0.3)"
                      }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  {!hotel?.imageUrl && (
                    <div style={{
                      width: 60, height: 60,
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.75rem",
                      flexShrink: 0
                    }}>
                      🏨
                    </div>
                  )}
                  <div>
                    <div style={{
                      fontFamily: "Playfair Display, serif",
                      fontWeight: 600, fontSize: "1rem", color: "white"
                    }}>
                      {hotel?.name ?? `Hotel #${booking.hotelId}`}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>
                      📍 {hotel?.location ?? "—"}
                      {" · "}
                      🛏️ Room #{booking.roomId}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "1.25rem" }}>
                  <div className="row">
                    <div className="col-md-6">
                      {[
                        {
                          label: "Check-in",
                          value: new Date(booking.checkIn).toLocaleDateString(
                            "en-IN", { day: "numeric", month: "short", year: "numeric" }
                          ),
                        },
                        {
                          label: "Check-out",
                          value: new Date(booking.checkOut).toLocaleDateString(
                            "en-IN", { day: "numeric", month: "short", year: "numeric" }
                          ),
                        },
                        {
                          label: "Duration",
                          value: `${stayNights} night${stayNights > 1 ? "s" : ""}`,
                        },
                        {
                          label: "Guests",
                          value: `${booking.numberOfAdults} adult(s), ${booking.numberOfChildren} child(ren)`,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ marginBottom: "0.5rem" }}>
                          <span style={{
                            fontSize: "0.75rem", color: "var(--text-light)",
                            textTransform: "uppercase", letterSpacing: "0.5px",
                          }}>
                            {label}
                          </span>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-md-6">
                      {[
                        {
                          label: "Payment Method",
                          value: booking.payment?.method || "—",
                          bold: false,
                        },
                        {
                          label: "Total Fare Paid",
                          value: `₹${booking.totalFare?.toLocaleString()}`,
                          bold: false,
                        },
                        {
                          label: "Refund Amount",
                          value: `₹${
                            booking.payment?.refundAmount !== null &&
                            booking.payment?.refundAmount !== undefined
                              ? booking.payment.refundAmount.toLocaleString()
                              : booking.totalFare?.toLocaleString()
                          }`,
                          bold: true,
                          color: "var(--info)",
                        },
                      ].map(({ label, value, bold, color }) => (
                        <div key={label} style={{ marginBottom: "0.5rem" }}>
                          <span style={{
                            fontSize: "0.75rem", color: "var(--text-light)",
                            textTransform: "uppercase", letterSpacing: "0.5px",
                          }}>
                            {label}
                          </span>
                          <div style={{
                            fontWeight: bold ? 700 : 500,
                            fontSize: bold ? "1.2rem" : "0.875rem",
                            color: color || "var(--text-primary)",
                            fontFamily: bold ? "Playfair Display, serif" : "inherit",
                          }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    marginTop: "1rem", paddingTop: "1rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem"
                  }}>
                    <div style={{
                      fontSize: "0.82rem", color: "var(--text-secondary)",
                      background: "var(--surface-warm)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.4rem 0.75rem"
                    }}>
                      💡 Approving will credit{" "}
                      <strong style={{ color: "var(--info)" }}>
                        ₹{booking.payment?.refundAmount?.toLocaleString() ?? booking.totalFare?.toLocaleString()}
                      </strong>{" "}
                      back to the guest's {booking.payment?.method ?? "account"}
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApprove(booking.id)}
                      disabled={approvingId === booking.id}
                    >
                      {approvingId === booking.id
                        ? "Processing..."
                        : "✅ Approve Refund"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingRefundsPage;