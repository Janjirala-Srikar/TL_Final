import UserProgress from "../models/UserProgress.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import Exercise from "../models/Exercise.js";
import mongoose from "mongoose";

// Check if a question has already been answered
export const checkIfQuestionAnswered = async ({
  userId,
  quizId,
  questionId,
}) => {
  let userProgress = await UserProgress.findOne({ userId });
  if (!userProgress) return { answered: false };

  // Check if this specific question has already been answered
  const answered = userProgress.answeredQuestions.get(quizId.toString()) || [];
  if (answered.map((id) => id.toString()).includes(questionId.toString())) {
    return { error: "You have already answered this question." };
  }

  return { answered: false };
};

// Update progress and XP for any answer attempt
export const recordQuizAttempt = async ({
  userId,
  quizId,
  courseId,
  questionId,
  xp,
}) => {
  let userProgress = await UserProgress.findOne({ userId });
  if (!userProgress) {
    userProgress = new UserProgress({
      userId,
      completedQuizzes: [],
      courseXP: new Map(),
      totalCourseXP: 0,
      answeredQuestions: new Map(),
      exerciseXP: new Map(),
      totalExerciseXP: 0,
      completedExercises: [],
    });
  }

  const quizIdStr = quizId.toString();
  const courseIdStr = courseId.toString();

  // Add this questionId to answeredQuestions for this quiz
  const answered = userProgress.answeredQuestions.get(quizIdStr) || [];
  answered.push(questionId);
  userProgress.answeredQuestions.set(quizIdStr, answered);

  // Add XP for this question (earned XP, not total possible)
  const currentCourseXP = userProgress.courseXP.get(courseIdStr) || 0;
  userProgress.courseXP.set(courseIdStr, currentCourseXP + xp);

  // Calculate total possible XP for all quizzes in this course
  const course = await Course.findById(courseId);
  if (course) {
    let totalPossibleQuizXP = 0;
    for (const topic of course.topics) {
      if (topic.quizId) {
        const quiz = await Quiz.findById(topic.quizId);
        if (quiz) {
          totalPossibleQuizXP += quiz.questions.length * 10; // 10 XP per question
        }
      }
    }
    userProgress.totalCourseXP = totalPossibleQuizXP;
  }

  await userProgress.save();

  // Check if quiz is complete
  const quiz = await Quiz.findById(quizId);
  const isQuizComplete = quiz && answered.length === quiz.questions.length;

  // FIX: Mark quiz as completed using correct schema structure
  if (
    isQuizComplete &&
    !userProgress.completedQuizzes.some(
      (item) => item.quizId && item.quizId.toString() === quizIdStr
    )
  ) {
    console.log("Marking quiz as completed");
    userProgress.completedQuizzes.push({
      quizId: new mongoose.Types.ObjectId(quizId),
      completedAt: new Date(),
    });
    await userProgress.save();
  }

  return {
    success: true,
    quizComplete: isQuizComplete,
    totalAnswered: answered.length,
    totalQuestions: quiz ? quiz.questions.length : 0,
  };
};

// Get Current Authenticated User's Progress
export const getUserProgress = async (req, res) => {
  const userId = req.user._id;

  try {
    //  Include answeredQuestions and completedExercises in the select
    const userProgress = await UserProgress.findOne({ userId }).select(
      "courseXP exerciseXP totalCourseXP totalExerciseXP completedQuizzes answeredQuestions completedExercises"
    );

    if (!userProgress) {
      // Calculate total possible XP even when no progress exists
      const totalExercises = await Exercise.countDocuments();
      const totalPossibleExerciseXP = totalExercises * 10;

      return res.status(200).json({
        courseXP: {},
        exerciseXP: {},
        totalCourseXP: 0,
        totalExerciseXP: totalPossibleExerciseXP,
        completedQuizzes: [],
        answeredQuestions: {},
        completedExercises: [],
      });
    }

    // Calculate total possible exercise XP on-the-fly
    const totalExercises = await Exercise.countDocuments();
    const totalPossibleExerciseXP = totalExercises * 10;

    // Convert Maps to plain objects for JSON response
    const courseXPObject = {};
    const exerciseXPObject = {};

    for (const [courseId, xp] of userProgress.courseXP) {
      courseXPObject[courseId] = xp;
    }

    for (const [courseId, xp] of userProgress.exerciseXP) {
      exerciseXPObject[courseId] = xp;
    }

    //  Convert answeredQuestions Map to plain object
    const answeredQuestionsObject = {};
    if (userProgress.answeredQuestions) {
      for (const [quizId, questionIds] of userProgress.answeredQuestions) {
        answeredQuestionsObject[quizId] = questionIds.map((id) =>
          id.toString()
        );
      }
    }

    return res.status(200).json({
      _id: userProgress._id,
      courseXP: courseXPObject,
      exerciseXP: exerciseXPObject,
      totalCourseXP: userProgress.totalCourseXP, // Total possible XP from all quizzes
      totalExerciseXP: totalPossibleExerciseXP, // Use calculated value instead of stored value
      completedQuizzes: userProgress.completedQuizzes || [],
      answeredQuestions: answeredQuestionsObject, //  Include this
      completedExercises: userProgress.completedExercises || [], //  Include this
    });
  } catch (err) {
    console.error("User Progress Fetch Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch user progress" });
  }
};

// FIX: Update recordExerciseAttempt to use correct schema structure
export const recordExerciseAttempt = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, exerciseId, questionId, xp } = req.body;

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        exerciseXP: new Map(),
        totalExerciseXP: 0,
        completedExercises: [],
        courseXP: new Map(),
        totalCourseXP: 0,
        completedQuizzes: [],
        answeredQuestions: new Map(),
      });
    }

    const courseIdStr = courseId.toString();

    // Add XP for this exercise (earned XP, not total possible)
    const currentXP = userProgress.exerciseXP.get(courseIdStr) || 0;
    userProgress.exerciseXP.set(courseIdStr, currentXP + xp);

    // Calculate total possible XP for all exercises in this course
    const course = await Course.findById(courseId);
    if (course) {
      let totalPossibleExerciseXP = 0;
      for (const topic of course.topics) {
        if (topic.exerciseId) {
          // Each exercise gives 15 XP when completed
          totalPossibleExerciseXP += 10;
        }
      }
      userProgress.totalExerciseXP = totalPossibleExerciseXP;
    }

    // FIX: Use correct schema structure for exercise completion
    if (
      !userProgress.completedExercises.some(
        (item) => item.exerciseId && item.exerciseId.toString() === exerciseId
      )
    ) {
      userProgress.completedExercises.push({
        exerciseId: new mongoose.Types.ObjectId(exerciseId),
        completedAt: new Date(),
      });
    }

    await userProgress.save();

    return res
      .status(200)
      .json({ success: true, totalExerciseXP: userProgress.totalExerciseXP });
  } catch (error) {
    console.error("Error in recordExerciseAttempt:", error);
    return res
      .status(500)
      .json({ message: "Failed to record exercise attempt" });
  }
};
