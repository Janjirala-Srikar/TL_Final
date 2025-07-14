import mongoose from "mongoose";
const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    topicTitle: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    realLifeApplication: {
      type: String,
    },
    exerciseAnswers: {
      type: String,
    },
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
