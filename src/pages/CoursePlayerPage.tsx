import React, { useState } from 'react';
import { ArrowLeft, Menu, X, Settings, Maximize, Users, MessageCircle, BookOpen } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import CourseContent from '../components/CourseContent';

const CoursePlayerPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState('1');

  const courseData = {
    id: '1',
    title: 'Complete React Developer Course with Redux, Hooks, and GraphQL',
    instructor: 'John Doe',
    currentLesson: {
      id: '1',
      title: 'What is React?',
      type: 'video' as const,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '15m',
    },
  };

  const modules = [
    {
      id: '1',
      title: 'Getting Started with React',
      totalDuration: '3h 45m',
      lessonCount: 8,
      lessons: [
        { id: '1', title: 'What is React?', duration: '15m', type: 'video' as const, isCompleted: true, isFree: true },
        { id: '2', title: 'Setting up the Development Environment', duration: '20m', type: 'video' as const, isCompleted: true, isFree: true },
        { id: '3', title: 'Creating Your First React App', duration: '25m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '4', title: 'Understanding JSX', duration: '18m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '5', title: 'React Basics Guide', duration: '10m', type: 'article' as const, isCompleted: false, isFree: false },
        { id: '6', title: 'Setup Files', duration: '5m', type: 'material' as const, isCompleted: false, isFree: false, fileUrl: '/downloads/react-setup.zip' },
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
        { id: '14', title: 'Component Examples', duration: '8m', type: 'material' as const, isCompleted: false, isFree: false, fileUrl: '/downloads/components-examples.pdf' },
        { id: '15', title: 'Props Quiz', duration: '20m', type: 'quiz' as const, isCompleted: false, isFree: false },
        { id: '16', title: 'Module 2 Final Exam', duration: '45m', type: 'exam' as const, isCompleted: false, isFree: false },
      ],
    },
  ];

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    console.log('Selected lesson:', lessonId);
  };

  const handleVideoProgress = (progress: number) => {
    console.log('Video progress:', progress);
  };

  const handleVideoComplete = () => {
    console.log('Video completed');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">{courseData.title}</h1>
                <p className="text-gray-400 text-sm">{courseData.instructor}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto px-6">
              <VideoPlayer
                videoUrl={courseData.currentLesson.videoUrl}
                youtubeUrl={courseData.currentLesson.youtubeUrl}
                title={courseData.currentLesson.title}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />
            </div>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">{courseData.currentLesson.title}</h2>
              <p className="text-gray-400 text-sm">{courseData.currentLesson.duration}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Q&A (2)
              </button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Groups (2)
              </button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Lesson Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <CourseContent
          modules={modules}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          isEnrolled={true}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CoursePlayerPage;