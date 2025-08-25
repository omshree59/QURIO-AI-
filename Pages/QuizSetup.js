
import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Brain, 
  Settings, 
  PlayCircle, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Target,
  Lightbulb
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const TOPIC_CATEGORIES = [
  { id: 'history', name: 'History', icon: '🏛️', description: 'World history, civilizations, wars, and historical figures' },
  { id: 'geography', name: 'Geography', icon: '🌍', description: 'Countries, capitals, physical geography, and landmarks' },
  { id: 'science', name: 'Science', icon: '🔬', description: 'Physics, chemistry, biology, and scientific discoveries' },
  { id: 'current_affairs', name: 'Current Affairs', icon: '📰', description: 'Recent events, politics, and global news' },
  { id: 'sports', name: 'Sports', icon: '⚽', description: 'Sports history, records, and famous athletes' },
  { id: 'literature', name: 'Literature', icon: '📚', description: 'Authors, books, poetry, and literary works' },
  { id: 'art_culture', name: 'Art & Culture', icon: '🎨', description: 'Paintings, music, movies, and cultural traditions' },
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Computing, internet, innovations, and tech history' },
  { id: 'mathematics', name: 'Mathematics', icon: '🔢', description: 'Basic math, famous mathematicians, and concepts' },
  { id: 'economics', name: 'Economics', icon: '💰', description: 'Economic principles, famous economists, and markets' }
];

export default function QuizSetup() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState([10]);
  const [customTopic, setCustomTopic] = useState('');
  const [timeLimit, setTimeLimit] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState([15]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Set defaults based on user preferences
      if (currentUser.learning_preferences?.favorite_topics) {
        setSelectedTopics(currentUser.learning_preferences.favorite_topics.slice(0, 3));
      }
      if (currentUser.learning_preferences?.preferred_difficulty) {
        setDifficulty(currentUser.learning_preferences.preferred_difficulty);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const startQuiz = async () => {
    if (selectedTopics.length === 0 && !customTopic) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare topics for AI
      const topicsToUse = selectedTopics.length > 0 
        ? selectedTopics.map(id => TOPIC_CATEGORIES.find(cat => cat.id === id)?.name).filter(Boolean)
        : [customTopic];

      // Generate questions using AI
      const aiPrompt = `Generate a JSON object with a key "questions". The value should be an array of ${questionCount[0]} general knowledge quiz questions based on these topics: ${topicsToUse.join(', ')}. The difficulty should be ${difficulty}.

For each question in the array, provide a JSON object with the following keys:
- "question_text": The question itself.
- "options": An object with four keys: "A", "B", "C", "D".
- "correct_answer": The key of the correct option (e.g., "A").
- "explanation": A detailed explanation for the correct answer.
- "topic": The specific topic of the question.
- "difficulty": The difficulty level of the question (e.g., "Easy", "Medium", "Hard").

Ensure the JSON is well-formed.`;

      const response = await InvokeLLM({
        prompt: aiPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_text: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      A: { type: "string" },
                      B: { type: "string" },
                      C: { type: "string" },
                      D: { type: "string" }
                    }
                  },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  topic: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Navigate to quiz with generated questions
      const quizData = {
        questions: response.questions,
        settings: {
          topics: topicsToUse,
          difficulty,
          timeLimit: timeLimit ? timeLimitMinutes[0] * 60 : null,
          totalQuestions: questionCount[0]
        }
      };
      
      sessionStorage.setItem('pendingQuiz', JSON.stringify(quizData));
      navigate(createPageUrl("Quiz"));

    } catch (error) {
      console.error("Error generating quiz:", error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Quiz
          </h1>
          <p className="text-slate-400">Customize your AI-powered learning experience</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Selection */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-blue-400" />
                Choose Topics
              </CardTitle>
              <p className="text-sm text-slate-400">Select the areas you want to be tested on</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOPIC_CATEGORIES.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedTopics.includes(topic.id)
                        ? 'border-blue-500 bg-blue-500/10 shadow-md'
                        : 'border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${selectedTopics.includes(topic.id) ? 'text-white' : 'text-slate-200'}`}>
                          {topic.name}
                        </h3>
                        <p className={`text-xs mt-1 ${selectedTopics.includes(topic.id) ? 'text-slate-300' : 'text-slate-400'}`}>
                          {topic.description}
                        </p>
                      </div>
                      {selectedTopics.includes(topic.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Or enter a custom topic:</Label>
                <Textarea
                  placeholder="e.g., Ancient Roman History, Space Exploration, Renewable Energy..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="h-20 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5 text-blue-400" />
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Difficulty */}
              <div className="space-y-3">
                <Label className="text-slate-300">Difficulty Level</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('easy')}
                    className={`${
                      difficulty === 'easy' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('medium')}
                    className={`${
                      difficulty === 'medium' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    More Challenging
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('hard')}
                    className={`${
                      difficulty === 'hard' 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                        : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    Tougher
                  </Button>
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-3">
                <Label className="text-slate-300">Number of Questions: {questionCount[0]}</Label>
                <Slider
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Enable Time Limit</Label>
                  <Switch checked={timeLimit} onCheckedChange={setTimeLimit} />
                </div>
                {timeLimit && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Time Limit: {timeLimitMinutes[0]} minutes</Label>
                    <Slider
                      value={timeLimitMinutes}
                      onValueChange={setTimeLimitMinutes}
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Preview & Start */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quiz Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{selectedTopics.length > 0 ? selectedTopics.length : 'Custom'} topics selected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  <span>{questionCount[0]} questions • {
                    difficulty === 'easy' ? 'Easy' : 
                    difficulty === 'medium' ? 'More Challenging' : 
                    'Tougher'
                  } difficulty</span>
                </div>
                {timeLimit && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{timeLimitMinutes[0]} minute time limit</span>
                  </div>
                )}
              </div>

              <Button
                onClick={startQuiz}
                disabled={loading || (selectedTopics.length === 0 && !customTopic)}
                className="w-full bg-white text-blue-600 hover:bg-slate-50 font-semibold"
              >
                {loading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-amber-900/20 border-amber-500/30 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-300">
                <Lightbulb className="w-5 h-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-200 space-y-2">
              <p>• Mix multiple topics for varied learning</p>
              <p>• Start with Easy if unsure</p>
              <p>• Use time limits to simulate exam conditions</p>
              <p>• Review explanations after completing</p>
            </CardContent>
          </Card>

          {/* Selected Topics Display */}
          {selectedTopics.length > 0 && (
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-white">Selected Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(topicId => {
                    const topic = TOPIC_CATEGORIES.find(cat => cat.id === topicId);
                    return (
                      <Badge key={topicId} variant="secondary" className="bg-slate-700/50 text-slate-200 border-slate-600/50">
                        {topic?.icon} {topic?.name}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
