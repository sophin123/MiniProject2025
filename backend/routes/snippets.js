const express = require('express');
const router = express.Router();
const verifyToken = require('../files/verifyToken.js');
const queries = require('../files/queries.js');
const { getFileshareDb } = require("../filesharedb.js")

// Get Snippet API
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const fileshareDb = await getFileshareDb();
    const [rows] = await fileshareDb.query(queries.GET_SNIPPETS_BY_USER, [userId]);
    if (rows.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// Upload snippet endpoint
router.post("/", verifyToken, async (req, res) => {
  const { text } = req.body;

  try {
    const fileshareDb = await getFileshareDb();
    await fileshareDb.query(queries.INSERT_SNIPPET, [req.user.userId, text]);
    res.status(200).json({ message: "Text Added Successfully" });
  } catch (err) {
    return res.status(500).json({ "Custom Error": err });
  }
});

// Delete snippet endpoint
router.delete("/:id", verifyToken, async (req, res) => {
  console.log("Delete id is", req.params.id);

  try {
    const fileshareDb = await getFileshareDb();
    await fileshareDb.query(queries.DELETE_SNIPPET_BY_ID, [req.params.id]);
    res.status(200).json({ message: `Deleted Successfully` });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
