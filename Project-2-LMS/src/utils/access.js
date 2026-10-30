const Enrollment = require("../model/enrollment.model");

// Does this instructor own the course?
const isCourseOwner = (course, userId) => course.instructor.toString() === userId;

// Is this student enrolled in the course?
const isEnrolled = async (studentId, courseId) => {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    return Boolean(enrollment);
};

module.exports = { isCourseOwner, isEnrolled };
