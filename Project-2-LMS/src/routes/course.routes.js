const express = require("express");
const { protect, authorize, approvedInstructor } = require("../middleware/auth.middleware");
const {
    createCourse,
    listPublishedCourses,
    myCourses,
    getCourse,
    updateCourse,
} = require("../controller/course.controller");

const router = express.Router();

router.get("/", protect, listPublishedCourses);
router.get("/mine", protect, authorize("Instructor"), myCourses); // must be before "/:id"
router.post("/", protect, authorize("Instructor"), approvedInstructor, createCourse);
router.get("/:id", protect, getCourse);
router.put("/:id", protect, authorize("Instructor"), approvedInstructor, updateCourse);

module.exports = router;
