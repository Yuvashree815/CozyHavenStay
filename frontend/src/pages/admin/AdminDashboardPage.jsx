import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsersApi, registerAdminApi } from "../../api/authApi";
import { getAllHotelsAdminApi } from "../../api/hotelApi";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalHotels: 0 });
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phoneNumber: "",
    address: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, hotelsRes] = await Promise.all([
        getAllUsersApi(1, 1),
        getAllHotelsAdminApi(1, 1),
      ]);
      setStats({
        totalUsers: usersRes.data.totalCount,
        totalHotels: hotelsRes.data.totalCount,
      });
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleAdminFormChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    if (adminForm.password !== adminForm.confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    setRegisterLoading(true);
    try {
      await registerAdminApi(adminForm);
      setRegisterSuccess("Admin registered successfully!");
      setAdminForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        phoneNumber: "",
        address: "",
      });
      fetchStats();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setRegisterError(
        errors?.length > 0
          ? errors.join(" ")
          : err.response?.data?.message || "Failed to register admin.",
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "var(--primary)" }}
          role="status"
        />
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Loading dashboard...
        </p>
      </div>
    );

  return (
    <div>
      {/* Welcome header */}
      <div className="dashboard-header mb-4">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p
                style={{
                  color: "var(--accent)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                System Administration
              </p>
              <h3 style={{ color: "white", marginBottom: "0.25rem" }}>
                Admin Dashboard 👑
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 0,
                  fontSize: "0.9rem",
                }}
              >
                Welcome, {user?.fullName} — manage users and hotels from here.
              </p>
            </div>
            <button
              className="btn-gold"
              onClick={() => {
                setShowModal(true);
                setRegisterError("");
                setRegisterSuccess("");
              }}
              style={{ borderRadius: "var(--radius-sm)", whiteSpace: "nowrap" }}
            >
              ➕ Add Admin
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        {[
          {
            icon: "👥",
            value: stats.totalUsers,
            label: "Total Users",
            color: "var(--primary)",
          },
          {
            icon: "🏨",
            value: stats.totalHotels,
            label: "Total Hotels",
            color: "var(--success)",
          },
          {
            icon: "👑",
            value: "Admin",
            label: "Your Role",
            color: "var(--accent)",
          },
        ].map(({ icon, value, label, color }) => (
          <div className="col-md-4 mb-3" key={label}>
            <div className="stat-card">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                {icon}
              </div>
              <div className="stat-number" style={{ color }}>
                {value}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Management cards */}
      <h5 className="section-title mb-3">Management</h5>
      <div className="row mb-4">
        {[
          {
            icon: "👥",
            label: "Manage Users",
            desc: "View all registered users, check their roles and status, and deactivate accounts when needed.",
            path: "/admin/users",
            color: "var(--primary)",
            stat: `${stats.totalUsers} registered`,
          },
          {
            icon: "🏨",
            label: "Manage Hotels",
            desc: "Browse all hotel listings on the platform, verify details, and deactivate problematic listings.",
            path: "/admin/hotels",
            color: "var(--success)",
            stat: `${stats.totalHotels} listed`,
          },
        ].map(({ icon, label, desc, path, color, stat }) => (
          <div className="col-md-6 mb-3" key={label}>
            <div className="cozy-card h-100">
              <div style={{ padding: "1.5rem" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "var(--radius-sm)",
                      background: `${color}15`,
                      border: `1.5px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    {icon}
                  </div>
                  <span
                    style={{
                      background: "var(--surface-warm)",
                      border: "1px solid var(--border)",
                      borderRadius: "20px",
                      padding: "0.2rem 0.75rem",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {stat}
                  </span>
                </div>

                <h5
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </h5>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    marginBottom: "1.25rem",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(path)}
                >
                  Open {label} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Admin Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(26,60,94,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "none",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
              }}
            >
              <div className="cozy-form-header d-flex justify-content-between align-items-center">
                <h5
                  style={{
                    color: "white",
                    margin: 0,
                    fontFamily: "Playfair Display, serif",
                  }}
                >
                  ➕ Register New Admin
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                {registerError && (
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
                    ⚠️ {registerError}
                  </div>
                )}
                {registerSuccess && (
                  <div
                    style={{
                      background: "#d4edda",
                      border: "1px solid #c3e6cb",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem 1rem",
                      marginBottom: "1rem",
                      color: "var(--success)",
                      fontSize: "0.875rem",
                    }}
                  >
                    ✅ {registerSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterAdmin}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={adminForm.fullName}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="Min 8 chars"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={adminForm.confirmPassword}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={adminForm.gender}
                        onChange={handleAdminFormChange}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phoneNumber"
                        value={adminForm.phoneNumber}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={adminForm.address}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={registerLoading}
                    >
                      {registerLoading ? "Registering..." : "Register Admin"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
