const User = require("../model/user.model");
const Course = require("../model/course.model");

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
};

// PATCH /api/admin/users/:id/block   body: { isBlocked: true|false }
exports.setUserBlocked = async (req, res) => {
    const { isBlocked = true } = req.body;

    const target = await User.findById(req.params.id);
    if (!target) {
        return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "Admin") {
        return res.status(400).json({ message: "Admin accounts cannot be blocked" });
    }

    target.isBlocked = Boolean(isBlocked);
    await target.save();

    return res.status(200).json({
        message: target.isBlocked ? "User blocked" : "User unblocked",
        user: { id: target._id, name: target.name, role: target.role, isBlocked: target.isBlocked },
    });
};

// PATCH /api/admin/instructors/:id/approve   body: { isApproved: true|false }
exports.setInstructorApproval = async (req, res) => {
    const { isApproved = true } = req.body;

    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== "Instructor") {
        return res.status(404).json({ message: "Instructor not found" });
    }

    instructor.isApproved = Boolean(isApproved);
    await instructor.save();

    return res.status(200).json({
        message: instructor.isApproved ? "Instructor approved" : "Instructor approval removed",
        user: { id: instructor._id, name: instructor.name, isApproved: instructor.isApproved },
    });
};

// GET /api/admin/courses
exports.getAllCourses = async (req, res) => {
    const courses = await Course.find()
        .populate("instructor", "name email")
        .sort({ createdAt: -1 });
    return res.status(200).json({ count: courses.length, courses });
};

// PATCH /api/admin/courses/:id/publish   body: { isPublished: true|false }
exports.setCoursePublished = async (req, res) => {
    const { isPublished = true } = req.body;

    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { isPublished: Boolean(isPublished) },
        { new: true }
    );
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
        message: course.isPublished ? "Course published" : "Course unpublished",
        course,
    });
};
