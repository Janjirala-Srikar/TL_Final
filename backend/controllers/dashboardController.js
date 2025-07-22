import UserProgress from "../models/UserProgress.js";
import Exercise from "../models/Exercise.js";
import Quiz from "../models/Quiz.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await UserProgress.findOne({ userId }).populate(
      "completedExercises.exerciseId",
      "topicTitle"
    );

    if (!progress) {
      // Calculate totals even when no progress exists
      const totalExercises = await Exercise.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();

      // Calculate total possible XP for exercises (10 XP per exercise)
      const totalPossibleExerciseXP = totalExercises * 10;

      let totalQuizQuestions = 0;
      const allQuizzes = await Quiz.find();
      for (const quiz of allQuizzes) {
        totalQuizQuestions += quiz.questions.length;
      }

      return res.status(200).json({
        courseXP: {},
        exerciseXP: {},
        totalCourseXP: 0,
        totalExerciseXP: totalPossibleExerciseXP,
        completedExercises: [],
        calendarActivity: {},
        answeredQuestions: {},
        courseProgress: { progressPercent: 0 },
        exerciseProgress: {
          totalExercises,
          completedExercises: 0,
          progressPercent: 0,
        },
        quizProgress: {
          totalQuizzes,
          completedQuizzes: 0,
          totalQuizQuestions,
          answeredQuizQuestions: 0,
          progressPercent: 0,
        },
      });
    }

    // CALCULATE progress from actual data (no schema changes needed)
    const totalExercises = await Exercise.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();

    // Calculate total possible XP for exercises (15 XP per exercise)
    const totalPossibleExerciseXP = totalExercises * 10;

    const completedExercisesCount = progress.completedExercises.length;
    const completedQuizzesCount = progress.completedQuizzes.length;

    // Calculate quiz progress based on answered questions, not completed quizzes
    let totalQuizQuestions = 0;
    let answeredQuizQuestions = 0;

    // Get all quizzes to count total questions
    const allQuizzes = await Quiz.find();
    for (const quiz of allQuizzes) {
      totalQuizQuestions += quiz.questions.length;
    }

    // Count answered questions from progress.answeredQuestions
    if (progress.answeredQuestions) {
      for (const [quizId, questionIds] of progress.answeredQuestions) {
        answeredQuizQuestions += questionIds.length;
      }
    }

    const exercisePercent =
      totalExercises > 0
        ? Math.round((completedExercisesCount / totalExercises) * 1000) / 10
        : 0;
    const quizPercent =
      totalQuizQuestions > 0
        ? Math.round((answeredQuizQuestions / totalQuizQuestions) * 1000) / 10
        : 0;
    const courseProgressPercent =
      Math.round(((exercisePercent + quizPercent) / 2) * 10) / 10;

    // Create calendar activity
    const calendarActivity = {};
    if (progress.createdAt) {
      const dateKey = progress.createdAt.toISOString().split("T")[0];
      calendarActivity[dateKey] = "active"; // Use string instead of boolean
    }

    res.status(200).json({
      courseXP: progress.courseXP,
      exerciseXP: progress.exerciseXP,
      totalCourseXP: progress.totalCourseXP,
      totalExerciseXP: totalPossibleExerciseXP, // Use calculated value instead of stored value
      completedExercises: progress.completedExercises,
      calendarActivity,
      answeredQuestions: progress.answeredQuestions,
      totalCourseProgress: { progressPercent: courseProgressPercent },
      quizProgress: {
        totalQuizzes,
        completedQuizzes: completedQuizzesCount,
        totalQuizQuestions,
        answeredQuizQuestions,
        progressPercent: quizPercent,
      },
      exerciseProgress: {
        totalExercises,
        completedExercises: completedExercisesCount,
        progressPercent: exercisePercent,
      },
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
