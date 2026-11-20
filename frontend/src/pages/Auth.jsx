import React, { useState } from "react";
import api from "../api/client";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT",
    hospitalName: "",
    city: "",
    address: "",
    phone: "",
    generalBeds: 10,
    icuBeds: 5,
    ventilators: 2,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="auth-card">
      <h2>{isLogin ? "Login to BedConnect" : "Create Account"}</h2>
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Account Type</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="PATIENT">Patient / Family</option>
              <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
            </select>
          </>
        )}

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        {!isLogin && form.role === "HOSPITAL_ADMIN" && (
          <div className="hospital-fields">
            <h4>Hospital Details</h4>
            <label>Hospital Name</label>
            <input name="hospitalName" value={form.hospitalName} onChange={handleChange} required />

            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} required />

            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required />

            <label>Contact Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />

            <div className="grid-3">
              <div>
                <label>General Beds</label>
                <input type="number" min="0" name="generalBeds" value={form.generalBeds} onChange={handleChange} />
              </div>
              <div>
                <label>ICU Beds</label>
                <input type="number" min="0" name="icuBeds" value={form.icuBeds} onChange={handleChange} />
              </div>
              <div>
                <label>Ventilators</label>
                <input type="number" min="0" name="ventilators" value={form.ventilators} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary full-width">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p className="toggle-text">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button className="link-btn" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}