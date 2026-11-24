# BedConnect (AP) — Query Timings Report

**Database:** PostgreSQL (`ap_benchmark`, loaded from `dbms/03_schema.sql`)  
**Seeded Dataset Size:** `users`: 5,000 rows | `hospitals`: 500 rows | `resource_availability`: 1,960 rows | `bed_requests`: 25,000 rows  
**Benchmark Method:** Every query in `dbms/04_queries.sql` executed 3 times with `EXPLAIN (ANALYZE, BUFFERS)` inside `BEGIN; ... ROLLBACK;` after `VACUUM ANALYZE`.  
**Raw Execution Plans:** Saved per query in `dbms/plans/` (`R1.txt`–`R22.txt`, `W1.txt`–`W8.txt`).

---

## Query Timing Table

| Query | Type | What it does | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) | Scan type |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| R1 | READ | Find user by email for login | 0.059 | 0.024 | 0.023 | 0.035 | Index Scan |
| R2 | READ | Get user profile by user_id | 0.026 | 0.023 | 0.027 | 0.025 | Index Scan |
| R3 | READ | Get all registered patients | 1.010 | 0.994 | 0.941 | 0.982 | Seq Scan |
| R4 | READ | Get all hospitals | 0.880 | 0.378 | 0.374 | 0.544 | Seq Scan |
| R5 | READ | Search hospitals by city | 0.155 | 0.142 | 0.135 | 0.144 | Seq Scan |
| R6 | READ | Get hospitals managed by a specific admin | 0.034 | 0.033 | 0.034 | 0.034 | Seq Scan |
| R7 | READ | Get all resources of a hospital | 0.029 | 0.019 | 0.019 | 0.022 | Index Scan |
| R8 | READ | Search available resources by city and resource type | 0.162 | 0.147 | 0.150 | 0.153 | Seq Scan / Index Scan |
| R9 | READ | Search hospitals with available ventilators | 0.224 | 0.215 | 0.216 | 0.218 | Seq Scan |
| R10 | READ | Get total available resources by type | 0.224 | 0.217 | 0.248 | 0.230 | Seq Scan |
| R11 | READ | Get all bed requests made by a patient | 0.772 | 0.776 | 0.857 | 0.802 | Seq Scan |
| R12 | READ | Get pending bed requests for a hospital | 0.937 | 1.013 | 0.981 | 0.977 | Seq Scan / Index Scan |
| R13 | READ | Get resource summary for a hospital | 0.031 | 0.030 | 0.030 | 0.030 | Index Scan |
| R14 | READ | Get request statistics for a hospital | 0.628 | 0.587 | 0.588 | 0.601 | Seq Scan |
| R15 | READ | Get 20 most recent requests for a hospital | 1.180 | 1.206 | 1.273 | 1.220 | Index Scan / Seq Scan |
| R16 | READ | Get total platform statistics | 2.279 | 2.361 | 2.364 | 2.335 | Seq Scan |
| R17 | READ | Get hospital count by city | 0.097 | 0.092 | 0.095 | 0.095 | Seq Scan |
| R18 | READ | Get total and occupied resource availability across all hospitals | 0.250 | 0.256 | 0.468 | 0.325 | Seq Scan |
| R19 | READ | Get most requested hospitals | 4.180 | 4.026 | 3.946 | 4.051 | Seq Scan |
| R20 | READ | Find hospitals with no resource records | 0.237 | 0.227 | 0.227 | 0.230 | Seq Scan |
| R21 | READ | Find resource records with zero availability | 0.176 | 0.156 | 0.154 | 0.162 | Seq Scan |
| R22 | READ | Get all bed requests with patient and hospital details | 9.744 | 9.669 | 9.909 | 9.774 | Seq Scan |
| W1 | WRITE | Register a new patient | 0.164 | 0.136 | 0.135 | 0.145 | — (Insert) |
| W2 | WRITE | Register a new hospital | 0.384 | 0.358 | 0.334 | 0.359 | — (Insert) |
| W3 | WRITE | Add resource availability for a hospital | 0.342 | 0.323 | 0.362 | 0.342 | — (Insert) |
| W4 | WRITE | Update resource availability for a hospital | 0.166 | 0.134 | 0.180 | 0.160 | Index Scan |
| W5 | WRITE | Create a bed request | 0.622 | 0.524 | 0.543 | 0.563 | — (Insert) |
| W6 | WRITE | Approve a pending request and decrement available resource count | 0.179 | 0.186 | 0.186 | 0.184 | Index Scan |
| W7 | WRITE | Reject a pending bed request | 0.115 | 0.112 | 0.124 | 0.117 | Index Scan |
| W8 | WRITE | Cancel a pending bed request | 0.113 | 0.111 | 0.113 | 0.112 | Index Scan |

---

## Key Observations

* **Workload Summary:** Combined average execution time across all 30 queries is **24.971 ms** (**22.989 ms** across the 22 `READ` queries and **1.982 ms** across the 8 `WRITE` queries).
* **Fast Index Lookups:** Point lookups and updates backed by primary keys or unique constraints (`R1`, `R2`, `R7`, `R13`, `W4`, `W6`, `W7`, `W8`) all execute via `Index Scan` in under **0.20 ms**.
* **Slowest Queries (Sequential Scans on `bed_requests`):** `R22` (**9.774 ms**), `R19` (**4.051 ms**), and `R16` (**2.335 ms**) scan all 25,000 rows of `bed_requests` with no secondary indexes on foreign keys (`hospital_id`, `patient_id`) or `status`. Adding composite indexes on `bed_requests(hospital_id, status, request_date DESC)` and `bed_requests(patient_id, request_date DESC)` would convert `R11`, `R12`, `R14`, and `R15` from `Seq Scan` to `Index Scan` at higher scale.