import React from "react";
import { Star, Clock, Users, Award } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  duration: string;
  studentCount: number;
  level: string;
  isBestseller?: boolean;
  description: string;
  onEnroll: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  thumbnail,
  price,
  originalPrice,
  rating,
  reviewCount,
  duration,
  studentCount,
  level,
  isBestseller,
  description,
  onEnroll,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
        {isBestseller && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 text-xs font-bold rounded">
              Bestseller
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => onEnroll(id)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 cursor-pointer transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-2">{instructor}</p>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold mr-1">{rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-2">
              ({reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{studentCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1" />
            <span>{level}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">${price}</span>
            {originalPrice && (
              <span className="text-gray-500 line-through ml-2">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
