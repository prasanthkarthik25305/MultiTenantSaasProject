import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenantName: "",
    subdomain: "",
    email: "",
    password: "",
    fullName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(
      formData.tenantName,
      formData.subdomain,
      formData.email,
      formData.password,
      formData.fullName
    );

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
      <div className="auth-form">
        <h2>Register Your Organization</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization Name</label>
            <input
              type="text"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              placeholder="Acme Corp"
              required
            />
          </div>

          <div className="form-group">
            <label>Subdomain</label>
            <input
              type="text"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              placeholder="acme"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
              required
            />
            <small>Your URL will be: {formData.subdomain || "your-subdomain"}.example.com</small>
          </div>

          <div className="form-group">
            <label>Your Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@acme.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength="6"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/">Login here</a>
        </p>
      </div>
    </div>
  );
}