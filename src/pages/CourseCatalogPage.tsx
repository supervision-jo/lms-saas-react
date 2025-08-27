import React, { useState } from 'react';
import { Search, Filter, Grid, List, Star, Clock, Users, BookOpen, TrendingUp, Award, Play } from 'lucide-react';

interface CourseCatalogPageProps {
  onNavigate: (page: string) => void;
}

const CourseCatalogPage: React.FC<CourseCatalogPageProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('most-popular');

  const categories = [
    { id: 'all', name: 'All Categories', count: 15420 },
    { id: 'development', name: 'Development', count: 4250 },
    { id: 'business', name: 'Business', count: 3180 },
    { id: 'design', name: 'Design', count: 2890 },
    { id: 'marketing', name: 'Marketing', count: 2340 },
    { id: 'data-science', name: 'Data Science', count: 1980 },
    { id: 'photography', name: 'Photography', count: 780 },
  ];

  const courses = [
    {
      id: '1',
      title: 'Complete React Developer Course with Redux, Hooks, and GraphQL',
      instructor: 'John Doe',
      instructorImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 84.99,
      originalPrice: 199.99,
      rating: 4.7,
      reviewCount: 12560,
      duration: '52 hours',
      studentCount: 89432,
      level: 'Intermediate',
      category: 'development',
      isBestseller: true,
      description: 'Master React development with hands-on projects and real-world applications. Learn Redux, Hooks, Context API, and GraphQL.',
      lastUpdated: '2/2024',
      language: 'English',
      whatYouLearn: [
        'Build modern React applications',
        'Master Redux for state management',
        'Implement GraphQL with Apollo',
        'Deploy to production'
      ]
    },
    {
      id: '2',
      title: 'Python for Data Science and Machine Learning Bootcamp',
      instructor: 'Jane Smith',
      instructorImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 74.99,
      originalPrice: 149.99,
      rating: 4.6,
      reviewCount: 9874,
      duration: '25 hours',
      studentCount: 67543,
      level: 'Beginner',
      category: 'data-science',
      isBestseller: true,
      description: 'Learn Python programming and dive into data science and machine learning with hands-on projects.',
      lastUpdated: '1/2024',
      language: 'English',
      whatYouLearn: [
        'Python programming fundamentals',
        'Data analysis with Pandas',
        'Machine learning algorithms',
        'Data visualization'
      ]
    },
    {
      id: '3',
      title: 'The Complete Web Developer Bootcamp 2024',
      instructor: 'Mike Johnson',
      instructorImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 94.99,
      rating: 4.8,
      reviewCount: 15432,
      duration: '63 hours',
      studentCount: 123456,
      level: 'All Levels',
      category: 'development',
      description: 'Become a full-stack web developer with HTML, CSS, JavaScript, Node.js, React, and MongoDB.',
      lastUpdated: '3/2024',
      language: 'English',
      whatYouLearn: [
        'Full-stack web development',
        'Modern JavaScript ES6+',
        'React and Node.js',
        'Database design'
      ]
    },
    {
      id: '4',
      title: 'Digital Marketing Masterclass 2024',
      instructor: 'Sarah Wilson',
      instructorImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 59.99,
      originalPrice: 129.99,
      rating: 4.5,
      reviewCount: 8765,
      duration: '28 hours',
      studentCount: 45678,
      level: 'Beginner',
      category: 'marketing',
      description: 'Master digital marketing with SEO, social media, Google Ads, and analytics.',
      lastUpdated: '2/2024',
      language: 'English',
      whatYouLearn: [
        'SEO optimization',
        'Social media marketing',
        'Google Ads campaigns',
        'Analytics and reporting'
      ]
    },
    {
      id: '5',
      title: 'UI/UX Design Complete Course',
      instructor: 'Alex Brown',
      instructorImage: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 79.99,
      rating: 4.4,
      reviewCount: 6543,
      duration: '42 hours',
      studentCount: 34567,
      level: 'Intermediate',
      category: 'design',
      description: 'Learn UI/UX design principles, Figma, user research, and create stunning interfaces.',
      lastUpdated: '1/2024',
      language: 'English',
      whatYouLearn: [
        'Design thinking process',
        'Figma and prototyping',
        'User research methods',
        'Interface design'
      ]
    },
    {
      id: '6',
      title: 'Business Strategy and Leadership',
      instructor: 'Emma Davis',
      instructorImage: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
      thumbnail: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 89.99,
      originalPrice: 179.99,
      rating: 4.3,
      reviewCount: 4321,
      duration: '35 hours',
      studentCount: 23456,
      level: 'Advanced',
      category: 'business',
      description: 'Develop strategic thinking and leadership skills for business success.',
      lastUpdated: '3/2024',
      language: 'English',
      whatYouLearn: [
        'Strategic planning',
        'Leadership principles',
        'Team management',
        'Business analysis'
      ]
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level.toLowerCase().replace(' ', '-') === selectedLevel;
    const matchesPrice = selectedPrice === 'all' || 
                        (selectedPrice === 'free' && course.price === 0) ||
                        (selectedPrice === 'paid' && course.price > 0);
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  const CourseCard = ({ course, isListView = false, onNavigate }: { course: any, isListView?: boolean, onNavigate: (page: string) => void }) => (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer ${isListView ? 'flex items-start' : ''}`}
      onClick={() => onNavigate('course')}
    >
      <div className={`relative ${isListView ? 'w-80 flex-shrink-0' : ''}`}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isListView ? 'w-full h-48' : 'w-full h-48'}`}
        />
        {course.isBestseller && (
          <div className="absolute top-4 left-4">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full">
              Bestseller
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('course');
            }}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>
      </div>
      
      <div className={`p-6 ${isListView ? 'flex-1' : ''}`}>
        <div className={`${isListView ? 'flex justify-between' : ''}`}>
          <div className={`${isListView ? 'flex-1 pr-6' : ''}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 cursor-pointer transition-colors">
              {course.title}
            </h3>
            
            <div className="flex items-center mb-3">
              <img
                src={course.instructorImage}
                alt={course.instructor}
                className="w-6 h-6 rounded-full mr-2"
              />
              <p className="text-gray-600 text-sm">{course.instructor}</p>
            </div>
            
            {isListView && (
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{course.description}</p>
            )}
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <span className="text-yellow-500 font-bold mr-1">{course.rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(course.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-2">({course.reviewCount.toLocaleString()})</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.studentCount.toLocaleString()}</span>
              </div>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{course.level}</span>
            </div>
            
            {isListView && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">What you'll learn:</h4>
                <ul className="space-y-1">
                  {course.whatYouLearn.slice(0, 3).map((item: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className={`${isListView ? 'text-right' : 'flex items-center justify-between'}`}>
            <div className={`${isListView ? 'mb-4' : 'flex items-center'}`}>
              <span className="text-2xl font-bold text-gray-900">${course.price}</span>
              {course.originalPrice && (
                <span className="text-gray-500 line-through ml-2">${course.originalPrice}</span>
              )}
            </div>
            {isListView && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('course');
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-1">{filteredCourses.length.toLocaleString()} courses available</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="most-popular">Most Popular</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
              
              {/* View Mode */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700 flex-1">{category.name}</span>
                      <span className="text-xs text-gray-500">({category.count})</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Level */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Level</h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Levels' },
                    { id: 'beginner', label: 'Beginner' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced' },
                  ].map((level) => (
                    <label key={level.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level.id}
                        checked={selectedLevel === level.id}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price</h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'free', label: 'Free' },
                    { id: 'paid', label: 'Paid' },
                  ].map((price) => (
                    <label key={price.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={price.id}
                        checked={selectedPrice === price.id}
                        onChange={(e) => setSelectedPrice(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">{price.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSelectedPrice('all');
                  setSearchQuery('');
                }}
                className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isListView={viewMode === 'list'}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <div className="mt-12 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">2</button>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">3</button>
                  <span className="px-4 py-2 text-gray-500">...</span>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">10</button>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900">
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalogPage;