"use strict";

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET
router.get("/", async (req, res, next) => {
    let conn;
    try {
        conn = await db.pool.getConnection(); // Verbindung holen
        const result = await conn.query("SELECT * FROM tasks");
        res.json(result);
    } catch (err) {
        next(err); // Fehler an Express weiterleiten
    } finally {
        if (conn) conn.release(); // Verbindung freigeben
    }
});

// POST
router.post("/", async (req, res, next) => {
    let conn;
    try {
        const { description } = req.body;
        conn = await db.pool.getConnection();
        const result = await conn.query("INSERT INTO tasks (description) VALUES (?)", [description]);
        res.json({ id: result.insertId, description });
    } catch (err) {
        next(err);
    } finally {
        if (conn) conn.release();
    }
});

// PUT
router.put("/", async (req, res, next) => {
    let conn;
    try {
        const { id, description, completed } = req.body;
        conn = await db.pool.getConnection();
        const result = await conn.query("UPDATE tasks SET description = ?, completed = ? WHERE id = ?", 
            [description, completed, id]);
        res.json({ message: "Updated successfully", affectedRows: result.affectedRows });
    } catch (err) {
        next(err);
    } finally {
        if (conn) conn.release();
    }
});

// DELETE
router.delete("/", async (req, res, next) => {
    let conn;
    try {
        const { id } = req.query;
        conn = await db.pool.getConnection();
        const result = await conn.query("DELETE FROM tasks WHERE id = ?", [id]);
        res.json({ message: "Deleted successfully", affectedRows: result.affectedRows });
    } catch (err) {
        next(err);
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
