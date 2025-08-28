import React, { useState } from "react";
import {
  Play,
  Star,
  Users,
  Clock,
  TrendingUp,
  BookOpen,
  Award,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses] = useState([
    {
      id: "1",
      title: "Complete React Developer Course",
      instructor: "John Doe",
      thumbnail:
        "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: 84.99,
      originalPrice: 199.99,
      rating: 4.7,
      reviewCount: 12560,
      duration: "52 hours",
      studentCount: 89432,
      level: "Intermediate",
      isBestseller: true,
    },
    {
      id: "2",
      title: "Python for Data Science",
      instructor: "Jane Smith",
      thumbnail:
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: 74.99,
      originalPrice: 149.99,
      rating: 4.6,
      reviewCount: 9874,
      duration: "25 hours",
      studentCount: 67543,
      level: "Beginner",
      isBestseller: true,
    },
    {
      id: "3",
      title: "Full Stack Web Development",
      instructor: "Mike Johnson",
      thumbnail:
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: 94.99,
      rating: 4.8,
      reviewCount: 15432,
      duration: "63 hours",
      studentCount: 123456,
      level: "All Levels",
    },
  ]);

  const categories = [
    {
      name: "Web Development",
      icon: "💻",
      courses: 2847,
      color: "bg-blue-500",
    },
    { name: "Data Science", icon: "📊", courses: 1923, color: "bg-green-500" },
    {
      name: "Mobile Development",
      icon: "📱",
      courses: 1456,
      color: "bg-purple-500",
    },
    { name: "Design", icon: "🎨", courses: 1789, color: "bg-pink-500" },
    { name: "Business", icon: "💼", courses: 1234, color: "bg-orange-500" },
    { name: "Marketing", icon: "📈", courses: 987, color: "bg-red-500" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
      quote:
        "The courses here transformed my career. The quality of instruction is exceptional.",
    },
    {
      name: "Michael Chen",
      role: "Data Scientist at Microsoft",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      quote:
        "I went from beginner to landing my dream job in just 6 months of learning.",
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer at Apple",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
      quote:
        "The practical projects and real-world applications made all the difference.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Learn
                  <span className="block text-yellow-400">Without</span>
                  <span className="block">Limits</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200 max-w-lg">
                  Master new skills with expert-led courses. Join millions of
                  learners worldwide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/catalog")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Learning Today
                </button>
                <button
                  onClick={() => navigate("/catalog")}
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                >
                  Explore Courses
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">50M+</div>
                  <div className="text-gray-300">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">190K+</div>
                  <div className="text-gray-300">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">70+</div>
                  <div className="text-gray-300">Languages</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Featured Course</h3>
                      <p className="text-gray-300">
                        Complete React Developer Course
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Progress</span>
                      <span className="text-white font-semibold">68%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>12 of 18 lessons completed</span>
                    <span>6h 32m remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Top Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover courses in the most in-demand skills and advance your
              career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.name}
                onClick={() => navigate("/catalog")}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${category.color} rounded-full opacity-10 transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}
                ></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.courses.toLocaleString()} courses
                  </p>
                  <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                    <span>Explore courses</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked courses by our experts to help you learn the most
              in-demand skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate("/course")}
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.isBestseller && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full">
                        Bestseller
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/course");
                        }}
                        className="w-full bg-white text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Preview Course
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {course.instructor}
                  </p>

                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 font-bold mr-1">
                        {course.rating}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(course.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm ml-2">
                        ({course.reviewCount.toLocaleString()})
                      </span>
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
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ${course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold">190K+</div>
              <div className="text-purple-100">Online Courses</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold">50M+</div>
              <div className="text-purple-100">Registered Students</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold">100K+</div>
              <div className="text-purple-100">Certificates Issued</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold">98%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful learners who transformed their
              careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of learners worldwide and unlock your potential with
            our expert-led courses
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate("/catalog")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
