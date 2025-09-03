import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

interface CourseRatingProps {
  courseId: string;
  currentRating?: number;
  totalRatings?: number;
  userRating?: number;
  onRatingSubmit?: (rating: number, review?: string) => void;
}

const CourseRating: React.FC<CourseRatingProps> = ({
  courseId,
  currentRating = 0,
  totalRatings = 0,
  userRating,
  onRatingSubmit,
}) => {
  const [selectedRating, setSelectedRating] = useState(userRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setShowReviewForm(true);
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0) return;

    setIsSubmitting(true);
    
    try {
      if (onRatingSubmit) {
        await onRatingSubmit(selectedRating, reviewText);
      }
      setShowReviewForm(false);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || selectedRating;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate this Course</h3>
      
      {/* Current Course Rating Display */}
      {currentRating > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(currentRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {currentRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* User Rating Section */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {userRating ? 'Your Rating:' : 'Rate this course:'}
          </p>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-colors duration-150"
              >
                <Star
                  className={`w-8 h-8 cursor-pointer transition-colors duration-150 ${
                    star <= displayRating
                      ? 'text-yellow-400 fill-current hover:text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {displayRating === 1 && 'Poor'}
              {displayRating === 2 && 'Fair'}
              {displayRating === 3 && 'Good'}
              {displayRating === 4 && 'Very Good'}
              {displayRating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a review (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this course..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0 || isSubmitting}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedRating(userRating || 0);
                  setReviewText('');
                }}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Helpful Actions */}
        {!showReviewForm && userRating && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Was this course helpful?</p>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Yes</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">No</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Add Comment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRating;