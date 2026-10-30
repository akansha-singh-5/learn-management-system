const mongoose = require("mongoose");

// Assignment is embedded in the lesson (no separate model needed)
const assignmentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: String,
        maxMarks: { type: Number, default: 100, min: 1 },
        dueDate: Date,
    },
    { _id: false }
);

const lessonSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Lesson title is required"],
            trim: true,
        },
        content: String,
        order: {
            type: Number,
            default: 0,
        },
        assignment: {
            type: assignmentSchema,
            default: undefined,
        },
    },
    { timestamps: true }
);

const lessonModel = mongoose.model("lesson", lessonSchema);

module.exports = lessonModel;
