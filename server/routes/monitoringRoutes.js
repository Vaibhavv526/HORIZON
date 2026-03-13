const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/data
// @desc    Fetch all monitoring data
router.get('/', (req, res) => {
    db.all("SELECT * FROM monitoring_data ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Server Error fetching data', error: err.message });
        }
        res.status(200).json(rows);
    });
});

// @route   POST /api/data
// @desc    Add new monitoring data
router.post('/', (req, res) => {
    try {
        const { location, pollutantType, value } = req.body;

        if (!location || !pollutantType || !value) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const stmt = db.prepare("INSERT INTO monitoring_data (location, pollutantType, value) VALUES (?, ?, ?)");
        stmt.run([location, pollutantType, value], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Server Error adding data', error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                location,
                pollutantType,
                value,
                timestamp: new Date()
            });
        });
        stmt.finalize();
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
