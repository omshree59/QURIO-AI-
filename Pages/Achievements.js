import React, { useState, useEffect } from "react";
import { User, Quiz } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Award, 
  Star,
  Target,
  Zap,
  Brain,
  Calendar,
  TrendingUp,
  Crown,
  Medal,
  Sparkles
} from "lucide-react";

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: Brain,
    color: 'bg-blue-500',
    requirement: (user, quizzes) => quizzes.length >= 1
  },
  {
    id: 'quiz_master_10',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: Trophy,
    color: 'bg-purple-500',
    requirement: (user, quizzes) => quizzes.length >= 10
  },
  {
    id: 'quiz_legend_50',
    title: 'Quiz Legend',
    description: 'Complete 50 quizzes',
    icon: Crown,
    color: 'bg-yellow-500',
    requirement: (user, quizzes) => quizzes.length >= 50
  },
  {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Score 100% on any quiz',
    icon: Star,
    color: 'bg-green-500',
    requirement: (user, quizzes) => quizzes.some(quiz => quiz.score_percentage === 100)
  },
  {
    id: 'high_scorer',
    title: 'High Achiever',
    description: 'Score 90% or higher on 5 quizzes',
    icon: Target,
    color: 'bg-red-500',
    requirement: (user, quizzes) => quizzes.filter(quiz => quiz.score_percentage >= 90).length >= 5
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: Zap,
    color: 'bg-orange-500',
    requirement: (user) => user.statistics?.longest_streak >= 7
  },
  {
    id: 'streak_30',
    title: 'Monthly Marvel',
    description: 'Maintain a 30-day learning streak',
    icon: Calendar,
    color: 'bg-indigo-500',
    requirement: (user) => user.statistics?.longest_streak >= 30
  },
  {
    id: 'accuracy_master',
    title: 'Accuracy Master',
    description: 'Maintain 80%+ overall accuracy with 100+ questions',
    icon: Medal,
    color: 'bg-emerald-500',
    requirement: (user) => {
      const stats = user.statistics;
      return stats?.total_questions >= 100 && 
             (stats.correct_answers / stats.total_questions) >= 0.8;
    }
  },
  {
    id: 'diverse_learner',
    title: 'Diverse Learner',
    description: 'Complete quizzes in 5 different topics',
    icon: Sparkles,
    color: 'bg-pink-500',
    requirement: (user, quizzes) => {
      const uniqueTopics = new Set();
      quizzes.forEach(quiz => {
        quiz.topics?.forEach(topic => uniqueTopics.add(topic));
      });
      return uniqueTopics.size >= 5;
    }
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a 20-question quiz in under 10 minutes',
    icon: TrendingUp,
    color: 'bg-cyan-500',
    requirement: (user, quizzes) => {
      return quizzes.some(quiz => 
        quiz.total_questions >= 20 && 
        quiz.time_taken && 
        quiz.time_taken < 600 // 10 minutes
      );
    }
  }
];

export default function Achievements() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const userQuizzes = await Quiz.filter({ created_by: currentUser.email }, '-created_date');
      setQuizzes(userQuizzes);

      // Check which achievements are unlocked
      const unlockedAchievements = ACHIEVEMENT_DEFINITIONS.map(achievement => ({
        ...achievement,
        unlocked: achievement.requirement(currentUser, userQuizzes),
        unlockedAt: currentUser.statistics?.badges?.includes(achievement.id) ? new Date() : null
      }));

      setAchievements(unlockedAchievements);

      // Update user badges if new achievements are unlocked
      const newBadges = unlockedAchievements
        .filter(a => a.unlocked && !currentUser.statistics?.badges?.includes(a.id))
        .map(a => a.id);

      if (newBadges.length > 0) {
        const currentBadges = currentUser.statistics?.badges || [];
        await User.updateMyUserData({
          statistics: {
            ...currentUser.statistics,
            badges: [...currentBadges, ...newBadges]
          }
        });
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Achievements Gallery
        </h1>
        <p className="text-slate-600">Celebrate your learning milestones and track your progress</p>
        
        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl max-w-md mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold">{unlockedCount} / {totalCount}</div>
              <p className="text-blue-100 text-sm">Achievements Unlocked</p>
            </div>
            <Progress value={progressPercentage} className="bg-blue-400" />
            <p className="text-center text-blue-100 text-sm">{progressPercentage}% Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const IconComponent = achievement.icon;
          
          return (
            <Card 
              key={achievement.id} 
              className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                achievement.unlocked 
                  ? 'bg-white/90 backdrop-blur-sm' 
                  : 'bg-slate-100/80 backdrop-blur-sm opacity-60'
              }`}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full ${achievement.color} flex items-center justify-center mx-auto mb-3 ${
                  achievement.unlocked ? 'shadow-lg' : 'opacity-50'
                }`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className={`text-lg ${achievement.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                  {achievement.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className={`text-sm ${achievement.unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                  {achievement.description}
                </p>
                
                {achievement.unlocked ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Award className="w-3 h-3 mr-1" />
                      Unlocked!
                    </Badge>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-slate-500">
                        Earned on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                    Locked
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{user?.statistics?.total_quizzes || 0}</div>
            <p className="text-sm text-slate-600">Quizzes Completed</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">
              {user?.statistics?.total_questions > 0 
                ? Math.round((user.statistics.correct_answers / user.statistics.total_questions) * 100)
                : 0}%
            </div>
            <p className="text-sm text-slate-600">Overall Accuracy</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{user?.statistics?.current_streak || 0}</div>
            <p className="text-sm text-slate-600">Current Streak</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{user?.statistics?.longest_streak || 0}</div>
            <p className="text-sm text-slate-600">Best Streak</p>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200">
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-amber-800 mb-2">Keep Learning!</h3>
          <p className="text-amber-700">
            Every quiz you take brings you closer to unlocking new achievements. 
            Challenge yourself with different topics and difficulty levels!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}