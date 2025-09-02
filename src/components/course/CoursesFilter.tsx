import { Filter } from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
// import { categories } from "../../types/categories";

interface Props {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedLevel: React.Dispatch<React.SetStateAction<string>>;
  // setIsPaid: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPrice: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  selectedLevel: string;
  // isPaid: boolean;
  selectedPrice: string;
}

interface category {
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
  setSelectedPrice,
  setSelectedLevel,
  // setIsPaid,
  selectedCategory,
  selectedLevel,
  // isPaid,
  selectedPrice,
}: Props) {
  const { data: categories } = useCustomQuery("/api/course/categories/", [
    "categories",
  ]);

  const categoriesData: category[] = categories?.data?.data;
  console.log("categories", categoriesData);
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
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                value={""}
                checked={selectedCategory === ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700 flex-1">
                All Categories
              </span>
              <span className="text-xs text-gray-500">
                {/* ({category?.total_courses}) */}
              </span>
            </label>
            {categoriesData?.map((category) => (
              <label
                key={category?.id}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  value={category?.id}
                  checked={selectedCategory === category.id}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">
                  {category?.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({category?.total_courses})
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
              { id: "", label: "All Levels" },
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
              { id: "", label: "All Prices" },
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
                  checked={selectedPrice === price.id}
                  onChange={(e) => {
                    setSelectedPrice(e.target.value);
                  }}
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
            setSelectedCategory("");
            setSelectedLevel("");
            setSelectedPrice("");
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
