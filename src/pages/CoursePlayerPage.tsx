import React, { useState } from 'react';
import { ArrowLeft, Menu, X, CheckCircle, Play, MessageCircle, FileText, Save, Send, Users } from 'lucide-react';
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatGroup, setActiveChatGroup] = useState<any>(null);

  // Mock groups data for the current course
  const courseGroups = [
    {
      id: '1',
      name: 'Frontend Developers',
      description: 'Students focusing on React and frontend technologies',
      color: 'bg-blue-500',
      members: [
        { id: '1', name: 'John Doe', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', isOnline: true },
        { id: '2', name: 'Jane Smith', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', isOnline: false },
        { id: '3', name: 'Mike Johnson', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100', isOnline: true },
      ],
      messages: [
        {
          id: '1',
          user: 'Jane Smith',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
          message: 'Hey everyone! How are you finding this React lesson?',
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          user: 'Mike Johnson',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
          message: 'Really helpful! The JSX explanation was clear.',
          timestamp: '1 hour ago',
        },
      ],
    },
    {
      id: '2',
      name: 'Backend Engineers',
      description: 'Students working on server-side development',
      color: 'bg-green-500',
      members: [
        { id: '4', name: 'Sarah Wilson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', isOnline: true },
        { id: '5', name: 'Alex Brown', avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100', isOnline: false },
      ],
      messages: [
        {
          id: '1',
          user: 'Sarah Wilson',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
          message: 'Anyone working on the backend integration for React apps?',
          timestamp: '3 hours ago',
        },
      ],
    },
  ];

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

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    // Add user to group logic here
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log('Leaving group:', groupId);
    // Remove user from group logic here
  };

  const handleSendGroupMessage = (groupId: string) => {
    if (!groupMessage.trim()) return;
    
    console.log('Sending message to group:', groupId, groupMessage);
    // Add message to group logic here
    setGroupMessage('');
  };

  const handleShowChat = (group: any) => {
    setActiveChatGroup(group);
    setShowChatModal(true);
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setActiveChatGroup(null);
    setGroupMessage('');
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
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === 'groups'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Groups ({courseGroups.length})
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

                {activeTab === 'groups' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Study Groups</h3>
                      <p className="text-gray-300 text-sm mb-6">
                        Join study groups to collaborate with fellow students and discuss course content.
                      </p>
                      
                      {/* Groups List */}
                      <div className="space-y-4">
                        {courseGroups.map((group) => (
                          <div key={group.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full ${group.color} mr-3`} />
                                <div>
                                  <h4 className="font-semibold text-white">{group.name}</h4>
                                  <p className="text-gray-300 text-sm">{group.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                  onClick={() => handleJoinGroup(group.id)}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                                >
                                  Join
                                </button>
                              </div>
                            </div>
                            
                            {/* Group Members */}
                            <div className="flex items-center mb-3">
                              <span className="text-gray-400 text-sm mr-3">Members:</span>
                              <div className="flex -space-x-2">
                                {group.members.slice(0, 5).map((member) => (
                                  <div key={member.id} className="relative">
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-6 h-6 rounded-full border-2 border-gray-700"
                                      title={member.name}
                                    />
                                    {member.isOnline && (
                                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-gray-700"></div>
                                    )}
                                  </div>
                                ))}
                                {group.members.length > 5 && (
                                  <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-700 flex items-center justify-center text-xs text-white">
                                    +{group.members.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Recent Messages */}
                            <div className="border-t border-gray-600 pt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">Recent Discussion:</span>
                                <button
                                  onClick={() => handleShowChat(group)}
                                  className="text-purple-400 hover:text-purple-300 text-xs"
                                >
                                  Show Chat
                                </button>
                              </div>
                              
                              {group.messages.length > 0 ? (
                                <div className="space-y-2">
                                  {group.messages.slice(-2).map((message) => (
                                    <div key={message.id} className="flex items-start space-x-2">
                                      <img
                                        src={message.avatar}
                                        alt={message.user}
                                        className="w-5 h-5 rounded-full"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-white text-sm font-medium">{message.user}</span>
                                          <span className="text-gray-400 text-xs">{message.timestamp}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{message.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm italic">No messages yet. Start the conversation!</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {courseGroups.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-white mb-2">No Study Groups Yet</h4>
                          <p className="text-gray-400">
                            Study groups will appear here when they're created by your instructor.
                          </p>
                        </div>
                      )}
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

      {/* Group Chat Modal */}
      {showChatModal && activeChatGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex">
            {/* Left Sidebar - Group Info & Members */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
              {/* Group Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full ${activeChatGroup.color} mr-3`} />
                    <div>
                      <h3 className="text-xl font-bold text-white">{activeChatGroup.name}</h3>
                      <p className="text-gray-400 text-sm">{activeChatGroup.members.length} members</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseChatModal}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-300 text-sm">{activeChatGroup.description}</p>
              </div>

              {/* Members List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Members ({activeChatGroup.members.length})
                </h4>
                <div className="space-y-3">
                  {activeChatGroup.members.map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{member.name}</div>
                        <div className="text-gray-400 text-xs">
                          {member.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Actions */}
              <div className="p-6 border-t border-gray-700">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                  Leave Group
                </button>
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Group Chat</h3>
                    <p className="text-gray-400 text-sm">
                      {activeChatGroup.members.filter((m: any) => m.isOnline).length} online now
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
                <div className="space-y-6">
                  {/* Extended mock messages for long chat */}
                  {[
                    ...activeChatGroup.messages,
                    {
                      id: '3',
                      user: 'Sarah Wilson',
                      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Has anyone finished the React Hooks section yet? I\'m having trouble with useEffect.',
                      timestamp: '30 minutes ago',
                    },
                    {
                      id: '4',
                      user: 'Alex Chen',
                      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Yes! The key is understanding the dependency array. Let me share a helpful resource.',
                      timestamp: '25 minutes ago',
                    },
                    {
                      id: '5',
                      user: 'Emily Rodriguez',
                      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'I found this article really helpful: https://react.dev/reference/react/useEffect',
                      timestamp: '20 minutes ago',
                    },
                    {
                      id: '6',
                      user: 'David Kim',
                      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Thanks Emily! That article cleared up a lot of confusion for me.',
                      timestamp: '15 minutes ago',
                    },
                    {
                      id: '7',
                      user: 'Lisa Zhang',
                      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Should we schedule a study session for this weekend? We could go through the exercises together.',
                      timestamp: '10 minutes ago',
                    },
                    {
                      id: '8',
                      user: 'Tom Wilson',
                      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Great idea! I\'m free Saturday afternoon. What time works for everyone?',
                      timestamp: '8 minutes ago',
                    },
                    {
                      id: '9',
                      user: 'Sarah Wilson',
                      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Saturday 2 PM works for me! Should we use Zoom or Discord?',
                      timestamp: '5 minutes ago',
                    },
                    {
                      id: '10',
                      user: 'Alex Chen',
                      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
                      message: 'Discord would be great! I can create a server for our study group.',
                      timestamp: '2 minutes ago',
                    },
                  ].map((message: any) => (
                    <div key={message.id} className="flex items-start space-x-4">
                      <img
                        src={message.avatar}
                        alt={message.user}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white text-sm">{message.user}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <div className="bg-gray-800 rounded-2xl px-4 py-3 max-w-2xl">
                          <p className="text-gray-200 leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeChatGroup.messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">No messages yet</h4>
                      <p className="text-gray-400">Start the conversation with your study group!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-700 bg-gray-800">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={groupMessage}
                      onChange={(e) => setGroupMessage(e.target.value)}
                      placeholder={`Message ${activeChatGroup.name}...`}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendGroupMessage(activeChatGroup.id);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors">
                          <span className="text-lg">😊</span>
                        </button>
                        <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors">
                          📎
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        Press Enter to send, Shift+Enter for new line
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendGroupMessage(activeChatGroup.id)}
                    disabled={!groupMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayerPage;