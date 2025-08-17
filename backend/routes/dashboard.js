const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Dashboard endpoint
router.get('/', (req, res) => {
  // This is a placeholder for your dashboard logic
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded.userId);
    res.status(200).json({ message: "Dashboard data", user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
