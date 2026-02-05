import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;

  // 1️⃣ Check header format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ Token missing
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user
    req.user = { userId: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default protect;