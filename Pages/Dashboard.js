
import React, { useState, useEffect } from "react";
import { User, Quiz } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  PlayCircle, 
  BarChart3,
  Calendar, 
  Zap,
  Trophy,
  Clock
} from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import QurioChatbot from "../components/chatbot/QurioChatbot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const allQuizzes = await Quiz.filter({ created_by: currentUser.email }, '-created_date');
      setRecentQuizzes(allQuizzes.slice(0, 10));

      // Calculate weekly stats
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      const weeklyQuizzes = allQuizzes.filter(quiz => {
        const quizDate = new Date(quiz.created_date);
        return isWithinInterval(quizDate, { start: weekStart, end: weekEnd });
      });

      const questionsAnsweredThisWeek = weeklyQuizzes.reduce((sum, quiz) => sum + quiz.total_questions, 0);
      const dailyGoal = currentUser.learning_preferences?.daily_goal || 10; // Default daily goal to 10 questions
      const weeklyGoal = dailyGoal * 7;
      
      setWeeklyStats({
        quizzesThisWeek: weeklyQuizzes.length,
        questionsThisWeek: questionsAnsweredThisWeek,
        averageScore: weeklyQuizzes.length > 0 
          ? weeklyQuizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / weeklyQuizzes.length 
          : 0,
        weeklyGoal: weeklyGoal,
        progress: weeklyGoal > 0 ? (questionsAnsweredThisWeek / weeklyGoal) * 100 : 0,
        message: questionsAnsweredThisWeek > 0 ? `You're on your way to greatness!` : `Let's get started! Your journey begins now!`
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userStats = user?.statistics || {};
  const accuracy = userStats.total_questions > 0 
    ? Math.round((userStats.correct_answers / userStats.total_questions) * 100)
    : 0;

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and User Profile */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          {/* User Info & Welcome */}
          <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-purple-400">
                <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl font-bold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                  <p className="text-xl font-semibold text-slate-300">{user?.full_name || 'Guest'}</p>
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3 mt-1">
                      Welcome back! 👋
                  </h1>
                  <p className="text-slate-300 mt-1">Ready to expand your knowledge today?</p>
              </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Link to={createPageUrl("Progress")}>
              <Button variant="outline" className="gap-2 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white">
                <BarChart3 className="w-4 h-4" />
                View Progress
              </Button>
            </Link>
            <Link to={createPageUrl("QuizSetup")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                <PlayCircle className="w-4 h-4" />
                + New Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                📊 Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{(userStats.correct_answers || 0) * 10}</div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  ⚡
                </div>
              </div>
              <p className="text-xs text-amber-300 mt-2">
                📈 Power up!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                🧠 Quizzes Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{userStats.total_quizzes || 0}</div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  📚
                </div>
              </div>
              <p className="text-xs text-sky-300 mt-2">
                📈 Brilliant progress!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                🎯 Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{accuracy}%</div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  🎯
                </div>
              </div>
              <p className="text-xs text-emerald-300 mt-2">
                📈 You're unstoppable!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                🔥 Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{userStats.current_streak || 0} days</div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  🏆
                </div>
              </div>
              <p className="text-xs text-pink-300 mt-2">
                📈 Level up!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="text-purple-400" /> Weekly Progress
              <Badge className="ml-auto bg-purple-600/50 text-purple-200 border border-purple-500">This Week</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-slate-200">
              <span>Questions Answered</span>
              <span className="font-semibold text-white">
                {weeklyStats?.questionsThisWeek || 0} / {weeklyStats?.weeklyGoal || 70}
              </span>
            </div>
            <Progress value={weeklyStats?.progress || 0} className="h-3 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
            <p className="text-sm text-purple-300 flex items-center gap-1">
              🚀 {weeklyStats?.message}
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-purple-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div>
                        <p className="font-medium text-white">{quiz.title}</p>
                        <p className="text-sm text-slate-400">
                          {quiz.topics?.join(', ')} • {
                            quiz.difficulty === 'easy' ? 'Easy' : 
                            quiz.difficulty === 'medium' ? 'More Challenging' : 
                            'Tougher'
                          }
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(quiz.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={quiz.score_percentage >= 70 ? 'default' : 'secondary'}
                          className={`font-semibold ${quiz.score_percentage >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-600 text-slate-200'}`}
                        >
                          {quiz.score_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300">No quizzes yet</p>
                  <p className="text-sm text-slate-400">Start your first quiz to see your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to={createPageUrl("QuizSetup")}>
                <Button className="w-full justify-start gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <PlayCircle className="w-5 h-5" />
                  Start Random Quiz
                </Button>
              </Link>
              
              <Link to={createPageUrl("QuizSetup")}>
                <Button variant="outline" className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <Brain className="w-5 h-5" />
                  Custom Quiz Setup
                </Button>
              </Link>
              
              <Link to={createPageUrl("Progress")}>
                <Button variant="outline" className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </Button>
              </Link>
              
              <Link to={createPageUrl("Achievements")}>
                <Button variant="outline" className="w-full justify-start gap-3 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <Award className="w-5 h-5" />
                  Check Achievements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Qurio AI Chatbot */}
      <QurioChatbot />
    </>
  );
}
