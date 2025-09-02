import { BookOpen } from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
import CourseCard from "../../components/course/CourseCard";
import CoursesSortAndSearch from "../../components/course/CoursesSortAndSearch";
import CoursesFilter from "../../components/course/CoursesFilter";
import { API_ENDPOINTS } from "../../utils/constants";
import { useSearchParams } from "react-router";
import Pagination from "../../components/reusable-components/Pagination";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import CourseCardsSkeleton from "../../components/resource-stats/CourseLoading";

type ViewMode = "grid" | "list";
type PriceFilter = "all" | "free" | "paid";
type SortKey =
  | "most_popular"
  | "high_rating"
  | "newest"
  | "price_low_to_high"
  | "price_high_to_low";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 6;

const CourseCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") ?? "";
  const selectedCategory = searchParams.get("sub_category") ?? "all";
  const selectedLevel = searchParams.get("level") ?? "all";
  const priceFilter = (searchParams.get("price") ?? "all") as PriceFilter;
  const sortBy = (searchParams.get("sort") ?? "most_popular") as SortKey;
  const viewMode = (searchParams.get("view") ?? "grid") as ViewMode;
  const page = parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10);
  const pageSize = parseInt(
    searchParams.get("page_size") ?? String(DEFAULT_PAGE_SIZE),
    10
  );

  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };
  const setPage = (p: number) =>
    updateParam("page", p > 1 ? String(p) : undefined);
  // const setPageSize = (ps: number) => {
  //   const next = new URLSearchParams(searchParams);
  //   next.set("page_size", String(ps));
  //   next.delete("page"); // reset to 1 when size changes
  //   setSearchParams(next, { replace: true });
  // };
  const setSearchQuery = (v: string) => updateParam("search", v || undefined);
  const setSelectedCategory = (v: string) =>
    updateParam("sub_category", v === "all" ? undefined : v);
  const setSelectedLevel = (v: string) =>
    updateParam("level", v === "all" ? undefined : v);
  const setPriceFilter = (v: PriceFilter) =>
    updateParam("price", v === "all" ? undefined : v);
  const setSortBy = (v: SortKey) =>
    updateParam("sort", v === "most_popular" ? undefined : v);
  const setViewMode = (v: ViewMode) =>
    updateParam("view", v === "grid" ? undefined : v);

  const backendQueryParams = new URLSearchParams();
  if (searchQuery) backendQueryParams.set("search", searchQuery);
  if (selectedCategory !== "all")
    backendQueryParams.set("sub_category", selectedCategory);
  if (selectedLevel !== "all") backendQueryParams.set("level", selectedLevel);

  // price mapping (only send one)
  if (priceFilter === "free") backendQueryParams.set("is_free", "true");
  if (priceFilter === "paid") backendQueryParams.set("is_paid", "true");

  // sort mapping to your boolean switches
  backendQueryParams.set("most_popular", String(sortBy === "most_popular"));
  backendQueryParams.set("high_rating", String(sortBy === "high_rating"));
  backendQueryParams.set(
    "price_low_to_high",
    String(sortBy === "price_low_to_high")
  );
  backendQueryParams.set(
    "price_high_to_low",
    String(sortBy === "price_high_to_low")
  );
  backendQueryParams.set("newest", String(sortBy === "newest"));
  backendQueryParams.set("page", String(page));
  backendQueryParams.set("page_size", String(pageSize));

  // ---- GET COURSES (invalidate/refetch on URL changes)
  const { data, isLoading } = useCustomQuery(
    `${API_ENDPOINTS.courses}?${backendQueryParams.toString()}`,
    ["courses", backendQueryParams.toString()]
  );

  const courses: Course[] = data?.data ?? [];
  const totalCount: number = data?.count ?? 0;

  // const PageSizeSelect = (
  //   <select
  //     value={pageSize}
  //     onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
  //     className="ml-3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  //   >
  //     {[6, 12, 18, 24].map((n) => (
  //       <option key={n} value={n}>
  //         {n} / page
  //       </option>
  //     ))}
  //   </select>
  // );

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    next.delete("page");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-1">
                {courses?.length ?? 0} courses available
              </p>
            </div>

            <CoursesSortAndSearch
              searchQuery={searchInput}
              setSearchQuery={setSearchInput}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
            {/* {PageSizeSelect} */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <CoursesFilter
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            priceFilter={priceFilter}
            setSearchQuery={setSearchQuery}
            setSelectedCategory={setSelectedCategory}
            setSelectedPrice={setSelectedPrice}
            setSelectedLevel={setSelectedLevel}
            setPriceFilter={setPriceFilter}
          />

          {/* Course Grid */}
          <div className="flex-1">
            {isLoading ? (
              <CourseCardsSkeleton count={6} isListView={viewMode === "list"} />
            ) : !courses || courses.length === 0 ? (
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
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    courseId={course.id}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            )}

            {!isLoading && totalCount > 0 && (
              <Pagination
                total={totalCount}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalogPage;
