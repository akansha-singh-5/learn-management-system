const Enrollment = require("../model/enrollment.model");
const Course = require("../model/course.model");

// POST /api/enrollments/course/:courseId  (Student)
exports.enrollInCourse = async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.isPublished) {
        return res.status(404).json({ message: "Course not found" });
    }

    try {
        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: course._id,
        });
        return res.status(201).json({ message: "Enrolled successfully", enrollment });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "You are already enrolled in this course" });
        }
        throw err;
    }
};

// GET /api/enrollments/mine  (Student): own enrollments only
exports.myEnrollments = async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user.id })
        .populate("course", "title description instructor")
        .sort({ createdAt: -1 });

    return res.status(200).json({ count: enrollments.length, enrollments });
};
