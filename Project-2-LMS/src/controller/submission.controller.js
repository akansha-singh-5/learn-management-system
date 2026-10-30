const Submission = require("../model/submission.model");
const Lesson = require("../model/lesson.model");
const Course = require("../model/course.model");
const { isCourseOwner, isEnrolled } = require("../utils/access");

// POST /api/submissions/lesson/:lessonId  (Student, enrolled only)
exports.submitAssignment = async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: "Submission content is required" });
    }

    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson || !lesson.assignment) {
        return res.status(404).json({ message: "No assignment found for this lesson" });
    }

    if (!(await isEnrolled(req.user.id, lesson.course))) {
        return res.status(403).json({ message: "Only enrolled students can submit assignments" });
    }

    const due = lesson.assignment.dueDate;
    if (due && new Date() > due) {
        return res.status(400).json({ message: "Deadline has passed" });
    }

    try {
        const submission = await Submission.create({
            lesson: lesson._id,
            student: req.user.id,
            content,
        });
        return res.status(201).json({ message: "Assignment submitted", submission });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "You have already submitted this assignment" });
        }
        throw err;
    }
};

// GET /api/submissions/mine  (Student): own submissions and grades only
exports.mySubmissions = async (req, res) => {
    const submissions = await Submission.find({ student: req.user.id })
        .populate("lesson", "title assignment.title assignment.maxMarks")
        .sort({ createdAt: -1 });

    return res.status(200).json({ count: submissions.length, submissions });
};

// GET /api/submissions/lesson/:lessonId  (Instructor own course, or Admin)
exports.lessonSubmissions = async (req, res) => {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
    }

    if (req.user.role === "Instructor") {
        const course = await Course.findById(lesson.course);
        if (!course || !isCourseOwner(course, req.user.id)) {
            return res.status(403).json({ message: "You can only view submissions of your own courses" });
        }
    }

    const submissions = await Submission.find({ lesson: lesson._id })
        .populate("student", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json({ count: submissions.length, submissions });
};

// PATCH /api/submissions/:id/grade  (approved Instructor, own course only)
exports.gradeSubmission = async (req, res) => {
    const { grade, feedback } = req.body;

    const submission = await Submission.findById(req.params.id).populate("lesson");
    if (!submission || !submission.lesson) {
        return res.status(404).json({ message: "Submission not found" });
    }

    const course = await Course.findById(submission.lesson.course);
    if (!course || !isCourseOwner(course, req.user.id)) {
        return res.status(403).json({ message: "You can only grade submissions of your own courses" });
    }

    const maxMarks = submission.lesson.assignment.maxMarks;
    if (typeof grade !== "number" || grade < 0 || grade > maxMarks) {
        return res.status(400).json({ message: `Grade must be a number between 0 and ${maxMarks}` });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = "Graded";
    await submission.save();

    return res.status(200).json({ message: "Submission graded", submission });
};
