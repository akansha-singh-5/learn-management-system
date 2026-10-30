const Lesson = require("../model/lesson.model");
const Course = require("../model/course.model");
const { isCourseOwner, isEnrolled } = require("../utils/access");

// POST /api/lessons/course/:courseId  (approved Instructor, own course)
exports.createLesson = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (!isCourseOwner(course, req.user.id)) {
        return res.status(403).json({ message: "You can only add lessons to your own courses" });
    }

    const { title, content, order, assignment } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Lesson title is required" });
    }

    const lesson = await Lesson.create({
        course: course._id,
        title,
        content,
        order,
        // Assignment is optional; only saved if a title is given
        assignment: assignment && assignment.title ? assignment : undefined,
    });

    return res.status(201).json({ message: "Lesson created", lesson });
};

// GET /api/lessons/course/:courseId
// Admin and owner instructor: allowed. Student: only if enrolled.
exports.getCourseLessons = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role === "Student") {
        const enrolled = await isEnrolled(req.user.id, course._id);
        if (!enrolled) {
            return res.status(403).json({ message: "Only enrolled students can access lessons of this course" });
        }
    } else if (req.user.role === "Instructor") {
        if (!isCourseOwner(course, req.user.id)) {
            return res.status(403).json({ message: "You can only view lessons of your own courses" });
        }
    }
    // Admin passes through

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
    return res.status(200).json({ count: lessons.length, lessons });
};

// PUT /api/lessons/:id  (approved Instructor, own course)
exports.updateLesson = async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findById(lesson.course);
    if (!course || !isCourseOwner(course, req.user.id)) {
        return res.status(403).json({ message: "You can only edit lessons of your own courses" });
    }

    const { title, content, order, assignment } = req.body;
    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (order !== undefined) lesson.order = order;
    if (assignment !== undefined) {
        lesson.assignment = assignment && assignment.title ? assignment : undefined;
    }
    await lesson.save();

    return res.status(200).json({ message: "Lesson updated", lesson });
};
