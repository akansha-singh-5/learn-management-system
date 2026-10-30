const express = require("express");
const { protect, authorize } = require("../middleware/auth.middleware");
const { enrollInCourse, myEnrollments } = require("../controller/enrollment.controller");

const router = express.Router();

router.get("/mine", protect, authorize("Student"), myEnrollments);
router.post("/course/:courseId", protect, authorize("Student"), enrollInCourse);

module.exports = router;
