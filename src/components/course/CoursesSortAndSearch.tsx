import { Grid, List, Search } from "lucide-react";

type SortKey =
  | "most_popular"
  | "high_rating"
  | "newest"
  | "price_low_to_high"
  | "price_high_to_low";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortKey;
  setSortBy: (v: SortKey) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}

export default function CoursesSortAndSearch({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: Props) {
  return (
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
        onChange={(e) => setSortBy(e.target.value as SortKey)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="most_popular">Most Popular</option>
        <option value="high_rating">Highest Rated</option>
        <option value="newest">Newest</option>
        <option value="price_low_to_high">Price: Low to High</option>
        <option value="price_high_to_low">Price: High to Low</option>
      </select>

      {/* View Mode */}
      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 ${
            viewMode === "grid"
              ? "bg-purple-50 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 ${
            viewMode === "list"
              ? "bg-purple-50 text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}