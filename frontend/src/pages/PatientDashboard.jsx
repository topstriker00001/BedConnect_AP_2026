import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function PatientDashboard({ user, onNeedLogin }) {
  const [tab, setTab] = useState("search");
  const [hospitals, setHospitals] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [city, setCity] = useState("");
  const [bedType, setBedType] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [reqForm, setReqForm] = useState({ patientName: "", patientPhone: "", bedType: "GENERAL" });
  const [msg, setMsg] = useState("");

  const fetchHospitals = async () => {
    const { data } = await api.get("/hospitals", { params: { city, bedType } });
    setHospitals(data);
  };

  const fetchMyRequests = async () => {
    if (!user || user.role !== "PATIENT") return;
    const { data } = await api.get("/requests/my");
    setMyRequests(data);
  };

  useEffect(() => {
    fetchHospitals();
  }, [bedType]);

  useEffect(() => {
    if (tab === "requests") fetchMyRequests();
  }, [tab]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/requests", {
        hospitalId: selectedHospital.id,
        ...reqForm,
      });
      setSelectedHospital(null);
      setReqForm({ patientName: "", patientPhone: "", bedType: "GENERAL" });
      setMsg("Bed request sent! Track status in 'My Requests'.");
      fetchMyRequests();
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to submit request.");
    }
  };

  return (
    <div>
      <div className="tabs">
        <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>
          Find Available Beds
        </button>
        {user?.role === "PATIENT" && (
          <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
            My Requests
          </button>
        )}
      </div>

      {msg && <div className="info-msg">{msg}</div>}

      {tab === "search" && (
        <>
          <div className="search-bar">
            <input
              placeholder="Search by city (e.g. Delhi, Sonipat)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <select value={bedType} onChange={(e) => setBedType(e.target.value)}>
              <option value="">All Bed Types</option>
              <option value="GENERAL">General Beds Available</option>
              <option value="ICU">ICU Beds Available</option>
              <option value="VENTILATOR">Ventilators Available</option>
            </select>
            <button className="btn-primary" onClick={fetchHospitals}>Search</button>
          </div>

          <div className="card-grid">
            {hospitals.length === 0 && <p>No hospitals found matching your criteria.</p>}
            {hospitals.map((h) => (
              <div key={h.id} className="card">
                <h3>{h.name}</h3>
                <p className="muted">{h.city} • {h.address}</p>
                <p className="muted">Phone: {h.phone}</p>

                <div className="stats-row">
                  <div className="stat">
                    <span>General</span>
                    <strong>{h.generalBeds}</strong>
                  </div>
                  <div className="stat">
                    <span>ICU</span>
                    <strong>{h.icuBeds}</strong>
                  </div>
                  <div className="stat">
                    <span>Ventilators</span>
                    <strong>{h.ventilators}</strong>
                  </div>
                </div>

                <button
                  className="btn-primary full-width"
                  onClick={() => (user ? setSelectedHospital(h) : onNeedLogin())}
                >
                  Request Bed
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "requests" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hospital</th>
                <th>City</th>
                <th>Patient</th>
                <th>Bed Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 && (
                <tr><td colSpan="5">No bed requests yet.</td></tr>
              )}
              {myRequests.map((r) => (
                <tr key={r.id}>
                  <td>{r.hospital.name}</td>
                  <td>{r.hospital.city}</td>
                  <td>{r.patientName} ({r.patientPhone})</td>
                  <td>{r.bedType}</td>
                  <td><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedHospital && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Request Bed at {selectedHospital.name}</h3>
            <form onSubmit={handleRequestSubmit}>
              <label>Patient Name</label>
              <input
                required
                value={reqForm.patientName}
                onChange={(e) => setReqForm({ ...reqForm, patientName: e.target.value })}
              />
              <label>Contact Phone</label>
              <input
                required
                value={reqForm.patientPhone}
                onChange={(e) => setReqForm({ ...reqForm, patientPhone: e.target.value })}
              />
              <label>Bed Type Needed</label>
              <select
                value={reqForm.bedType}
                onChange={(e) => setReqForm({ ...reqForm, bedType: e.target.value })}
              >
                <option value="GENERAL">General Bed ({selectedHospital.generalBeds} left)</option>
                <option value="ICU">ICU Bed ({selectedHospital.icuBeds} left)</option>
                <option value="VENTILATOR">Ventilator ({selectedHospital.ventilators} left)</option>
              </select>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedHospital(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}