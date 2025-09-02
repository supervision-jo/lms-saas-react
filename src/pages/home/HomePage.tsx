import { useNavigate } from "react-router";
import HeroSection from "../../components/home/HeroSection";
import CategoriesSection from "../../components/home/CategoriesSection";
import FeaturedCoursesSection from "../../components/home/FeaturedCoursesSection";
import StatisticsSection from "../../components/home/StatisticsSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Courses */}
      <FeaturedCoursesSection />

      {/* Stats Section */}
      <StatisticsSection />

      {/* Testimonials */}
      <TestimonialsSection />

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
