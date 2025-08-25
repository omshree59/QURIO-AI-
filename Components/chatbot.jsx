import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { InvokeLLM } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Brain,
  Sparkles,
  Lightbulb,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_SUGGESTIONS = [
  { mood: 'Curious', emoji: '🤔', topics: ['History', 'Science'], message: "Feeling curious? Let's dive into the depths of History or uncover the secrets of Science!" },
  { mood: 'Creative', emoji: '🎨', topics: ['Art & Culture', 'Literature'], message: "Unleash your creativity! How about a journey through Art & Culture or the world of Literature?" },
  { mood: 'Energetic', emoji: '⚡', topics: ['Sports', 'Technology'], message: "Feeling energetic? Let's test your knowledge in the fast-paced worlds of Sports or Technology!" },
  { mood: 'Focused', emoji: '🎯', topics: ['Mathematics', 'Economics'], message: "Ready to focus? Challenge your mind with Mathematics or the principles of Economics!" }
];

const TOPIC_CATEGORIES = [
  { id: 'history', name: 'History' },
  { id: 'geography', name: 'Geography' },
  { id: 'science', name: 'Science' },
  { id: 'current_affairs', name: 'Current Affairs' },
  { id: 'sports', name: 'Sports' },
  { id: 'literature', name: 'Literature' },
  { id: 'art_culture', name: 'Art & Culture' },
  { id: 'technology', name: 'Technology' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'economics', name: 'Economics' }
];

export default function QurioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi there! I'm Qurio AI, your learning companion! 🌟 How are you feeling today? Pick a mood to get started!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMood, setUserMood] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, type = 'user') => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateBotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      const prompt = `User said: "${userMessage}"
      
      Analyze the user's mood and suggest appropriate quiz topics. Be friendly, encouraging, and personalized.
      
      Available topics: History, Science, Geography, Literature, Technology, Art & Culture, Sports, Current Affairs, Mathematics, Economics
      
      Respond in a conversational way and suggest 2-3 topics that match their mood. Keep it under 120 words.`;

      const response = await InvokeLLM({
        prompt: prompt
      });

      addMessage(response, 'bot');
    } catch (error) {
      addMessage("I'm having trouble connecting right now. But I'd love to help you find the perfect quiz! Try asking me about different topics you're interested in! 😊", 'bot');
    }
    
    setIsTyping(false);
  };

  const handleSendMessage = async (messageContent) => {
    const message = (typeof messageContent === 'string' ? messageContent : inputValue).trim();
    if (!message) return;

    addMessage(message, 'user');
    if (typeof messageContent !== 'string') {
        setInputValue("");
    }

    await generateBotResponse(message);
  };
  
  const handleMoodSelect = (mood) => {
    handleSendMessage(mood.mood);
    addMessage(mood.message, 'bot');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startQuizWithTopic = (topicName) => {
    const topic = TOPIC_CATEGORIES.find(t => t.name === topicName);
    if (topic) {
      navigate(createPageUrl("QuizSetup") + `?topic=${topic.id}`);
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-16 right-8 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-lg border-2 border-slate-800 text-white"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-16 right-8 z-50 ${
        isMinimized ? 'w-72' : 'w-80'
      }`}
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Qurio AI</CardTitle>
                <p className="text-xs text-purple-200">Your Learning Companion</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 text-purple-200 hover:text-white hover:bg-purple-500/30"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 text-purple-200 hover:text-white hover:bg-red-500/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <CardContent className="p-0">
                <ScrollArea className="h-72 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl break-words ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-slate-700/50 text-purple-100 border border-purple-500/30'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.type === 'bot' && (
                            <>
                              {message.content.includes("How about a journey") && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Art & Culture')}>Art</Button>
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Literature')}>Literature</Button>
                                </div>
                              )}
                              {message.content.includes("dive into the depths") && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('History')}>History</Button>
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Science')}>Science</Button>
                                </div>
                              )}
                              {message.content.includes("fast-paced worlds") && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Sports')}>Sports</Button>
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Technology')}>Tech</Button>
                                </div>
                              )}
                              {message.content.includes("Challenge your mind") && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Mathematics')}>Math</Button>
                                  <Button size="sm" className="bg-purple-500/50 text-xs h-6 px-2" onClick={() => startQuizWithTopic('Economics')}>Economics</Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700/50 p-3 rounded-2xl border border-purple-500/30">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Quick Mood Suggestions */}
                <div className="p-3 border-t border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex flex-wrap gap-1">
                    {MOOD_SUGGESTIONS.map((suggestion) => (
                      <Badge
                        key={suggestion.mood}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-500/30 bg-slate-700/50 text-purple-200 border-purple-500/30 text-xs px-2 py-1"
                        onClick={() => handleMoodSelect(suggestion)}
                      >
                        {suggestion.emoji} {suggestion.mood}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-purple-500/30">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 text-sm"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}