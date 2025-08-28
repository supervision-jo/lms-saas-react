import React, { useState } from 'react';
import { ArrowLeft, Menu, X, CheckCircle, Play, MessageCircle, FileText, Save, Send } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import CourseContent from '../components/CourseContent';

const CoursePlayerPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState('1');
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: '1',
      user: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      question: 'What is the difference between React and Angular?',
      timestamp: 'Jan 15, 2024 at 5:30 PM',
      likes: 12,
      replies: [
        {
          id: '1',
          user: 'John Doe',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          isInstructor: true,
          reply: 'Great question! React is a library focused on building UI components, while Angular is a full framework with more built-in features like routing, forms, and HTTP client. You can learn more about React at reactjs.org and Angular at angular.io.',
          timestamp: '2 hours ago',
          likes: 8
        }
      ]
    },
    {
      id: '2',
      user: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
      question: 'Can you explain JSX in more detail?',
      timestamp: 'Jan 15, 2024 at 8:15 PM',
      likes: 7,
      replies: [
        {
          id: '1',
          user: 'John Doe',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          isInstructor: true,
          reply: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. It gets compiled to regular JavaScript function calls. Check out the official JSX documentation at React JSX Guide for more details.',
          timestamp: '1 hour ago',
          likes: 5
        }
      ]
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const courseData = {
    id: '1',
    title: 'Complete React Developer Course with Redux, Hooks, and GraphQL',
    instructor: 'John Doe',
  };

  const modules = [
    {
      id: '1',
      title: 'Getting Started with React',
      totalDuration: '3h 45m',
      lessonCount: 8,
      lessons: [
        { 
          id: '1', 
          title: 'What is React?', 
          duration: '15m', 
          type: 'video' as const, 
          isCompleted: false, 
          isFree: true,
          youtubeUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM'
        },
        { 
          id: '2', 
          title: 'Setting up the Development Environment', 
          duration: '20m', 
          type: 'video' as const, 
          isCompleted: true, 
          isFree: true,
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
        },
        { 
          id: '3', 
          title: 'Creating Your First React App', 
          duration: '25m', 
          type: 'video' as const, 
          isCompleted: false, 
          isFree: false,
          youtubeUrl: 'https://youtu.be/SqcY0GlETPk'
        },
        { id: '4', title: 'Understanding JSX', duration: '18m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '5', title: 'React Basics Guide', duration: '10m', type: 'article' as const, isCompleted: false, isFree: false },
        { id: '6', title: 'Setup Files', duration: '5m', type: 'material' as const, isCompleted: false, isFree: false },
        { id: '7', title: 'Knowledge Check Quiz', duration: '15m', type: 'quiz' as const, isCompleted: false, isFree: false },
        { id: '8', title: 'Module 1 Final Exam', duration: '30m', type: 'exam' as const, isCompleted: false, isFree: false },
      ],
    },
    {
      id: '2',
      title: 'React Components and Props',
      totalDuration: '4h 20m',
      lessonCount: 8,
      lessons: [
        { id: '9', title: 'Functional Components', duration: '22m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '10', title: 'Class Components', duration: '25m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '11', title: 'Props and Prop Types', duration: '30m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '12', title: 'Component Composition', duration: '28m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '13', title: 'Components Best Practices', duration: '12m', type: 'article' as const, isCompleted: false, isFree: false },
        { id: '14', title: 'Component Examples', duration: '8m', type: 'material' as const, isCompleted: false, isFree: false },
        { id: '15', title: 'Props Quiz', duration: '20m', type: 'quiz' as const, isCompleted: false, isFree: false },
        { id: '16', title: 'Module 2 Final Exam', duration: '45m', type: 'exam' as const, isCompleted: false, isFree: false },
      ],
    },
  ];

  const getCurrentLesson = () => {
    for (const module of modules) {
      const lesson = module.lessons.find(l => l.id === currentLessonId);
      if (lesson) return lesson;
    }
    return modules[0].lessons[0];
  };

  const currentLesson = getCurrentLesson();

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  const handleVideoProgress = (progress: number) => {
    console.log('Video progress:', progress);
  };

  const handleVideoComplete = () => {
    console.log('Video completed');
    // Mark lesson as completed and move to next lesson
  };

  const handleSaveNotes = () => {
    console.log('Saving notes:', notes);
    // Save notes to backend
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question = {
      id: Date.now().toString(),
      user: 'Current User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      question: newQuestion,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      replies: []
    };
    
    setQuestions([question, ...questions]);
    setNewQuestion('');
  };

  const handleLikeQuestion = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, likes: q.likes + 1 } : q
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{courseData.title}</h1>
                <p className="text-sm text-gray-600">{courseData.instructor}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>Progress: 68%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
              <div className="flex items-center text-gray-300 text-sm">
                <Play className="w-4 h-4 mr-2" />
                <span>{currentLesson.duration}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{currentLesson.type}</span>
              </div>
            </div>
            
            <div className="aspect-video">
              <VideoPlayer
                videoUrl={currentLesson.videoUrl || ''}
                youtubeUrl={currentLesson.youtubeUrl}
                title={currentLesson.title}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />
            </div>

            {/* Lesson Content Tabs */}
            <div className="mt-8">
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Lesson Notes
                </button>
                <button
                  onClick={() => setActiveTab('qa')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'qa'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Q&A ({questions.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-gray-800 rounded-lg p-6">
                {activeTab === 'notes' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Lesson Notes</h3>
                      <button
                        onClick={handleSaveNotes}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Notes
                      </button>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes while watching..."
                      className="w-full h-64 bg-gray-700 text-white rounded-lg p-4 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Questions & Answers</h3>
                      
                      {/* Ask Question */}
                      <div className="bg-gray-700 rounded-lg p-4 mb-6">
                        <h4 className="text-white font-medium mb-3">Ask a Question</h4>
                        <textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full h-24 bg-gray-600 text-white rounded-lg p-3 border border-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none mb-3"
                        />
                        <button
                          onClick={handleAskQuestion}
                          disabled={!newQuestion.trim()}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Ask Question
                        </button>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <div key={question.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-start mb-3">
                              <img
                                src={question.avatar}
                                alt={question.user}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <h5 className="font-medium text-white mr-2">{question.user}</h5>
                                  <span className="text-xs text-gray-400">{question.timestamp}</span>
                                </div>
                                <p className="text-gray-300 mb-3">{question.question}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <button
                                    onClick={() => handleLikeQuestion(question.id)}
                                    className="flex items-center text-gray-400 hover:text-purple-400 transition-colors"
                                  >
                                    ❤️ {question.likes}
                                  </button>
                                  <button className="text-gray-400 hover:text-white transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Replies */}
                            {question.replies.map((reply) => (
                              <div key={reply.id} className="ml-12 mt-4 bg-gray-600 rounded-lg p-3">
                                <div className="flex items-start">
                                  <img
                                    src={reply.avatar}
                                    alt={reply.user}
                                    className="w-8 h-8 rounded-full mr-3"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <h6 className="font-medium text-white mr-2">{reply.user}</h6>
                                      {reply.isInstructor && (
                                        <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                                          Instructor
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400 ml-2">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-gray-300 mb-2">{reply.reply}</p>
                                    <button className="flex items-center text-gray-400 hover:text-purple-400 transition-colors text-sm">
                                      👍 {reply.likes}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Course Content */}
      <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-white shadow-lg`}>
        <CourseContent
          modules={modules}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          isEnrolled={true}
        />
      </div>
    </div>
  );
};

export default CoursePlayerPage;