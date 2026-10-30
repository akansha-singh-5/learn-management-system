const Course = require("../model/course.model");
const { isCourseOwner } = require("../utils/access");

// POST /api/courses  (approved Instructor)
exports.createCourse = async (req, res) => {
    const { title, description, isPublished } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Title & Description are required" });
    }

    const course = await Course.create({
        title,
        description,
        instructor: req.user.id,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return res.status(201).json({ message: "Course created", course });
};

// GET /api/courses  (any logged-in user): published courses only
exports.listPublishedCourses = async (req, res) => {
    const courses = await Course.find({ isPublished: true })
        .populate("instructor", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json({ count: courses.length, courses });
};

// GET /api/courses/mine  (Instructor): courses they created
exports.myCourses = async (req, res) => {
    const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ count: courses.length, courses });
};

// GET /api/courses/:id
exports.getCourse = async (req, res) => {
    const course = await Course.findById(req.params.id).populate("instructor", "name");
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    // Unpublished courses are visible only to admin and the owner instructor
    const canSeeUnpublished =
        req.user.role === "Admin" ||
        (req.user.role === "Instructor" && isCourseOwner(course, req.user.id));

    if (!course.isPublished && !canSeeUnpublished) {
        return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ course });
};

// PUT /api/courses/:id  (approved Instructor, only own course)
exports.updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (!isCourseOwner(course, req.user.id)) {
        return res.status(403).json({ message: "You can only edit your own courses" });
    }

    const { title, description } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    await course.save();

    return res.status(200).json({ message: "Course updated", course });
};
