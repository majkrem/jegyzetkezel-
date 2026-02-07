const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const auth = req.header("authorization") || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
