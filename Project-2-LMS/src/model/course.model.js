const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Course description is required"],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        // Admin can unpublish a course; students can only see/enroll in published courses
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const courseModel = mongoose.model("course", courseSchema);

module.exports = courseModel;
