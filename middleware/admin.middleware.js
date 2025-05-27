import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);

    console.log("process.env.jwt_SECRET_KEY", process.env.jwt_SECRET_KEY);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token exists");
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];
    console.log("✅ Token exists:", token);

    // Correctly verify the entire token using your secret
    const decoded = jwt.verify(token, process.env.jwt_SECRET_KEY);
    console.log("📦 Verified & Decoded Payload:", decoded);
    // Check if role is admin
    if (decoded.role !== "admin") {
      console.log("❌ Access denied: not an admin");
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Attach userId if available
    if (decoded.id) {
      req.userId = decoded.id;
    }

    next(); // User is verified and is an admin
  } catch (error) {
    console.error("❌ Error verifying token:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
