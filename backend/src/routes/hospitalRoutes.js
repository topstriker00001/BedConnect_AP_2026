const express = require("express");
const prisma = require("../config/prisma");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/hospitals?city=...&bedType=... (Public)
router.get("/", async (req, res) => {
  try {
    const { city, bedType } = req.query;
    const where = {};

    if (city && city.trim() !== "") {
      where.city = { contains: city.trim(), mode: "insensitive" };
    }

    if (bedType === "GENERAL") where.generalBeds = { gt: 0 };
    if (bedType === "ICU") where.icuBeds = { gt: 0 };
    if (bedType === "VENTILATOR") where.ventilators = { gt: 0 };

    const hospitals = await prisma.hospital.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    res.json(hospitals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospitals." });
  }
});

// GET /api/hospitals/my (Hospital Admin only)
router.get("/my", verifyToken, requireRole("HOSPITAL_ADMIN"), async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { adminId: req.user.userId },
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found." });
    res.json(hospital);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load hospital profile." });
  }
});

// PATCH /api/hospitals/beds (Hospital Admin only)
router.patch("/beds", verifyToken, requireRole("HOSPITAL_ADMIN"), async (req, res) => {
  try {
    const { generalBeds, icuBeds, ventilators } = req.body;

    const updated = await prisma.hospital.update({
      where: { adminId: req.user.userId },
      data: {
        generalBeds: Math.max(0, Number(generalBeds) || 0),
        icuBeds: Math.max(0, Number(icuBeds) || 0),
        ventilators: Math.max(0, Number(ventilators) || 0),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update bed counts." });
  }
});

module.exports = router;
