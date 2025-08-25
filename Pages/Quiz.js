
import React, { useState, useEffect } from "react";
import { Quiz, Question, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  RotateCcw,
  Trophy,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizPage() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse quiz data from session storage
    const dataParam = sessionStorage.getItem('pendingQuiz');
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(dataParam);
        setQuizData(parsedData);
        if (parsedData.settings.timeLimit) {
          setTimeRemaining(parsedData.settings.timeLimit);
        }
        // Clean up session storage after use
        sessionStorage.removeItem('pendingQuiz');
      } catch (error) {
        console.error("Error parsing quiz data:", error);
        navigate(createPageUrl("QuizSetup"));
      }
    } else {
      navigate(createPageUrl("QuizSetup"));
    }
  }, [navigate]);

  useEffect(() => {
    // Timer logic
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const selectAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Calculate results
      let correctCount = 0;
      const questionResults = quizData.questions.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correct_answer;
        if (isCorrect) correctCount++;
        
        return {
          ...question,
          user_answer: userAnswer,
          is_correct: isCorrect
        };
      });

      const scorePercentage = Math.round((correctCount / quizData.questions.length) * 100);

      // Save quiz to database
      const quizRecord = await Quiz.create({
        title: `${quizData.settings.topics.join(', ')} Quiz`,
        topics: quizData.settings.topics,
        difficulty: quizData.settings.difficulty,
        total_questions: quizData.questions.length,
        correct_answers: correctCount,
        time_taken: quizData.settings.timeLimit ? (quizData.settings.timeLimit - (timeRemaining || 0)) : null,
        score_percentage: scorePercentage,
        completed_at: new Date().toISOString()
      });

      // Save questions to database - fix the data format
      for (let i = 0; i < questionResults.length; i++) {
        const question = questionResults[i];
        
        // Convert options object to array format expected by the entity
        const optionsArray = question.options 
          ? Object.values(question.options)
          : [];
        
        await Question.create({
          quiz_id: quizRecord.id,
          question_text: question.question_text,
          question_type: "multiple_choice", // Add required field
          options: optionsArray, // Convert to array
          correct_answer: question.correct_answer,
          user_answer: question.user_answer,
          is_correct: question.is_correct,
          explanation: question.explanation,
          topic: question.topic,
          difficulty: question.difficulty.toLowerCase() // Ensure lowercase to match enum
        });
      }

      // Update user statistics
      const user = await User.me();
      const userStats = user.statistics || {};
      
      await User.updateMyUserData({
        statistics: {
          ...userStats,
          total_quizzes: (userStats.total_quizzes || 0) + 1,
          total_questions: (userStats.total_questions || 0) + quizData.questions.length,
          correct_answers: (userStats.correct_answers || 0) + correctCount,
          current_streak: scorePercentage >= 70 ? (userStats.current_streak || 0) + 1 : 0,
          longest_streak: Math.max(
            (userStats.longest_streak || 0),
            scorePercentage >= 70 ? (userStats.current_streak || 0) + 1 : 0
          )
        }
      });

      // Show results
      setResults({
        score: scorePercentage,
        correctCount,
        totalQuestions: quizData.questions.length,
        questions: questionResults,
        quizId: quizRecord.id
      });
      setShowResults(true);

    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
    
    setLoading(false);
  };

  if (!quizData) {
    return <div className="max-w-4xl mx-auto p-8">Loading quiz...</div>;
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Quiz Complete!</h1>
          <p className="text-xl text-slate-300">
            You scored {results.score}% ({results.correctCount}/{results.totalQuestions})
          </p>
        </motion.div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Your Answers Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.questions.map((question, index) => (
              <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-900/40">
                <div className="flex items-start gap-3">
                  {question.is_correct ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium mb-2 text-white">{question.question_text}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded border text-sm ${
                            key === question.correct_answer
                              ? 'bg-green-500/10 border-green-500/30 text-green-300'
                              : key === question.user_answer && key !== question.correct_answer
                              ? 'bg-red-500/10 border-red-500/30 text-red-300'
                              : 'bg-slate-700/50 border-slate-600 text-slate-300'
                          }`}
                        >
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-900/20 p-3 rounded text-sm border border-blue-500/20 text-blue-200">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl("QuizSetup"))}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Take Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{quizData.settings.topics.join(', ')} Quiz</CardTitle>
              <p className="text-blue-100">
                Question {currentQuestionIndex + 1} of {quizData.questions.length} • 
                {quizData.settings.difficulty} difficulty
              </p>
            </div>
            {timeRemaining && (
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
          <Progress value={progress} className="mt-4 bg-blue-400" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl flex-1 text-white">
                  {currentQuestion.question_text}
                </CardTitle>
                <Badge variant="outline" className="ml-4 border-purple-500/50 text-purple-300 bg-purple-900/20">
                  {currentQuestion.topic}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <Button
                  key={key}
                  variant={answers[currentQuestionIndex] === key ? 'default' : 'outline'}
                  className={`w-full justify-start text-left h-auto p-4 transition-all duration-200 ${
                    answers[currentQuestionIndex] === key 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-purple-400' 
                      : 'text-slate-200 bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  }`}
                  onClick={() => selectAnswer(currentQuestionIndex, key)}
                >
                  <span className="font-semibold mr-3">{key}:</span>
                  <span className="flex-1">{value}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        </div>

        <div className="text-sm text-slate-600">
          {answeredQuestions} of {quizData.questions.length} answered
        </div>

        <div className="flex gap-2">
          {currentQuestionIndex < quizData.questions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quizData.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-9 w-9 p-0 transition-all duration-200 ${
                  answers[index] ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'border-slate-600 text-slate-400'
                } ${
                  currentQuestionIndex === index 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ring-2 ring-purple-400' 
                    : 'hover:bg-slate-700'
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
