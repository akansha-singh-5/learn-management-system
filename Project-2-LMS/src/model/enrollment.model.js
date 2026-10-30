const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true,
        },
    },
    { timestamps: true }
);

// A student can enroll in the same course only once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const enrollmentModel = mongoose.model("enrollment", enrollmentSchema);

module.exports = enrollmentModel;
