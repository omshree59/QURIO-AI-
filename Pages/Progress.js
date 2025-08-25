
import React, { useState, useEffect } from "react";
import { User, Quiz, Question } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Brain,
  Trophy,
  BarChart3,
  Award
} from "lucide-react";
import { format, subDays, isWithinInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

export default function ProgressPage() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const userQuizzes = await Quiz.filter({ created_by: currentUser.email }, '-created_date');
      setQuizzes(userQuizzes);

      // Get questions for all quizzes
      const allQuestions = [];
      for (const quiz of userQuizzes) {
        const quizQuestions = await Question.filter({ quiz_id: quiz.id });
        allQuestions.push(...quizQuestions);
      }
      setQuestions(allQuestions);
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const userStats = user?.statistics || {};
  const accuracy = userStats.total_questions > 0
    ? Math.round((userStats.correct_answers / userStats.total_questions) * 100)
    : 0;

  // Prepare chart data
  const last30Days = Array.from({ length: timeRange }, (_, i) => {
    const date = subDays(new Date(), timeRange - 1 - i);
    const dayQuizzes = quizzes.filter(quiz =>
      format(new Date(quiz.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    return {
      date: format(date, 'MMM d'),
      quizzes: dayQuizzes.length,
      score: dayQuizzes.length > 0
        ? Math.round(dayQuizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / dayQuizzes.length)
        : 0,
      questions: dayQuizzes.reduce((sum, quiz) => sum + quiz.total_questions, 0)
    };
  });

  // Topic performance data
  const topicStats = {};
  questions.forEach(question => {
    if (!topicStats[question.topic]) {
      topicStats[question.topic] = { total: 0, correct: 0 };
    }
    topicStats[question.topic].total++;
    if (question.is_correct) {
      topicStats[question.topic].correct++;
    }
  });

  const topicPerformance = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    total: stats.total,
    correct: stats.correct
  })).sort((a, b) => b.accuracy - a.accuracy);

  // Difficulty performance
  const difficultyStats = {};
  questions.forEach(question => {
    if (!difficultyStats[question.difficulty]) {
      difficultyStats[question.difficulty] = { total: 0, correct: 0 };
    }
    difficultyStats[question.difficulty].total++;
    if (question.is_correct) {
      difficultyStats[question.difficulty].correct++;
    }
  });

  const difficultyPerformance = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
    difficulty,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    total: stats.total,
    fill: difficulty === 'easy' ? '#10B981' : difficulty === 'medium' ? '#F59E0B' : '#EF4444'
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Learning Analytics
          </h1>
          <p className="text-slate-400 mt-2">Track your progress and identify areas for improvement</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              onClick={() => setTimeRange(days)}
              size="sm"
              className={`${timeRange === days ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-slate-300">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userStats.total_quizzes || 0}</div>
              <Brain className="w-8 h-8 opacity-50 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-slate-300">Overall Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{accuracy}%</div>
              <Target className="w-8 h-8 opacity-50 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-slate-300">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userStats.current_streak || 0}</div>
              <Trophy className="w-8 h-8 opacity-50 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-slate-300">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{userStats.total_questions || 0}</div>
              <BarChart3 className="w-8 h-8 opacity-50 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-blue-400" />
              Daily Activity ({timeRange} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#cbd5e1'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="quizzes"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Quizzes Taken"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Average Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Performance */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-purple-400" />
              Performance by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="total"
                  labelLine={false}
                >
                  {difficultyPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, 'Questions']}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#cbd5e1'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4 text-slate-300">
              {difficultyPerformance.map((item) => (
                <div key={item.difficulty} className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1`} style={{ backgroundColor: item.fill }}></div>
                  <p className="text-sm font-medium capitalize">{item.difficulty}</p>
                  <p className="text-xs text-slate-400">{item.accuracy}% accuracy</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-blue-400" />
            Topic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topicPerformance.length > 0 ? (
            <div className="space-y-4">
              {topicPerformance.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-200">{topic.topic}</h3>
                    <p className="text-sm text-slate-400">
                      {topic.correct} correct out of {topic.total} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <ProgressBar value={topic.accuracy} className="h-2 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
                    </div>
                    <Badge
                      variant={topic.accuracy >= 70 ? 'default' : 'secondary'}
                      className={topic.accuracy >= 70 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}
                    >
                      {topic.accuracy}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No topic data available</p>
              <p className="text-sm text-slate-500">Take some quizzes to see your topic performance!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Quizzes */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.slice(0, 10).map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/40">
                  <div>
                    <h3 className="font-medium text-white">{quiz.title}</h3>
                    <p className="text-sm text-slate-400">
                      {quiz.topics?.join(', ')} • {quiz.difficulty} difficulty
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(quiz.created_date), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={quiz.score_percentage >= 70 ? 'default' : 'secondary'}
                      className={`mb-1 font-semibold ${quiz.score_percentage >= 70 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}
                    >
                      {quiz.score_percentage}%
                    </Badge>
                    <p className="text-xs text-slate-500">
                      {quiz.correct_answers}/{quiz.total_questions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No quiz history yet</p>
              <p className="text-sm text-slate-500">Start taking quizzes to see your progress here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
