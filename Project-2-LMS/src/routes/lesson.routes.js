const express = require("express");
const { protect, authorize, approvedInstructor } = require("../middleware/auth.middleware");
const {
    createLesson,
    getCourseLessons,
    updateLesson,
} = require("../controller/lesson.controller");

const router = express.Router();

// Access rules (student enrolled / owner instructor / admin) are checked in the controller
router.get("/course/:courseId", protect, authorize("Student", "Instructor", "Admin"), getCourseLessons);
router.post("/course/:courseId", protect, authorize("Instructor"), approvedInstructor, createLesson);
router.put("/:id", protect, authorize("Instructor"), approvedInstructor, updateLesson);

module.exports = router;
