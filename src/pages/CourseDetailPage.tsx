import React, { useState } from 'react';
import { Star, Clock, Users, Award, CheckCircle, Globe, Smartphone, Trophy, Play } from 'lucide-react';
import CourseContent from '../components/CourseContent';
import CourseRating from '../components/CourseRating';

interface CourseDetailPageProps {
  onNavigateToPlayer?: () => void;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onNavigateToPlayer }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const courseData = {
    id: '1',
    title: 'Complete React Developer Course with Redux, Hooks, and GraphQL',
    subtitle: 'Learn React by Google. Become an React, Machine Learning, and Deep Learning expert!',
    instructor: {
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      bio: 'Senior Software Engineer at Google with 10+ years of experience',
      rating: 4.8,
      students: 150000,
      courses: 25,
    },
    rating: 4.7,
    reviewCount: 12560,
    studentCount: 89432,
    price: 84.99,
    originalPrice: 199.99,
    duration: '52 hours',
    lastUpdated: '2/2026',
    language: 'English',
    level: 'Intermediate',
    isBestseller: true,
    thumbnail: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    whatYouLearn: [
      'Build React applications using modern React features',
      'Master Redux for state management',
      'Implement GraphQL with Apollo Client',
      'Create responsive and interactive user interfaces',
      'Deploy React applications to production',
      'Understanding of React Hooks and Context API',
      'Testing React applications with Jest and React Testing Library',
      'Performance optimization techniques',
    ],
    requirements: [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with ES6+ features',
      'A computer with internet connection',
      'No prior React experience required',
    ],
    description: `This comprehensive React course will take you from beginner to advanced level. You'll learn all the modern React features including Hooks, Context API, and state management with Redux.

The course is project-based, so you'll build real-world applications while learning. By the end of this course, you'll have the skills and knowledge to build professional React applications and land your dream job as a React developer.`,
  };

  const modules = [
    {
      id: '1',
      title: 'Getting Started with React',
      totalDuration: '3h 45m',
      lessonCount: 15,
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
      lessonCount: 18,
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
    {
      id: '3',
      title: 'State Management and Hooks',
      totalDuration: '6h 15m',
      lessonCount: 20,
      lessons: [
        { id: '17', title: 'useState Hook', duration: '35m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '18', title: 'useEffect Hook', duration: '40m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '19', title: 'Custom Hooks', duration: '32m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '20', title: 'Context API', duration: '45m', type: 'video' as const, isCompleted: false, isFree: false },
        { id: '21', title: 'Hooks Reference Guide', duration: '15m', type: 'article' as const, isCompleted: false, isFree: false },
        { id: '22', title: 'Hook Examples & Templates', duration: '10m', type: 'material' as const, isCompleted: false, isFree: false, fileUrl: '/downloads/hooks-templates.zip' },
        { id: '23', title: 'Hooks Practice Quiz', duration: '25m', type: 'quiz' as const, isCompleted: false, isFree: false },
        { id: '24', title: 'Module 3 Final Exam', duration: '60m', type: 'exam' as const, isCompleted: false, isFree: false },
      ],
    },
  ];

  const handleEnroll = () => {
    setIsEnrolled(true);
    console.log('Enrolled in course');
  };

  const handleLessonSelect = (lessonId: string) => {
    console.log('Selected lesson:', lessonId);
    if (onNavigateToPlayer) {
      onNavigateToPlayer();
    }
  };

  const handleRatingSubmit = (ratingData: any) => {
    console.log('Course rating submitted:', ratingData);
    // Here you would typically send the rating to your backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <nav className="text-sm mb-4">
                <span className="text-purple-400">Development</span>
                <span className="mx-2">›</span>
                <span className="text-purple-400">Web Development</span>
                <span className="mx-2">›</span>
                <span>React</span>
              </nav>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{courseData.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{courseData.subtitle}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {courseData.isBestseller && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded">
                    Bestseller
                  </span>
                )}
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-2">{courseData.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(courseData.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 ml-2">({courseData.reviewCount.toLocaleString()} ratings)</span>
                </div>
                <span className="text-gray-300">{courseData.studentCount.toLocaleString()} students</span>
              </div>
              
              <div className="flex items-center text-gray-300 mb-6">
                <span>Created by {courseData.instructor.name}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Last updated {courseData.lastUpdated}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>{courseData.language}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
                <div className="relative">
                  <img
                    src={courseData.thumbnail}
                    alt={courseData.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900">${courseData.price}</span>
                      {courseData.originalPrice && (
                        <span className="text-gray-500 line-through ml-3">${courseData.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  
                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Enrolled</span>
                      </div>
                      <div className="space-y-2">
                        <button 
                          onClick={onNavigateToPlayer}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                          Start Learning
                        </button>
                        <button 
                          onClick={() => setShowRatingModal(true)}
                          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Rate This Course
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center text-sm text-gray-600 mb-6">
                    30-Day Money-Back Guarantee
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold text-gray-900">This course includes:</h4>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-3" />
                      <span>{courseData.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Smartphone className="w-4 h-4 mr-3" />
                      <span>Access on mobile and TV</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Trophy className="w-4 h-4 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'instructor', label: 'Instructor' },
                    { id: 'reviews', label: 'Reviews' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {courseData.whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h3>
                  <ul className="space-y-2 mb-8">
                    {courseData.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Description</h3>
                  <div className="prose max-w-none text-gray-700">
                    {courseData.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'curriculum' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h3>
                  <CourseContent
                    modules={modules}
                    onLessonSelect={handleLessonSelect}
                    isEnrolled={isEnrolled}
                  />
                </div>
              )}
              
              {activeTab === 'instructor' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Instructor</h3>
                  <div className="flex items-start mb-6">
                    <img
                      src={courseData.instructor.avatar}
                      alt={courseData.instructor.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{courseData.instructor.name}</h4>
                      <p className="text-gray-600 mb-2">{courseData.instructor.bio}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{courseData.instructor.rating} Rating</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{courseData.instructor.students.toLocaleString()} Students</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          <span>{courseData.instructor.courses} Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h3>
                  <div className="text-center py-12 text-gray-500">
                    <p>Reviews will be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <CourseContent
              modules={modules}
              onLessonSelect={handleLessonSelect}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </div>
      
      {/* Rating Modal */}
      {showRatingModal && (
        <CourseRating
          courseId={courseData.id}
          courseTitle={courseData.title}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;