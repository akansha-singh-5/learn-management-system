const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const toPublicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
});

// POST /api/auth/register
// Only Student or Instructor can self-register. Admin is created via seed script.
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, Email & Password are required" });
    }

    const userRole = role || "Student";
    if (!["Student", "Instructor"].includes(userRole)) {
        return res.status(400).json({ message: "Role must be Student or Instructor" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
        return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        // Instructors start unapproved; students are approved by default
        isApproved: userRole === "Student",
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: toPublicUser(user),
    });
};

// POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email & Password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by admin" });
    }

    const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    return res.json({
        message: "Logged in successfully",
        token,
        user: toPublicUser(user),
    });
};
