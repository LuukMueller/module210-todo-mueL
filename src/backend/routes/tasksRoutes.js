"use strict";

let express = require("express"),
    router = express.Router(),
    db = require('../db');

// GET
router.get("/", async (req, res, next) => {
    let conn;
    try {
        const result = await db.pool.query("SELECT * FROM tasks");
        res.json(result);  // Verwendet json statt send für bessere Strukturierung
    } catch (err) {
        next(err);  // Fehler weiterleiten an den Error Handler
    } finally {
        if (conn) conn.release();
    }
});

// POST
router.post("/", async (req, res, next) => {
    const task = req.body;

    // Validierung der übergebenen Daten
    if (!task.description) {
        return res.status(422).json({ error: "Description is required" });
    }

    let conn;
    try {
        conn = await db.pool.getConnection();
        const result = await conn.query("INSERT INTO tasks (description) VALUES (?)", [task.description]);
        res.json({ id: result.insertId, description: task.description });
    } catch (err) {
        next(err);  // Fehler weiterleiten an den Error Handler
    } finally {
        if (conn) conn.release();
    }
});

// PUT
router.put("/", async (req, res, next) => {
    const task = req.body;

    // Validierung der übergebenen Daten
    if (!task.id || !task.description || task.completed === undefined) {
        return res.status(422).json({ error: "ID, description, and completed status are required" });
    }

    let conn;
    try {
        conn = await db.pool.getConnection();
        const result = await conn.query("UPDATE tasks SET description = ?, completed = ? WHERE id = ?", 
            [task.description, task.completed, task.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Updated successfully", affectedRows: result.affectedRows });
    } catch (err) {
        next(err);  // Fehler weiterleiten an den Error Handler
    } finally {
        if (conn) conn.release();
    }
});

// DELETE
router.delete("/", async (req, res, next) => {
    const id = req.query.id;

    // Überprüfen, ob eine ID angegeben wurde
    if (!id) {
        return res.status(422).json({ error: "ID is required" });
    }

    let conn;
    try {
        conn = await db.pool.getConnection();
        const result = await conn.query("DELETE FROM tasks WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Deleted successfully", affectedRows: result.affectedRows });
    } catch (err) {
        next(err);  // Fehler weiterleiten an den Error Handler
    } finally {
        if (conn) conn.release();
    }
});

// Fehlerbehandlung
router.use((err, req, res, next) => {
    console.error(err.stack);  // Fehler in der Konsole loggen
    res.status(500).json({ error: 'Internal Server Error', message: err.message });  // Fehler an den Client zurückgeben
});

module.exports = router;
