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
      // pavan I changed this from title to topicTitle for more understanding
      type: String,
      required: true,
    },
    theory: { type: String },
    starterCode: { type: String },
    testCases: [{ type: String }],
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
