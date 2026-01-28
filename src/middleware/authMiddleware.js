import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = { userId: decoded.id };
  next();
};

export default protect;
