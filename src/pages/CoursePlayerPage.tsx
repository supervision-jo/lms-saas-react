import React, { useState } from 'react';
import { ArrowLeft, Menu, X, CheckCircle, Play } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import CourseContent from '../components/CourseContent';

const CoursePlayerPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState('1');

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

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-white shadow-lg`}>
        <CourseContent
          modules={modules}
          currentLessonId={currentLessonId}
          onLessonSelect={handleLessonSelect}
          isEnrolled={true}
        />
      </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;