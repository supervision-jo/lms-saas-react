import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
import CourseCard from "../../components/course/CourseCard";
import CoursesSortAndSearch from "../../components/course/CoursesSortAndSearch";
import CoursesFilter from "../../components/course/CoursesFilter";

const CourseCatalogPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [priceFilter
    // ,setPriceFilter
  ] = useState("all");
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState("most-popular");

  // const queryParams = new URLSearchParams();
  // queryParams.set("search", searchQuery);
  // queryParams.set("sub_category", selectedCategory);
  // queryParams.set("level", selectedLevel);
  // queryParams.set("is_free", isFree.toString());
  // queryParams.set("high_rating", sortBy);
  // queryParams.set("most_popular", sortBy);
  // queryParams.set("price_low_to_high", sortBy);
  // queryParams.set("price_high_to_low", sortBy);

  // GET COURSES
  const { data: courses } = useCustomQuery(`/api/course/courses/`, ["courses"]);

  const coursesData: Course[] = courses?.data;
  console.log("Courses data:", coursesData);
  // const filteredCourses = coursesData.filter((course) => {
  //   const matchesSearch =
  //     course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === "all" || course.category === selectedCategory;
  //   const matchesLevel =
  //     selectedLevel === "all" ||
  //     course.level.toLowerCase().replace(" ", "-") === selectedLevel;
  //   const matchesPrice = "";
  //   // selectedPrice === "all" ||
  //   // (selectedPrice === "free" && course.price === 0) ||
  //   // (selectedPrice === "paid" && course.price > 0);

  //   return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  // });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-1">
                {coursesData?.length} courses available
              </p>
            </div>

            <CoursesSortAndSearch
              searchQuery={searchQuery}
              sortBy={sortBy}
              viewMode={viewMode}
              setSearchQuery={setSearchQuery}
              setSortBy={setSortBy}
              setViewMode={setViewMode}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}

          <CoursesFilter
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            isPaid={isPaid}
            priceFilter={priceFilter}
            setSearchQuery={setSearchQuery}
            setSelectedCategory={setSelectedCategory}
            setSelectedLevel={setSelectedLevel}
            setIsPaid={setIsPaid}
          />

          {/* Course Grid */}
          <div className="flex-1">
            {coursesData?.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {coursesData?.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {coursesData?.length > 0 && (
              <div className="mt-12 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    2
                  </button>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    3
                  </button>
                  <span className="px-4 py-2 text-gray-500">...</span>
                  <button className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    10
                  </button>
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
