const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "lesson",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Submission content is required"],
        },
        status: {
            type: String,
            enum: ["Submitted", "Graded"],
            default: "Submitted",
        },
        grade: {
            type: Number,
            default: null,
        },
        feedback: String,
    },
    { timestamps: true }
);

// A student can submit an assignment only once
submissionSchema.index({ lesson: 1, student: 1 }, { unique: true });

const submissionModel = mongoose.model("submission", submissionSchema);

module.exports = submissionModel;
