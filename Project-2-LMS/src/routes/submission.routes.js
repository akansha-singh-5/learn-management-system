const express = require("express");
const { protect, authorize, approvedInstructor } = require("../middleware/auth.middleware");
const {
    submitAssignment,
    mySubmissions,
    lessonSubmissions,
    gradeSubmission,
} = require("../controller/submission.controller");

const router = express.Router();

router.get("/mine", protect, authorize("Student"), mySubmissions);
router.post("/lesson/:lessonId", protect, authorize("Student"), submitAssignment);
router.get("/lesson/:lessonId", protect, authorize("Instructor", "Admin"), lessonSubmissions);
router.patch("/:id/grade", protect, authorize("Instructor"), approvedInstructor, gradeSubmission);

module.exports = router;
