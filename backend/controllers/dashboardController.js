// import UserProgress from "../models/UserProgress.js";

// export const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     let progress = await UserProgress.findOne({ userId });

//     if (!progress) {
//       // If no progress, send defaults or empty data
//       return res.status(200).json({
//         courseProgress: {},
//         exerciseProgress: { totalExercises: 0, completedExercises: 0 },
//         calendarActivity: {},
//         recentActivity: {},
//         enrolledCourses: [],
//         xpPoints: {
//           xpFromLearn: 0,
//           xpFromBuild: 0,
//           totalXP: 0,
//         },
//       });
//     }

//     res.status(200).json({
//       courseProgress: progress.courseProgress || {},
//       exerciseProgress: progress.exerciseProgress || {
//         totalExercises: 0,
//         completedExercises: 0,
//       },
//       calendarActivity: progress.calendarActivity || {},
//       recentActivity: progress.recentActivity || {},
//       enrolledCourses: progress.enrolledCourses || [],
//       xpPoints: {
//         xpFromLearn: progress.xpFromLearn,
//         xpFromBuild: progress.xpFromBuild,
//         totalXP: progress.xpFromLearn + progress.xpFromBuild,
//       },
//     });
//   } catch (error) {
//     console.error("Dashboard data fetch error:", error);
//     res.status(500).json({ message: "Server error fetching dashboard data" });
//   }
// };

import UserProgress from "../models/UserProgress.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await UserProgress.findOne({ userId })
      .populate("completedExercises", "topicTitle")
      .populate("completedQuizzes", "topicTitle");

    if (!progress) {
      // Send default if progress not found
      return res.status(200).json({
        courseXP: {},
        exerciseXP: {},
        totalCourseXP: 0,
        totalExerciseXP: 0,
        completedExercises: [],
        completedQuizzes: [],
        calendarActivity: {},
        answeredQuestions: {},
        courseProgress: { progressPercent: 0 },
        exerciseProgress: { totalExercises: 0, completedExercises: 0 },
        quizProgress: { totalQuizzes: 0, completedQuizzes: 0 },
      });
    }

    // Calculate percentage-based progress
    const exerciseProgress = progress.exerciseProgress || {
      totalExercises: 0,
      completedExercises: 0,
    };
    const quizProgress = progress.quizProgress || {
      totalQuizzes: 0,
      completedQuizzes: 0,
    };
    const exercisePercent =
      exerciseProgress.totalExercises > 0
        ? (exerciseProgress.completedExercises /
            exerciseProgress.totalExercises) *
          100
        : 0;
    const quizPercent =
      quizProgress.totalQuizzes > 0
        ? (quizProgress.completedQuizzes / quizProgress.totalQuizzes) * 100
        : 0;
    const courseProgressPercent = (exercisePercent + quizPercent) / 2;

    // Create basic calendarActivity using timestamps (optional)
    const calendarActivity = {};
    if (progress.createdAt) {
      const dateKey = progress.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      calendarActivity[dateKey] = true;
    }

    res.status(200).json({
      courseXP: progress.courseXP,
      exerciseXP: progress.exerciseXP,
      totalCourseXP: progress.totalCourseXP,
      totalExerciseXP: progress.totalExerciseXP,
      completedExercises: progress.completedExercises,
      completedQuizzes: progress.completedQuizzes,
      calendarActivity,
      answeredQuestions: progress.answeredQuestions,
      courseProgress: { progressPercent: courseProgressPercent },
      exerciseProgress,
      quizProgress,
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
