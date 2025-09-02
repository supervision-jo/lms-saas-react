import { Filter } from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";

type PriceFilter = "all" | "free" | "paid";

interface Props {
  setSelectedCategory: (v: string) => void;
  setSelectedLevel: (v: string) => void;
  setPriceFilter: (v: PriceFilter) => void;
  setSearchQuery: (v: string) => void;
  selectedCategory: string;
  selectedLevel: string;
  priceFilter: PriceFilter;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  total_courses: number;
}

export default function CoursesFilter({
  setSearchQuery,
  setSelectedCategory,
  setSelectedLevel,
  setPriceFilter,
  selectedCategory,
  selectedLevel,
  priceFilter,
}: Props) {
  const { data } = useCustomQuery(API_ENDPOINTS.categories, ["categories"]);
  const categories: Category[] = data?.data?.data;

  return (
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
            <label key="all" className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                value="all"
                checked={selectedCategory === "all"}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700 flex-1">All</span>
            </label>
            {categories?.map((category) => (
              <label
                key={category.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({category.total_courses})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Level</h4>
          <div className="space-y-2">
            {[
              { id: "all", label: "All Levels" },
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
            ].map((level) => (
              <label
                key={level.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="level"
                  value={level.id}
                  checked={selectedLevel === level.id}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {level.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Price</h4>
          <div className="space-y-2">
            {[
              { id: "all", label: "All Prices" },
              { id: "free", label: "Free" },
              { id: "paid", label: "Paid" },
            ].map((price) => (
              <label
                key={price.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="price"
                  value={price.id}
                  checked={priceFilter === (price.id as PriceFilter)}
                  onChange={(e) =>
                    setPriceFilter(e.target.value as PriceFilter)
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {price.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedCategory("all");
            setSelectedLevel("all");
            setPriceFilter("all");
            setSearchQuery("");
          }}
          className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
