import UserProgress from "../models/UserProgress.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import Exercise from "../models/Exercise.js";

// Check if a question has already been answered (no mutation)
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

// Update progress and XP for any answer attempt (correct or incorrect)
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
      courseXP: {},
      totalCourseXP: 0,
      answeredQuestions: {},
    });
  }

  // Add this questionId to answeredQuestions for this quiz
  const answered = userProgress.answeredQuestions.get(quizId.toString()) || [];
  answered.push(questionId);
  userProgress.answeredQuestions.set(quizId.toString(), answered);

  // Add XP for this question
  userProgress.courseXP.set(
    courseId,
    (userProgress.courseXP.get(courseId) ?? 0) + xp
  );
  userProgress.totalCourseXP += xp;
  await userProgress.save();

  // Check if quiz is now complete (all questions answered)
  const quiz = await Quiz.findById(quizId);
  const isQuizComplete = quiz && answered.length === quiz.questions.length;

  // Mark quiz as completed if all questions are answered
  if (
    isQuizComplete &&
    !userProgress.completedQuizzes
      .map((id) => id.toString())
      .includes(quizId.toString())
  ) {
    userProgress.completedQuizzes.push(quizId);
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
    const userProgress = await UserProgress.findOne({ userId }).select(
      "courseXP exerciseXP totalCourseXP totalExerciseXP completedQuizzes"
    );

    if (!userProgress) {
      return res.status(200).json({
        courseXP: {},
        exerciseXP: {},
        totalCourseXP: 0,
        totalExerciseXP: 0,
      });
    }

    // Recalculate totals to ensure consistency
    let recalculatedTotalCourseXP = 0;
    let recalculatedTotalExerciseXP = 0;

    // Convert Maps to plain objects for JSON response
    const courseXPObject = {};
    const exerciseXPObject = {};

    for (const [courseId, xp] of userProgress.courseXP) {
      courseXPObject[courseId] = xp;
      recalculatedTotalCourseXP += xp;
    }

    for (const [courseId, xp] of userProgress.exerciseXP) {
      exerciseXPObject[courseId] = xp;
      recalculatedTotalExerciseXP += xp;
    }

    return res.status(200).json({
      _id: userProgress._id,
      courseXP: courseXPObject,
      exerciseXP: exerciseXPObject,
      totalCourseXP: recalculatedTotalCourseXP,
      totalExerciseXP: recalculatedTotalExerciseXP,
      completedQuizzes: userProgress.completedQuizzes || [],
    });
  } catch (err) {
    console.error("User Progress Fetch Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch user progress" });
  }
};


// recordExerciseAttempt route

export const recordExerciseAttempt = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId, exerciseId, questionId, xp } = req.body;

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        exerciseXP: new Map(),
        totalExerciseXP: 0,
        completedExercises: [],
      });
    }

    // Add XP for this exercise question
    const currentXP = userProgress.exerciseXP.get(courseId) || 0;
    userProgress.exerciseXP.set(courseId, currentXP + xp);
    userProgress.totalExerciseXP += xp;

   
    if (!userProgress.completedExercises.some(id => id.toString() === exerciseId)) {
      userProgress.completedExercises.push(exerciseId);
    }

    await userProgress.save();

    return res.status(200).json({ success: true, totalExerciseXP: userProgress.totalExerciseXP });
  } catch (error) {
    console.error("Error in recordExerciseAttempt:", error);
    return res.status(500).json({ message: "Failed to record exercise attempt" });
  }
};
