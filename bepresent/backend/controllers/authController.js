const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required. Come on." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already in use." });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials. Who are you?" });

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user.toPublic());
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
