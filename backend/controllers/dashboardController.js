import UserProgress from "../models/UserProgress.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    let progress = await UserProgress.findOne({ userId });

    if (!progress) {
      // If no progress, send defaults or empty data
      return res.status(200).json({
        courseProgress: { progressPercent: 0 },
        exerciseProgress: { totalExercises: 0, completedExercises: 0 },
        quizProgress: { totalQuizzes: 0, completedQuizzes: 0 },
        calendarActivity: {},
        recentActivity: {},
        enrolledCourses: [],
        xpPoints: { totalXP: 0 },
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
    const totalXP =
      (exerciseProgress.completedExercises || 0) +
      (quizProgress.completedQuizzes || 0);

    res.status(200).json({
      courseProgress: { progressPercent: courseProgressPercent },
      exerciseProgress,
      quizProgress,
      calendarActivity: progress.calendarActivity || {},
      recentActivity: progress.recentActivity || {},
      enrolledCourses: progress.enrolledCourses || [],
      xpPoints: { totalXP },
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
