const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      hospitalName,
      city,
      address,
      phone,
      generalBeds,
      icuBeds,
      ventilators,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "HOSPITAL_ADMIN" ? "HOSPITAL_ADMIN" : "PATIENT";

    if (userRole === "HOSPITAL_ADMIN" && (!hospitalName || !city || !address || !phone)) {
      return res.status(400).json({ error: "All hospital details are required for Hospital Admin." });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        ...(userRole === "HOSPITAL_ADMIN" && {
          hospital: {
            create: {
              name: hospitalName,
              city,
              address,
              phone,
              generalBeds: Math.max(0, Number(generalBeds) || 0),
              icuBeds: Math.max(0, Number(icuBeds) || 0),
              ventilators: Math.max(0, Number(ventilators) || 0),
            },
          },
        }),
      },
      include: { hospital: true },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
