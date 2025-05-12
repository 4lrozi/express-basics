// routes/users.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const pool = require("../db"); // <-- import your pool
const router = express.Router();

// GET /api/users — list all users
router.get("/", async (req, res, next) => {
  try {
    // In routes/users.js GET handler:
    const [rows] = await pool.query(`
    SELECT id, name, email, created_at, updated_at
    FROM users
  `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/users — create a new user
router.post(
  "/",
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Must be a valid email address."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { name, email } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
      );
      // result.insertId holds the new record’s ID
      res.status(201).json({ id: result.insertId, name, email });
    } catch (err) {
      // handle duplicate email error
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already exists." });
      }
      next(err);
    }
  }
);

// PUT /api/users/:id — update a user
router.put(
  "/:id",
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),
  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty.")
    .isEmail()
    .withMessage("Must be a valid email address."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (!fields.length) {
      return res
        .status(400)
        .json({ error: "At least one of name or email must be provided." });
    }

    values.push(id); // for WHERE clause

    try {
      const [resut] = await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found." });
      }
      // Return the updated record
      const [[user]] = await pool.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [id]
      );
      res.json(user);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already exists." });
      }
      next(err);
    }
  }
);

// DELETE /api/users/:id — delete a user
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(204).send(); // 204 No Content
  } catch (err) {
    next(err);
  }
});

module.exports = router;
