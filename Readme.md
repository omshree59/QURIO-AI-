# Qurio AI - Smart Learning Platform

A modern, AI-powered learning platform that helps users learn through interactive quizzes, progress tracking, and an intelligent chatbot companion.

## Features

### 🧠 Intelligent Quiz Generation
- AI-powered question creation using advanced language models
- Multiple difficulty levels (Easy, More Challenging, Tougher)
- 10+ topic categories including History, Science, Technology, and more
- Customizable quiz length (5-50 questions)
- Time-limited quizzes for exam simulation

### 📊 Comprehensive Progress Tracking
- Real-time performance analytics
- Weekly and monthly progress visualization
- Topic-wise accuracy tracking
- Difficulty-based performance insights
- Interactive charts and graphs using Recharts

### 🏆 Achievement System
- Dynamic badge system
- Learning streaks and milestones
- Personalized achievement tracking
- Progress-based rewards
- Motivational challenges

### 🤖 Qurio AI Chatbot
- Mood-based quiz recommendations
- Interactive learning companion
- Topic suggestions based on user preferences
- Real-time assistance and guidance
- Personalized learning paths

### 👤 User Profile Management
- Customizable user profiles
- Avatar upload functionality
- Learning preferences configuration
- Personal statistics tracking
- Goal setting and tracking

### 🎨 Modern Dark UI
- Beautiful gradient designs
- Responsive layout for all devices
- Smooth animations with Framer Motion
- Intuitive navigation and user experience
- Dark theme optimized for extended learning sessions

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library

### Data Visualization
- **Recharts** - Interactive charts and graphs
- **Date-fns** - Date manipulation and formatting

### AI Integration
- **Custom AI SDK** - Integrated AI services for quiz generation
- **LLM Integration** - Advanced language model integration
- **Smart Content Generation** - Context-aware question creation

### File Management
- **File Upload System** - Profile picture and document uploads
- **Cloud Storage** - Secure file storage and retrieval

## Project Structure

src/ ├── entities/ # Data models and schemas │ ├── User.json # User entity definition │ ├── Quiz.json # Quiz entity definition │ └── Question.json # Question entity definition ├── pages/ # Main application pages │ ├── Dashboard.js # Main dashboard with stats │ ├── QuizSetup.js # Quiz configuration page │ ├── Quiz.js # Quiz taking interface │ ├── Progress.js # Analytics and progress tracking │ ├── Achievements.js # Achievement gallery │ └── Profile.js # User profile management ├── components/ # Reusable components │ └── chatbot/ │ └── QurioChatbot.jsx # AI chatbot component └── Layout.js # Main layout wrapper


## Key Features Explained

### Quiz Generation
The platform uses advanced AI to generate contextual, educational quizzes. Users can:
- Select from 10+ predefined topics
- Choose difficulty levels
- Set question count (5-50 questions)
- Enable/disable time limits
- Get AI-generated explanations for answers

### Progress Analytics
Comprehensive tracking system that provides:
- Daily, weekly, and monthly activity charts
- Topic-wise performance analysis
- Difficulty-based accuracy metrics
- Learning streak monitoring
- Goal progress visualization

### AI Chatbot Integration
Qurio AI chatbot offers:
- Mood-based topic recommendations
- Interactive quiz suggestions
- Learning path guidance
- Real-time assistance
- Personalized motivational messages

### Achievement System
Gamified learning with:
- Progressive badge unlocking
- Streak-based rewards
- Performance milestones
- Learning diversity recognition
- Personal best tracking

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qurio-ai-learning-platform.git
   cd qurio-ai-learning-platform