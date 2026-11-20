const express = require("express");
const prisma = require("../config/prisma");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// POST /api/requests (Patient creates a bed request)
router.post("/", verifyToken, requireRole("PATIENT"), async (req, res) => {
  try {
    const { hospitalId, patientName, patientPhone, bedType } = req.body;

    if (!hospitalId || !patientName || !patientPhone || !bedType) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const request = await prisma.bedRequest.create({
      data: {
        hospitalId: Number(hospitalId),
        patientId: req.user.userId,
        patientName,
        patientPhone,
        bedType,
      },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit bed request." });
  }
});

// GET /api/requests/my (Patient views their requests)
router.get("/my", verifyToken, requireRole("PATIENT"), async (req, res) => {
  try {
    const requests = await prisma.bedRequest.findMany({
      where: { patientId: req.user.userId },
      include: { hospital: { select: { name: true, city: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your requests." });
  }
});

// GET /api/requests/hospital (Hospital Admin views incoming requests)
router.get("/hospital", verifyToken, requireRole("HOSPITAL_ADMIN"), async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: req.user.userId },
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found." });

    const requests = await prisma.bedRequest.findMany({
      where: { hospitalId: hospital.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospital requests." });
  }
});

// PATCH /api/requests/:id (Hospital Admin approves/rejects atomically)
router.patch("/:id", verifyToken, requireRole("HOSPITAL_ADMIN"), async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be APPROVED or REJECTED." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const bedReq = await tx.bedRequest.findUnique({
        where: { id: requestId },
        include: { hospital: true },
      });

      if (!bedReq || bedReq.hospital.adminId !== req.user.userId) {
        throw new Error("NOT_FOUND");
      }

      if (bedReq.status !== "PENDING") {
        throw new Error("ALREADY_PROCESSED");
      }

      if (status === "APPROVED") {
        const fieldMap = {
          GENERAL: "generalBeds",
          ICU: "icuBeds",
          VENTILATOR: "ventilators",
        };
        const bedField = fieldMap[bedReq.bedType];

        if (bedReq.hospital[bedField] <= 0) {
          throw new Error("NO_BEDS_AVAILABLE");
        }

        await tx.hospital.update({
          where: { id: bedReq.hospitalId },
          data: { [bedField]: { decrement: 1 } },
        });
      }

      return tx.bedRequest.update({
        where: { id: requestId },
        data: { status },
      });
    });

    res.json(result);
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Request not found." });
    if (err.message === "ALREADY_PROCESSED") return res.status(400).json({ error: "Request already processed." });
    if (err.message === "NO_BEDS_AVAILABLE") return res.status(400).json({ error: "No beds of this type left to approve." });
    console.error(err);
    res.status(500).json({ error: "Failed to update request." });
  }
});

module.exports = router;
