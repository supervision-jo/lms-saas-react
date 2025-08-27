import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface CourseFiltersProps {
  categories: FilterOption[];
  levels: FilterOption[];
  durations: FilterOption[];
  ratings: FilterOption[];
  selectedFilters: {
    category?: string;
    level?: string;
    duration?: string;
    rating?: string;
    priceRange?: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onClearFilters: () => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  categories,
  levels,
  durations,
  ratings,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedFilters.category === category.id}
                  onChange={(e) => onFilterChange('category', e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">{category.label}</span>
                {category.count && (
                  <span className="text-xs text-gray-500">({category.count})</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Level</h4>
          <div className="space-y-2">
            {levels.map((level) => (
              <label key={level.id} className="flex items-center">
                <input
                  type="radio"
                  name="level"
                  value={level.id}
                  checked={selectedFilters.level === level.id}
                  onChange={(e) => onFilterChange('level', e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">{level.label}</span>
                {level.count && (
                  <span className="text-xs text-gray-500">({level.count})</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Duration</h4>
          <div className="space-y-2">
            {durations.map((duration) => (
              <label key={duration.id} className="flex items-center">
                <input
                  type="radio"
                  name="duration"
                  value={duration.id}
                  checked={selectedFilters.duration === duration.id}
                  onChange={(e) => onFilterChange('duration', e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">{duration.label}</span>
                {duration.count && (
                  <span className="text-xs text-gray-500">({duration.count})</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label key={rating.id} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating.id}
                  checked={selectedFilters.rating === rating.id}
                  onChange={(e) => onFilterChange('rating', e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">{rating.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="free"
                checked={selectedFilters.priceRange === 'free'}
                onChange={(e) => onFilterChange('priceRange', e.target.value)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="price"
                value="paid"
                checked={selectedFilters.priceRange === 'paid'}
                onChange={(e) => onFilterChange('priceRange', e.target.value)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">Paid</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;