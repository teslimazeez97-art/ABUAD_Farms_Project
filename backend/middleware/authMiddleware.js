// authMiddleware.js
const jwt = require("jsonwebtoken");


//  authMiddleware.js (temporary for debugging)

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    console.warn("[AUTH] No token provided for", req.method, req.originalUrl);
    return res.status(401).json({ error: "No token provided" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("[AUTH] JWT_SECRET not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Debug: light payload fields only (no logging full token)
    console.log(`[AUTH] token verified for email=${decoded.email || 'N/A'} role=${decoded.role || 'N/A'}`);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("[AUTH] verify error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// General auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    console.warn("[AUTH] No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("[AUTH] JWT_SECRET not set in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("[AUTH] JWT verify error:", err && err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Admin-only middleware
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };