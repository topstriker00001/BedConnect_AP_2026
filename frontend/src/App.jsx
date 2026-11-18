import { useEffect, useState } from "react";
import { api } from "./api/client.js";

const hospitals = [
  { name: "AIIMS New Delhi", city: "New Delhi", icu: 13, beds: 53, ventilators: 6 },
  { name: "Sir Ganga Ram Hospital", city: "Delhi", icu: 9, beds: 39, ventilators: 4 },
  { name: "Kokilaben Hospital", city: "Mumbai", icu: 12, beds: 46, ventilators: 7 }
];

export default function App() {
  const [city, setCity] = useState("");
  const [connected, setConnected] = useState(false);
  useEffect(() => { api.get("/health").then(() => setConnected(true)).catch(() => setConnected(false)); }, []);
  const results = hospitals.filter((hospital) => hospital.city.toLowerCase().includes(city.toLowerCase()) || hospital.name.toLowerCase().includes(city.toLowerCase()));
  return <main>
    <nav><strong>✚ Bed<span>Connect</span></strong><small>{connected ? "API connected" : "Demo mode"}</small></nav>
    <section className="hero"><p>HOSPITAL RESOURCE DIRECTORY</p><h1>Find care.<br /><span>With clarity.</span></h1><label>Search by city or hospital<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Try Delhi or Mumbai" /></label></section>
    <section className="results"><h2>Available hospital resources</h2><div className="grid">{results.map((hospital) => <article key={hospital.name}><h3>{hospital.name}</h3><p>⌖ {hospital.city}</p><div><b>{hospital.beds}<small>General beds</small></b><b>{hospital.icu}<small>ICU beds</small></b><b>{hospital.ventilators}<small>Ventilators</small></b></div><button>Request a bed</button></article>)}</div>{!results.length && <p>No hospitals found for this search.</p>}</section>
    <footer>Demo availability only. Always call the hospital directly before travelling.</footer>
  </main>;
}
