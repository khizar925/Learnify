const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authUser(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const response = jwt.verify(token, JWT_SECRET);
    req.userId = response.id; // Correctly retrieve userId from the response
    next();
  } catch (error) {
    res.status(403).json({
      message: "Invalid token",
      error: error.message, // Optional: include the error message for debugging
    });
  }
}

module.exports = {
    authUser: authUser
}