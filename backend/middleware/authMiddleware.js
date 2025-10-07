import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}