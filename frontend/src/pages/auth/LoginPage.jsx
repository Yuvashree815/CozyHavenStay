import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../api/authApi";

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use refs instead of state — always have the latest value instantly
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    // Manual validation
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      const { token, userId, fullName, role } = response.data;
      login(token, { userId, fullName, email, role });
      if (role === "Admin") navigate("/admin/dashboard");
      else if (role === "HotelOwner") navigate("/owner/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div
      className="row justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="col-md-5 col-lg-4">
        {/* Logo */}
        <div className="text-center mb-4">
          <div
            style={{
              width: 64,
              height: 64,
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-light))",
              borderRadius: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              marginBottom: "1rem",
              boxShadow: "var(--shadow-md)",
            }}
          >
            🏨
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif" }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Sign in to your CozyHavenStay account
          </p>
        </div>

        <div className="cozy-form-card">
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

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="you@example.com"
                  style={{ padding: "0.7rem 1rem" }}
                  autoComplete="email"
                  onChange={() => {
                    if (error) setError("");
                  }}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0">Password</label>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--primary)",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  ref={passwordRef}
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  style={{ padding: "0.7rem 1rem" }}
                  autoComplete="current-password"
                  onChange={() => {
                    if (error) setError("");
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                style={{ padding: "0.75rem", fontSize: "1rem" }}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <hr className="divider mt-4" />

            <p className="text-center mb-0" style={{ fontSize: "0.9rem" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>Demo Admin:</strong>{" "}
          admin@cozyhavenstay.com / CozyHaven@Admin123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
