import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function AdminDashboard() {
  const [hospital, setHospital] = useState(null);
  const [beds, setBeds] = useState({ generalBeds: 0, icuBeds: 0, ventilators: 0 });
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    const [hospRes, reqRes] = await Promise.all([
      api.get("/hospitals/my"),
      api.get("/requests/hospital"),
    ]);
    setHospital(hospRes.data);
    setBeds({
      generalBeds: hospRes.data.generalBeds,
      icuBeds: hospRes.data.icuBeds,
      ventilators: hospRes.data.ventilators,
    });
    setRequests(reqRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBeds = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.patch("/hospitals/beds", beds);
      setMsg("Bed availability updated.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.error || "Update failed.");
    }
  };

  const handleStatus = async (id, status) => {
    setMsg("");
    try {
      await api.patch(`/requests/${id}`, { status });
      setMsg(`Request ${status.toLowerCase()}.`);
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.error || "Action failed.");
    }
  };

  if (!hospital) return <p>Loading hospital dashboard...</p>;

  return (
    <div>
      <h2>{hospital.name} — Admin Dashboard</h2>
      <p className="muted">{hospital.city} • {hospital.address} • {hospital.phone}</p>
      {msg && <div className="info-msg">{msg}</div>}

      <div className="card" style={{ marginBottom: "24px" }}>
        <h3>Update Live Bed Availability</h3>
        <form onSubmit={handleUpdateBeds} className="grid-3">
          <div>
            <label>General Beds</label>
            <input
              type="number"
              min="0"
              value={beds.generalBeds}
              onChange={(e) => setBeds({ ...beds, generalBeds: e.target.value })}
            />
          </div>
          <div>
            <label>ICU Beds</label>
            <input
              type="number"
              min="0"
              value={beds.icuBeds}
              onChange={(e) => setBeds({ ...beds, icuBeds: e.target.value })}
            />
          </div>
          <div>
            <label>Ventilators</label>
            <input
              type="number"
              min="0"
              value={beds.ventilators}
              onChange={(e) => setBeds({ ...beds, ventilators: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn-primary">Save Bed Counts</button>
          </div>
        </form>
      </div>

      <h3>Incoming Bed Requests</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Bed Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr><td colSpan="5">No incoming requests yet.</td></tr>
            )}
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.patientName}</td>
                <td>{r.patientPhone}</td>
                <td>{r.bedType}</td>
                <td><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>
                  {r.status === "PENDING" ? (
                    <div className="action-btns">
                      <button className="btn-approve" onClick={() => handleStatus(r.id, "APPROVED")}>
                        Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleStatus(r.id, "REJECTED")}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}