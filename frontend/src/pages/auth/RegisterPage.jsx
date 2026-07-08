import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUserApi, registerHotelOwnerApi } from "../../api/authApi";

const getPasswordStrength = (password) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "#e74c3c", width: "25%" };
  if (score === 3) return { label: "Fair", color: "#f39c12", width: "50%" };
  if (score === 4) return { label: "Good", color: "#2ecc71", width: "75%" };
  return { label: "Strong", color: "#27ae60", width: "100%" };
};

const validateField = (name, value, formData) => {
  switch (name) {
    case "fullName":
      return value.trim().length < 2
        ? "Full name must be at least 2 characters"
        : "";
    case "email":
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? "Please enter a valid email address"
        : "";
    case "password":
      if (value.length < 8) return "Password must be at least 8 characters";
      if (!/[A-Z]/.test(value))
        return "Must contain at least one uppercase letter";
      if (!/[a-z]/.test(value))
        return "Must contain at least one lowercase letter";
      if (!/[0-9]/.test(value)) return "Must contain at least one number";
      if (!/[^a-zA-Z0-9]/.test(value))
        return "Must contain at least one special character";
      return "";
    case "confirmPassword":
      return value !== formData.password ? "Passwords do not match" : "";
    case "phoneNumber":
      return !/^\+?[0-9]{7,15}$/.test(value)
        ? "Phone number must be 7-15 digits"
        : "";
    case "gender":
      return !value ? "Please select a gender" : "";
    case "address":
      return value.trim().length < 5
        ? "Address must be at least 5 characters"
        : "";
    default:
      return "";
  }
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    role: "User",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation if field has been touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, { ...formData, [name]: value }),
      }));
    }

    // Also revalidate confirmPassword when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword !== value ? "Passwords do not match" : "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all fields
    const requiredFields = [
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "gender",
      "phoneNumber",
      "address",
    ];
    const newErrors = {};
    const newTouched = {};

    requiredFields.forEach((field) => {
      newTouched[field] = true;
      newErrors[field] = validateField(field, formData[field], formData);
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e)) return;

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || null,
      };
      if (formData.role === "HotelOwner") {
        await registerHotelOwnerApi(payload);
      } else {
        await registerUserApi(payload);
      }
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.length > 0
          ? errors.join(" ")
          : err.response?.data?.message || "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    borderColor: touched[name]
      ? errors[name]
        ? "#e74c3c"
        : "#2ecc71"
      : undefined,
    boxShadow:
      touched[name] && !errors[name]
        ? "0 0 0 3px rgba(46,204,113,0.1)"
        : touched[name] && errors[name]
          ? "0 0 0 3px rgba(231,76,60,0.1)"
          : undefined,
  });

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-7 col-lg-6">
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
            Create Account
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Join thousands of travelers on CozyHavenStay
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
            {success && (
              <div
                style={{
                  background: "#d4edda",
                  border: "1px solid #c3e6cb",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "var(--success)",
                  fontSize: "0.9rem",
                }}
              >
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Role selection */}
              <div className="mb-4">
                <label className="form-label">I want to</label>
                <div className="d-flex gap-2">
                  {[
                    {
                      value: "User",
                      label: "🧳 Book Hotels",
                      desc: "As a Guest",
                    },
                    {
                      value: "HotelOwner",
                      label: "🏨 List Hotels",
                      desc: "As an Owner",
                    },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: value })}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background:
                          formData.role === value
                            ? "var(--primary)"
                            : "var(--surface)",
                        border: `2px solid ${
                          formData.role === value
                            ? "var(--primary)"
                            : "var(--border)"
                        }`,
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        color:
                          formData.role === value
                            ? "white"
                            : "var(--text-primary)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your full name"
                  style={inputStyle("fullName")}
                />
                {touched.fullName && errors.fullName && (
                  <div
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ {errors.fullName}
                  </div>
                )}
                {touched.fullName && !errors.fullName && (
                  <div
                    style={{
                      color: "#2ecc71",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ✓ Looks good
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  style={inputStyle("email")}
                />
                {touched.email && errors.email && (
                  <div
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ {errors.email}
                  </div>
                )}
                {touched.email && !errors.email && (
                  <div
                    style={{
                      color: "#2ecc71",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ✓ Valid email
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  style={inputStyle("password")}
                />

                {/* Password strength bar */}
                {formData.password && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div
                      style={{
                        height: 4,
                        background: "#e0e0e0",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: passwordStrength?.width,
                          background: passwordStrength?.color,
                          borderRadius: 4,
                          transition: "all 0.3s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        marginTop: "0.25rem",
                        color: passwordStrength?.color,
                        fontWeight: 600,
                      }}
                    >
                      Password strength: {passwordStrength?.label}
                    </div>
                  </div>
                )}

                {/* Password requirements */}
                {formData.password && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.6rem 0.75rem",
                      background: "var(--surface-warm)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {[
                      {
                        rule: formData.password.length >= 8,
                        text: "At least 8 characters",
                      },
                      {
                        rule: /[A-Z]/.test(formData.password),
                        text: "One uppercase letter",
                      },
                      {
                        rule: /[a-z]/.test(formData.password),
                        text: "One lowercase letter",
                      },
                      {
                        rule: /[0-9]/.test(formData.password),
                        text: "One number",
                      },
                      {
                        rule: /[^a-zA-Z0-9]/.test(formData.password),
                        text: "One special character",
                      },
                    ].map(({ rule, text }) => (
                      <div
                        key={text}
                        style={{
                          color: rule ? "#27ae60" : "#e74c3c",
                          marginBottom: "0.15rem",
                        }}
                      >
                        {rule ? "✓" : "✗"} {text}
                      </div>
                    ))}
                  </div>
                )}

                {touched.password && errors.password && (
                  <div
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repeat your password"
                  style={inputStyle("confirmPassword")}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ {errors.confirmPassword}
                  </div>
                )}
                {touched.confirmPassword &&
                  !errors.confirmPassword &&
                  formData.confirmPassword && (
                    <div
                      style={{
                        color: "#2ecc71",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ✓ Passwords match
                    </div>
                  )}
              </div>

              <div className="row">
                {/* Gender */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={inputStyle("gender")}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ {errors.gender}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    style={inputStyle("phoneNumber")}
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠️ {errors.phoneNumber}
                    </div>
                  )}
                  {touched.phoneNumber &&
                    !errors.phoneNumber &&
                    formData.phoneNumber && (
                      <div
                        style={{
                          color: "#2ecc71",
                          fontSize: "0.8rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        ✓ Valid number
                      </div>
                    )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your address"
                  style={inputStyle("address")}
                />
                {touched.address && errors.address && (
                  <div
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠️ {errors.address}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label className="form-label">
                  Date of Birth{" "}
                  <span style={{ color: "var(--text-light)", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                style={{ padding: "0.75rem", fontSize: "1rem" }}
              >
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            <hr className="divider mt-4" />
            <p className="text-center mb-0" style={{ fontSize: "0.9rem" }}>
              Already have an account?{" "}
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

export default RegisterPage;
