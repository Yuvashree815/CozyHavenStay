import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHotelBookingsApi } from "../../api/bookingApi";

const HotelBookingsPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [hotelId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getHotelBookingsApi(hotelId);
      setBookings(response.data || []);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
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
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Loading bookings...
        </p>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h4 className="page-title">Hotel Bookings</h4>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {bookings.length} booking(s) for this property
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/owner/hotels")}
        >
          ← My Hotels
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            color: "var(--danger)",
            fontSize: "0.875rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
          <h5
            style={{
              fontFamily: "Playfair Display, serif",
              marginBottom: "0.5rem",
            }}
          >
            No bookings yet
          </h5>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Bookings for this hotel will appear here once guests start
            reserving.
          </p>
        </div>
      ) : (
        <div className="admin-card">
          <table className="pro-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "1.5rem" }}>Booking</th>
                <th>Dates</th>
                <th>Guests</th>
                <th>Total Fare</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ paddingLeft: "1.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      #{String(booking.id).padStart(6, "0")}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-light)",
                      }}
                    >
                      Guest #{booking.userId}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {" → "}
                      {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {booking.numberOfAdults}A + {booking.numberOfChildren}C
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 700,
                        color: "var(--primary)",
                        fontSize: "0.95rem",
                      }}
                    >
                      ₹{booking.totalFare?.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusClass(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.payment && (
                      <span className={getPaymentClass(booking.payment.status)}>
                        {booking.payment.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelBookingsPage;
