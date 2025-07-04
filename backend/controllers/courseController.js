import mongoose from "mongoose";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import {
  checkIfQuestionAnswered,
  recordQuizAttempt,
} from "./userProgressController.js";
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ count: courses.length, courses });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch courses", error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  const { courseId } = req.params;
  console.log(courseId);
  try {
    const course = await Course.findById(courseId)
    //   .populate("topics.quizId")
    //   .populate("topics.notesId");
    // if (!course) {
    //   return res.status(404).json({ message: "Course not found" });
    // }
    // // map topics to alias _id as topicId because It was confusing
    // const topics = course.topics.map((topic) => ({
    //   topicId: topic._id,
    //   title: topic.title,
    //   quizId: topic.quizId ? topic.quizId._id : null, // Ensure quizId is populated
    //   notesId: topic.notesId ? topic.notesId._id || topic.notesId : null, // Ensure notesId is included
    //   notes:
    //     topic.notesId && topic.notesId.content ? topic.notesId.content : null,
    // }));
    res.status(200).json({
      course
    });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching course details", error: error.message });
  }
};

export const getQuizByCourseId = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res.status(400).json({ message: "Invalid Course Id" });
    if (!mongoose.Types.ObjectId.isValid(topicId))
      return res.status(400).json({ message: "Invalid Topic Id" });

    const quiz = await Quiz.findOne({ courseId, topicId });

    if (!quiz)
      return res.status(404).json({ message: "Quiz not found for this topic" });

    return res.status(200).json({
      topic: quiz.topicTitle,
      questions: quiz.questions.map(({ question, options, _id }) => ({
        question,
        options,
        _id, // I didn't want to send this but I think It can be used for verifying the correct answer using this Id
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Fetching quiz", error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { quizId, questionId, selectedOption } = req.body;

    // Input validation
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course Id" });
    }
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz Id" });
    }
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid Question Id" });
    }

    // Validate selectedOption
    if (selectedOption === undefined || selectedOption === null) {
      return res.status(400).json({ message: "Selected option is required" });
    }

    const selectedOptionNum = Number(selectedOption);
    if (isNaN(selectedOptionNum) || selectedOptionNum < 0) {
      return res
        .status(400)
        .json({ message: "Selected option must be a valid number" });
    }

    // Ensure the quiz belongs to the course
    const quiz = await Quiz.findOne({ _id: quizId, courseId });
    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found for this course" });
    }

    // Check if user already attempted the quiz or this question (no mutation)
    const checkResult = await checkIfQuestionAnswered({
      userId: req.user._id,
      quizId,
      questionId,
    });
    if (checkResult.error) {
      return res.status(400).json({ message: checkResult.error });
    }

    const question = quiz.questions.find(
      (q) => q._id.toString() === questionId
    );
    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found in this quiz" });
    }

    // Validate selectedOption is within valid range
    if (selectedOptionNum >= question.options.length) {
      return res
        .status(400)
        .json({ message: "Selected option is out of range" });
    }

    const isCorrect = selectedOptionNum === question.correctAnswer;
    let xp = isCorrect ? 10 : 0; // 10 XP for correct answer, 0 for incorrect

    // Always record the attempt (correct or incorrect)
    const result = await recordQuizAttempt({
      userId: req.user._id,
      quizId,
      courseId,
      questionId,
      xp,
    });

    res.status(200).json({
      questionId: question._id,
      selectedOption: selectedOptionNum,
      correctOption: question.correctAnswer,
      explanation: question.explanation || "No explanation available",
      correct: isCorrect,
      receivedXP: xp,
      quizComplete: result.quizComplete,
      progress: {
        answered: result.totalAnswered,
        total: result.totalQuestions,
        remaining: result.totalQuestions - result.totalAnswered,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while submitting the quiz answer",
      error: error.message,
    });
  }
};
