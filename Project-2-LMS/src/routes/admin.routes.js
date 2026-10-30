const express = require("express");
const { protect, authorize } = require("../middleware/auth.middleware");
const {
    getAllUsers,
    setUserBlocked,
    setInstructorApproval,
    getAllCourses,
    setCoursePublished,
} = require("../controller/admin.controller");

const router = express.Router();

// Every admin route requires a logged-in Admin
router.use(protect, authorize("Admin"));

router.get("/users", getAllUsers);
router.patch("/users/:id/block", setUserBlocked);
router.patch("/instructors/:id/approve", setInstructorApproval);
router.get("/courses", getAllCourses);
router.patch("/courses/:id/publish", setCoursePublished);

module.exports = router;
