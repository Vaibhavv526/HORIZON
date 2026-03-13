const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   POST /api/users/register
// @desc    Register a new user
router.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user exists
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            if (row) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // In a real app, hash the password before saving!
            const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            stmt.run([username, email, password], function(insertErr) {
                if (insertErr) {
                    return res.status(500).json({ message: 'Server Error during registration', error: insertErr.message });
                }
                
                res.status(201).json({
                    id: this.lastID,
                    username,
                    email,
                    message: 'User registered successfully!'
                });
            });
            stmt.finalize();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Fetch user string matching email
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            // Check if user exists & password matches
            if (user && user.password === password) {
                // In production, compare hashed passwords & return JWT
                res.status(200).json({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    message: 'Login successful'
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
});

module.exports = router;
