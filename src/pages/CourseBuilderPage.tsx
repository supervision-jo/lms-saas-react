import React, { useState } from 'react';
import { Plus, Save, Eye, Upload, Video, FileText, HelpCircle, Award, ArrowLeft, Settings, Trash2, Edit, GripVertical, Link, Youtube } from 'lucide-react';
import QuizBuilder from '../components/QuizBuilder';
import QuizPreview from '../components/QuizPreview';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'exam' | 'material';
  content?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  duration?: string;
  quiz?: any;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  level: string;
  modules: Module[];
}

const CourseBuilderPage: React.FC = () => {
  const [course, setCourse] = useState<Course>({
    id: Date.now().toString(),
    title: '',
    description: '',
    price: 0,
    category: 'development',
    level: 'beginner',
    modules: [],
  });

  const [activeTab, setActiveTab] = useState('course-info');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson', id: string, moduleId?: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string, lessonId: string } | null>(null);
  const [editingArticle, setEditingArticle] = useState<{ moduleId: string, lessonId: string } | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState<{ moduleId: string, lessonId: string } | null>(null);

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      description: '',
      lessons: [],
      order: course.modules.length + 1,
    };
    setCourse({
      ...course,
      modules: [...course.modules, newModule],
    });
    setSelectedModule(newModule.id);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId ? { ...module, ...updates } : module
      ),
    });
  };

  const deleteModule = (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setCourse({
        ...course,
        modules: course.modules.filter(module => module.id !== moduleId),
      });
      if (selectedModule === moduleId) {
        setSelectedModule(null);
      }
    }
  };

  const addLesson = (moduleId: string, type: Lesson['type']) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      order: 0,
    };

    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [...module.lessons, { ...newLesson, order: module.lessons.length }],
            }
          : module
      ),
    });

    if (type === 'quiz') {
      setSelectedLesson(newLesson.id);
      setSelectedModule(moduleId);
      setShowQuizBuilder(true);
    } else if (type === 'video') {
      setEditingLesson({ moduleId, lessonId: newLesson.id });
    } else if (type === 'article') {
      setEditingArticle({ moduleId, lessonId: newLesson.id });
    } else if (type === 'material') {
      setUploadingMaterial({ moduleId, lessonId: newLesson.id });
    }
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              ),
            }
          : module
      ),
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      setCourse({
        ...course,
        modules: course.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.filter(lesson => lesson.id !== lessonId),
              }
            : module
        ),
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'module' | 'lesson', id: string, moduleId?: string) => {
    setDraggedItem({ type, id, moduleId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'module' | 'lesson', targetId: string, targetModuleId?: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Handle module reordering
    if (draggedItem.type === 'module' && targetType === 'module' && draggedItem.id !== targetId) {
      // Reorder modules
      const draggedIndex = course.modules.findIndex(m => m.id === draggedItem.id);
      const targetIndex = course.modules.findIndex(m => m.id === targetId);
      
      const newModules = [...course.modules];
      const [draggedModule] = newModules.splice(draggedIndex, 1);
      newModules.splice(targetIndex, 0, draggedModule);
      
      // Update order
      newModules.forEach((module, index) => {
        module.order = index;
      });
      
      setCourse({ ...course, modules: newModules });
    } 
    // Handle lesson reordering within the same module
    else if (draggedItem.type === 'lesson' && targetType === 'lesson' && draggedItem.moduleId === targetModuleId && draggedItem.id !== targetId) {
      // Reorder lessons within the same module
      const moduleIndex = course.modules.findIndex(m => m.id === targetModuleId);
      if (moduleIndex === -1) return;
      
      const module = course.modules[moduleIndex];
      const draggedLessonIndex = module.lessons.findIndex(l => l.id === draggedItem.id);
      const targetLessonIndex = module.lessons.findIndex(l => l.id === targetId);
      
      if (draggedLessonIndex === -1 || targetLessonIndex === -1) return;
      
      const newLessons = [...module.lessons];
      const [draggedLesson] = newLessons.splice(draggedLessonIndex, 1);
      newLessons.splice(targetLessonIndex, 0, draggedLesson);
      
      // Update order
      newLessons.forEach((lesson, index) => {
        lesson.order = index;
      });
      
      const newModules = [...course.modules];
      newModules[moduleIndex] = { ...module, lessons: newLessons };
      setCourse({ ...course, modules: newModules });
    }
    
    setDraggedItem(null);
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleQuizSave = (quiz: any) => {
    if (selectedModule && selectedLesson) {
      updateLesson(selectedModule, selectedLesson, { quiz });
      setShowQuizBuilder(false);
      setCurrentQuiz(null);
      setSelectedLesson(null);
    }
  };

  const handleQuizPreview = (quiz: any) => {
    setCurrentQuiz(quiz);
    setShowQuizPreview(true);
  };

  const editQuiz = (moduleId: string, lessonId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    if (lesson?.quiz) {
      setCurrentQuiz(lesson.quiz);
      setSelectedModule(moduleId);
      setSelectedLesson(lessonId);
      setShowQuizBuilder(true);
    }
  };

  const saveCourse = () => {
    console.log('Saving course:', course);
    alert('Course saved successfully!');
  };

  const publishCourse = () => {
    console.log('Publishing course:', course);
    alert('Course published successfully!');
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'exam': return <Award className="w-4 h-4" />;
      case 'material': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Course Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveCourse}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={publishCourse}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('course-info')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'course-info'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Course Information
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'curriculum'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'course-info' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      placeholder="Enter course title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Description *
                    </label>
                    <textarea
                      value={course.description}
                      onChange={(e) => setCourse({ ...course, description: e.target.value })}
                      placeholder="Describe what students will learn in this course"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={course.price}
                        onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={course.category}
                        onChange={(e) => setCourse({ ...course, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="development">Development</option>
                        <option value="business">Business</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="data-science">Data Science</option>
                        <option value="photography">Photography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level *
                      </label>
                      <select
                        value={course.level}
                        onChange={(e) => setCourse({ ...course, level: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all-levels">All Levels</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Thumbnail
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>
                    <button
                      onClick={addModule}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </button>
                  </div>

                  {course.modules.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <FileText className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                      <p className="text-gray-600 mb-4">Start building your course by adding your first module</p>
                      <button
                        onClick={addModule}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Your First Module
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <div 
                          key={module.id} 
                          className="border border-gray-200 rounded-lg"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'module', module.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, 'module', module.id)}
                        >
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                  />
                                  <input
                                    type="text"
                                    value={module.description}
                                    onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                    placeholder="Module description"
                                    className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-1"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="relative group">
                                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[150px]">
                                    <button
                                      onClick={() => addLesson(module.id, 'video')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Video className="w-4 h-4 mr-2" />
                                      Video
                                    </button>
                                    <button
                                      onClick={() => addLesson(module.id, 'article')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Article
                                    </button>
                                    <button
                                      onClick={() => addLesson(module.id, 'quiz')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <HelpCircle className="w-4 h-4 mr-2" />
                                      Quiz
                                    </button>
                                    <button
                                      onClick={() => addLesson(module.id, 'exam')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Award className="w-4 h-4 mr-2" />
                                      Exam
                                    </button>
                                    <button
                                      onClick={() => addLesson(module.id, 'material')}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Material
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteModule(module.id)}
                                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {module.lessons.length > 0 && (
                            <div className="p-4">
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div 
                                    key={lesson.id} 
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'lesson', lesson.id, module.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'lesson', lesson.id, module.id)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                      {getLessonIcon(lesson.type)}
                                      <div>
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                          className="font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                        />
                                        <p className="text-sm text-gray-500 capitalize">{lesson.type}</p>
                                        {lesson.youtubeUrl && (
                                          <div className="flex items-center text-xs text-red-600 mt-1">
                                            <Youtube className="w-3 h-3 mr-1" />
                                            YouTube Video
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {lesson.type === 'video' && (
                                        <button
                                          onClick={() => setEditingLesson({ moduleId: module.id, lessonId: lesson.id })}
                                          className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                          title="Edit Video"
                                        >
                                          <Link className="w-4 h-4" />
                                        </button>
                                      )}
                                      {lesson.type === 'article' && (
                                        <button
                                          onClick={() => setEditingArticle({ moduleId: module.id, lessonId: lesson.id })}
                                          className="p-1 text-green-400 hover:text-green-600 transition-colors"
                                          title="Edit Article"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}
                                      {lesson.type === 'material' && (
                                        <button
                                          onClick={() => setUploadingMaterial({ moduleId: module.id, lessonId: lesson.id })}
                                          className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                                          title="Upload Material"
                                        >
                                          <Upload className="w-4 h-4" />
                                        </button>
                                      )}
                                      {lesson.type === 'quiz' && (
                                        <button
                                          onClick={() => editQuiz(module.id, lesson.id)}
                                          className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                                          title="Edit Quiz"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteLesson(module.id, lesson.id)}
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Course Status</h4>
                          <p className="text-sm text-gray-600">Control who can see your course</p>
                        </div>
                        <select className="border border-gray-300 rounded-lg px-3 py-2">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto-approve enrollments</h4>
                          <p className="text-sm text-gray-600">Students can enroll immediately</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-purple-600" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Builder Modal */}
      {showQuizBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <QuizBuilder
              initialQuiz={currentQuiz}
              onSave={handleQuizSave}
              onPreview={handleQuizPreview}
            />
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowQuizBuilder(false);
                  setCurrentQuiz(null);
                  setSelectedLesson(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      {showQuizPreview && currentQuiz && (
        <QuizPreview
          quiz={currentQuiz}
          onClose={() => setShowQuizPreview(false)}
          onEdit={() => {
            setShowQuizPreview(false);
            setShowQuizBuilder(true);
          }}
        />
      )}

      {/* Video Link Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Video Link</h3>
              <p className="text-gray-600 mt-1">Add a YouTube video or upload your own video file</p>
            </div>
            
            <div className="p-6">
              {(() => {
                const module = course.modules.find(m => m.id === editingLesson.moduleId);
                const lesson = module?.lessons.find(l => l.id === editingLesson.lessonId);
                
                return (
                  <div className="space-y-6">
                    {/* YouTube URL Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Video URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Youtube className="h-5 w-5 text-red-500" />
                        </div>
                        <input
                          type="url"
                          value={lesson?.youtubeUrl || ''}
                          onChange={(e) => {
                            if (editingLesson) {
                              updateLesson(editingLesson.moduleId, editingLesson.lessonId, { 
                                youtubeUrl: e.target.value,
                                videoUrl: '' // Clear regular video URL when YouTube URL is set
                              });
                            }
                          }}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Paste a YouTube video URL (supports youtube.com/watch, youtu.be, and youtube.com/embed formats)
                      </p>
                    </div>

                    {/* YouTube Preview */}
                    {lesson?.youtubeUrl && extractYouTubeVideoId(lesson.youtubeUrl) && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">Video Preview</h4>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <img
                            src={getYouTubeThumbnail(extractYouTubeVideoId(lesson.youtubeUrl)!)}
                            alt="YouTube video thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Video ID: {extractYouTubeVideoId(lesson.youtubeUrl)}
                        </p>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or</span>
                      </div>
                    </div>

                    {/* Regular Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video File URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Video className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={lesson?.videoUrl || ''}
                          onChange={(e) => {
                            if (editingLesson) {
                              updateLesson(editingLesson.moduleId, editingLesson.lessonId, { 
                                videoUrl: e.target.value,
                                youtubeUrl: '' // Clear YouTube URL when regular video URL is set
                              });
                            }
                          }}
                          placeholder="https://example.com/video.mp4"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Direct link to video file (MP4, WebM, etc.)
                      </p>
                    </div>

                    {/* Duration Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Duration
                      </label>
                      <input
                        type="text"
                        value={lesson?.duration || ''}
                        onChange={(e) => {
                          if (editingLesson) {
                            updateLesson(editingLesson.moduleId, editingLesson.lessonId, { duration: e.target.value });
                          }
                        }}
                        placeholder="e.g., 15m 30s"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingLesson(null)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Editor Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Article</h3>
              <p className="text-gray-600 mt-1">Create rich text content for your lesson</p>
            </div>
            
            <div className="p-6">
              {(() => {
                const module = course.modules.find(m => m.id === editingArticle.moduleId);
                const lesson = module?.lessons.find(l => l.id === editingArticle.lessonId);
                
                return (
                  <div className="space-y-6">
                    {/* Article Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Title
                      </label>
                      <input
                        type="text"
                        value={lesson?.title || ''}
                        onChange={(e) => {
                          if (editingArticle) {
                            updateLesson(editingArticle.moduleId, editingArticle.lessonId, { title: e.target.value });
                          }
                        }}
                        placeholder="Enter article title"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Article Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Content
                      </label>
                      <textarea
                        value={lesson?.content || ''}
                        onChange={(e) => {
                          if (editingArticle) {
                            updateLesson(editingArticle.moduleId, editingArticle.lessonId, { content: e.target.value });
                          }
                        }}
                        placeholder="Write your article content here..."
                        rows={15}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        You can use markdown formatting for rich text content
                      </p>
                    </div>

                    {/* Reading Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Reading Time
                      </label>
                      <input
                        type="text"
                        value={lesson?.duration || ''}
                        onChange={(e) => {
                          if (editingArticle) {
                            updateLesson(editingArticle.moduleId, editingArticle.lessonId, { duration: e.target.value });
                          }
                        }}
                        placeholder="e.g., 5 min read"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingArticle(null)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Upload Modal */}
      {uploadingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Upload Material</h3>
              <p className="text-gray-600 mt-1">Add downloadable resources for your students</p>
            </div>
            
            <div className="p-6">
              {(() => {
                const module = course.modules.find(m => m.id === uploadingMaterial.moduleId);
                const lesson = module?.lessons.find(l => l.id === uploadingMaterial.lessonId);
                
                return (
                  <div className="space-y-6">
                    {/* Material Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Title
                      </label>
                      <input
                        type="text"
                        value={lesson?.title || ''}
                        onChange={(e) => {
                          if (uploadingMaterial) {
                            updateLesson(uploadingMaterial.moduleId, uploadingMaterial.lessonId, { title: e.target.value });
                          }
                        }}
                        placeholder="Enter material title"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* File Upload Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload File
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PDF, DOC, ZIP, or any file type (Max 50MB)</p>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && uploadingMaterial) {
                              // Simulate file upload
                              const fileUrl = URL.createObjectURL(file);
                              updateLesson(uploadingMaterial.moduleId, uploadingMaterial.lessonId, { 
                                fileUrl: fileUrl,
                                fileName: file.name,
                                fileSize: Math.round(file.size / 1024) + ' KB'
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* File URL Alternative */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or provide a download link</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Download URL
                      </label>
                      <input
                        type="url"
                        value={lesson?.fileUrl || ''}
                        onChange={(e) => {
                          if (uploadingMaterial) {
                            updateLesson(uploadingMaterial.moduleId, uploadingMaterial.lessonId, { fileUrl: e.target.value });
                          }
                        }}
                        placeholder="https://example.com/file.pdf"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* File Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={lesson?.content || ''}
                        onChange={(e) => {
                          if (uploadingMaterial) {
                            updateLesson(uploadingMaterial.moduleId, uploadingMaterial.lessonId, { content: e.target.value });
                          }
                        }}
                        placeholder="Describe what this material contains..."
                        rows={3}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setUploadingMaterial(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setUploadingMaterial(null)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilderPage;