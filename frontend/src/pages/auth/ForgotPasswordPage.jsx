import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../api/authApi";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
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
            🔑
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif" }}>
            Forgot Password?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            No worries — we'll send you a reset link
          </p>
        </div>

        <div className="cozy-form-card">
          <div className="cozy-form-body">
            {!submitted ? (
              <>
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
                  <div className="mb-4">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                      style={{ padding: "0.7rem 1rem" }}
                    />
                    <small
                      style={{
                        color: "var(--text-light)",
                        fontSize: "0.8rem",
                        marginTop: "0.3rem",
                        display: "block",
                      }}
                    >
                      We'll send a reset link to this email address
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                    style={{ padding: "0.75rem", fontSize: "1rem" }}
                  >
                    {loading ? "Sending..." : "📧 Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "#d4edda",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    marginBottom: "1rem",
                  }}
                >
                  ✅
                </div>
                <h5
                  style={{
                    fontFamily: "Playfair Display, serif",
                    marginBottom: "0.75rem",
                  }}
                >
                  Check your inbox!
                </h5>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  If an account exists for <strong>{email}</strong>, we've sent
                  a password reset link. Check your spam folder if you don't see
                  it within a few minutes.
                </p>
                <div
                  style={{
                    background: "var(--surface-warm)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1.25rem",
                  }}
                >
                  ⏱️ The reset link expires in <strong>1 hour</strong>
                </div>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                >
                  ← Back
                </button>
              </div>
            )}

            <hr className="divider mt-4" />
            <p className="text-center mb-0" style={{ fontSize: "0.9rem" }}>
              Remember your password?{" "}
              <Link
                to="/login"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
