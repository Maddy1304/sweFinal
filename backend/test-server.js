require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Backend is working!" });
});

// Auth routes
app.post("/api/v1/auth/register", (req, res) => {
    console.log("Register request received:", req.body);
    // Send back a proper response that matches what the frontend expects
    res.json({ 
        msg: "User Register Successfully",
        token: "test-token-123",
        data: req.body 
    });
});

app.post("/api/v1/auth/login", (req, res) => {
    res.json({ message: "Login endpoint reached", body: req.body });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});