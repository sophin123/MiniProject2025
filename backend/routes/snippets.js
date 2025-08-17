const express = require('express');
const router = express.Router();
const verifyToken = require('../files/verifyToken.js');
const queries = require('../files/queries.js');

// Get Snippet API
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.userId;

  req.db.query(queries.GET_SNIPPETS_BY_USER, [userId], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result);
  });
});

// Upload snippet endpoint
router.post("/", verifyToken, (req, res) => {
  const { text } = req.body;

  req.db.query(queries.INSERT_SNIPPET, [req.user.userId, text], (err, result) => {
    if (err) return res.status(500).json({ "Custom Error": err });
    res.status(200).json({ message: "Text Added Successfully" });
  });
});

// Delete snippet endpoint
router.delete("/:id", verifyToken, (req, res) => {
  console.log("Delete id is", req.params.id);

  req.db.query(queries.DELETE_SNIPPET_BY_ID, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.status(200).json({ message: `Deleted Successfully` });
  });
});

module.exports = router;
