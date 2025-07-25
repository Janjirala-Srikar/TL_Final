import mongoose from "mongoose";

const topicSchema = mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    //Removed the quizId and exerciseId fields because we are not referencing them in the Topic model anymore
    cloudinaryUrl: {
      //to store notes and retrieve them later
      type: String,
      required: true,
    },
    slug: {
      type: String, // to create a unique frontend friendly url for each topic
      required: true,
      unique: true,
    },
    index: {
      type: Number,
      required: true, //to specify the order of topics in a course
    },
  },
  { timestamps: true }
);
