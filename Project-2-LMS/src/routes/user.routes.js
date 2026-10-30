const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getProfile } = require("../controller/user.controller");

const router = express.Router();

router.get("/profile", protect, getProfile);

module.exports = router;
