import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  id: string;
  question: string;
  options: AnswerOption[];
  explanation?: string;
  points: number;
  timeLimit?: number;
}

interface QuizPreviewProps {
  quiz: Quiz;
  onClose: () => void;
  onEdit: () => void;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz, onClose, onEdit }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (quiz.timeLimit && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (quiz.timeLimit && timeLeft === 0 && !showResults) {
      setIsTimeUp(true);
      handleSubmit();
    }
  }, [timeLeft, showResults, quiz.timeLimit]);

  const toggleAnswer = (optionId: string) => {
    if (showResults || isTimeUp) return;
    
    const newSelected = new Set(selectedAnswers);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedAnswers(newSelected);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers(new Set());
    setShowResults(false);
    setIsTimeUp(false);
    setTimeLeft(quiz.timeLimit || 0);
  };

  const correctAnswers = quiz.options.filter(option => option.isCorrect);
  const selectedCorrect = Array.from(selectedAnswers).filter(id => 
    quiz.options.find(option => option.id === id)?.isCorrect
  );
  const isCorrect = selectedCorrect.length === correctAnswers.length && 
                   selectedAnswers.size === correctAnswers.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Preview</h2>
              <p className="text-gray-600 mt-1">
                {quiz.points} point{quiz.points !== 1 ? 's' : ''} • {quiz.options.length} option{quiz.options.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {quiz.timeLimit && (
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                timeLeft <= 10 && !showResults ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-semibold">
                  {showResults ? 'Time\'s up!' : formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {quiz.question}
            </h3>
            
            {isTimeUp && !showResults && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">Time's up! Your answers have been submitted automatically.</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {quiz.options.map((option, index) => {
              const isSelected = selectedAnswers.has(option.id);
              const isCorrectOption = option.isCorrect;
              
              let optionClass = 'border-2 transition-all duration-200 cursor-pointer';
              
              if (showResults) {
                if (isCorrectOption) {
                  optionClass += ' border-green-500 bg-green-50';
                } else if (isSelected && !isCorrectOption) {
                  optionClass += ' border-red-500 bg-red-50';
                } else {
                  optionClass += ' border-gray-200 bg-gray-50';
                }
              } else {
                if (isSelected) {
                  optionClass += ' border-purple-500 bg-purple-50';
                } else {
                  optionClass += ' border-gray-200 hover:border-purple-300 hover:bg-purple-25';
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => toggleAnswer(option.id)}
                  className={`p-4 rounded-lg ${optionClass}`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <span className="text-sm font-medium text-gray-500 mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        showResults
                          ? isCorrectOption
                            ? 'border-green-500 bg-green-500'
                            : isSelected
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                          : isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {showResults ? (
                          isCorrectOption ? (
                            <CheckCircle className="w-3 h-3 text-white" />
                          ) : isSelected ? (
                            <XCircle className="w-3 h-3 text-white" />
                          ) : null
                        ) : isSelected ? (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        ) : null}
                      </div>
                    </div>
                    
                    <span className="text-gray-900 flex-1">{option.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results */}
          {showResults && (
            <div className="mb-8">
              <div className={`p-6 rounded-lg border-2 ${
                isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <div className="flex items-center mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mr-3" />
                  )}
                  <h4 className={`text-lg font-semibold ${
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                </div>
                
                <p className={`mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  You scored {isCorrect ? quiz.points : 0} out of {quiz.points} points.
                </p>
                
                <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  Correct answer{correctAnswers.length !== 1 ? 's' : ''}: {correctAnswers.map(option => option.text).join(', ')}
                </p>
              </div>
              
              {quiz.explanation && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Explanation:</h5>
                  <p className="text-blue-800">{quiz.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                Edit Quiz
              </button>
            </div>
            
            <div className="flex space-x-3">
              {showResults && (
                <button
                  onClick={handleReset}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              
              {!showResults && selectedAnswers.size > 0 && (
                <button
                  onClick={handleSubmit}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  Submit Answer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;