const { requireAuth } = require("../middleware/auth");
const express = require("express");
const { db } = require("../db/db");

const router = express.Router();

/**
 * Ideiglenes auth: a user id-t a headerből vesszük.
 * Később JWT/session váltja.
 */
function requireUser(req, res, next) {
  const userId = Number(req.header("x-user-id"));
  if (!userId || Number.isNaN(userId)) {
    return res.status(401).json({
      error: "Unauthorized. Provide x-user-id header (temporary auth).",
    });
  }
  req.userId = userId;
  next();
}

// GET /api/notes  -> saját jegyzetek listázása
router.get("/", requireAuth, (req, res) => {
  db.all(
    `SELECT id, title, content, created_at, updated_at
     FROM notes
     WHERE user_id = ?
     ORDER BY datetime(updated_at) DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST /api/notes -> jegyzet létrehozása
router.post("/", requireAuth, (req, res) => {
  const title = (req.body.title ?? "").trim();
  const content = (req.body.content ?? "").trim();

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  db.run(
    `INSERT INTO notes (user_id, title, content)
     VALUES (?, ?, ?)`,
    [req.userId, title, content],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(
        `SELECT id, title, content, created_at, updated_at
         FROM notes
         WHERE id = ? AND user_id = ?`,
        [this.lastID, req.userId],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

// PUT /api/notes/:id -> jegyzet szerkesztése (csak saját)
router.put("/:id", requireAuth, (req, res) => {
  const noteId = Number(req.params.id);
  const title = (req.body.title ?? "").trim();
  const content = (req.body.content ?? "").trim();

  if (!noteId || Number.isNaN(noteId)) {
    return res.status(400).json({ error: "Invalid note id." });
  }
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  db.run(
    `UPDATE notes
     SET title = ?, content = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    [title, content, noteId, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found (or not owned by user)." });
      }

      db.get(
        `SELECT id, title, content, created_at, updated_at
         FROM notes
         WHERE id = ? AND user_id = ?`,
        [noteId, req.userId],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json(row);
        }
      );
    }
  );
});

// DELETE /api/notes/:id -> jegyzet törlése (csak saját)
router.delete("/:id", requireAuth, (req, res) => {
  const noteId = Number(req.params.id);

  if (!noteId || Number.isNaN(noteId)) {
    return res.status(400).json({ error: "Invalid note id." });
  }

  db.run(
    `DELETE FROM notes
     WHERE id = ? AND user_id = ?`,
    [noteId, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ error: "Note not found (or not owned by user)." });
      }

      res.status(204).send();
    }
  );
});

module.exports = router;
