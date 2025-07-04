import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Code, Lock, Trophy, Clock, CheckCircle, ArrowLeft, Star, Play } from 'lucide-react';
import { courseAPI, exerciseAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModalContext } from '../../context/AuthModalContext';
import LoadingScreen from '../../components/LoadingScreen';
import XPTracker from '../../components/XPTracker';

const ExercisesList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openLogin } = useAuthModalContext();
  
  const [course, setCourse] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Mock exercises data (replace with API call later)
  const mockExercises = [
    { id: 1, title: 'Hello World', difficulty: 'Easy', estimatedTime: '5 min', xp: 10, completed: false, locked: false },
    { id: 2, title: 'Variables & Data Types', difficulty: 'Easy', estimatedTime: '10 min', xp: 15, completed: false, locked: false },
    { id: 3, title: 'Control Structures', difficulty: 'Easy', estimatedTime: '15 min', xp: 20, completed: false, locked: false },
    { id: 4, title: 'Functions Basics', difficulty: 'Easy', estimatedTime: '20 min', xp: 25, completed: false, locked: false },
    { id: 5, title: 'Arrays & Objects', difficulty: 'Medium', estimatedTime: '25 min', xp: 30, completed: false, locked: true },
    { id: 6, title: 'DOM Manipulation', difficulty: 'Medium', estimatedTime: '30 min', xp: 35, completed: false, locked: true },
    { id: 7, title: 'Event Handling', difficulty: 'Medium', estimatedTime: '25 min', xp: 30, completed: false, locked: true },
    { id: 8, title: 'Async Programming', difficulty: 'Hard', estimatedTime: '40 min', xp: 50, completed: false, locked: true },
    { id: 9, title: 'API Integration', difficulty: 'Hard', estimatedTime: '45 min', xp: 55, completed: false, locked: true },
    { id: 10, title: 'Final Project', difficulty: 'Hard', estimatedTime: '60 min', xp: 75, completed: false, locked: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseResponse = await courseAPI.getCourse(courseId);
        setCourse(courseResponse);

        // For now, use mock exercises
        // TODO: Replace with actual API call when backend is ready
        // const exerciseResponse = await exerciseAPI.getExercises(courseId);
        setExercises(mockExercises);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data
        setCourse({ 
          title: 'JavaScript Programming', 
          level: 'Beginner',
          description: 'Learn JavaScript fundamentals through hands-on exercises'
        });
        setExercises(mockExercises);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleExerciseClick = (exercise) => {
    if (exercise.locked && (!isAuthenticated || !user?.isClubMember)) {
      // Show membership required modal or redirect
      if (!isAuthenticated) {
        openLogin(); // Open login modal instead of navigating
      } else {
        // Show club membership required
        alert('Club membership required for this exercise!');
      }
      return;
    }

    navigate(`/learn/exercises/${courseId}/${exercise.id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getProgressPercentage = () => {
    const completed = exercises.filter(ex => ex.completed).length;
    return Math.round((completed / exercises.length) * 100);
  };

  if (loading) {
    return (
      <LoadingScreen
        showMessage={false}
        size={48}
        duration={800}
      />
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-[#daf0fa] via-[#bceaff] to-[#bceaff] dark:from-[#020b23] dark:via-[#001233] dark:to-[#0a1128]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => navigate('/learn/exercises')}
          className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Exercises</span>
        </motion.button>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20 dark:border-gray-700/20 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                {course?.title || 'Course Exercises'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                {course?.description || 'Practice your coding skills with these exercises'}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(course?.level)}`}>
                  {course?.level}
                </span>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Code className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm">{exercises.length} Exercises</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Trophy className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm">{exercises.reduce((sum, ex) => sum + ex.xp, 0)} Total XP</span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getProgressPercentage()}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </motion.div>



        {/* Exercises List */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleExerciseClick(exercise)}
              className={`group cursor-pointer ${exercise.locked && (!isAuthenticated || !user?.isClubMember) ? 'opacity-60' : ''}`}
            >
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  {/* Exercise Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {exercise.completed ? (
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                      ) : exercise.locked && (!isAuthenticated || !user?.isClubMember) ? (
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                          <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Play className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                        {exercise.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>{exercise.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>{exercise.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
                    {exercise.locked && (!isAuthenticated || !user?.isClubMember) && (
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
                          {!isAuthenticated ? 'Login Required' : 'Club Member Only'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {index < 4 ? 'Free' : 'Premium'}
                        </div>
                      </div>
                    )}

                    {exercise.completed && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-current" />
                        <span className="text-xs sm:text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free vs Premium Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Exercise Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                First 4 exercises are free. Unlock all exercises with Club Membership!
              </p>
            </div>
            {(!isAuthenticated || !user?.isClubMember) && (
              <button
                onClick={() => navigate('/membership')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Upgrade to Club
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExercisesList;
