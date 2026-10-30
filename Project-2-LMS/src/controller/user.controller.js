const User = require("../model/user.model");

// GET /api/users/profile  (any logged-in user)
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    return res.status(200).json({
        message: "Welcome to your profile",
        user,
    });
};
