import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  options: AnswerOption[];
  explanation?: string;
  points: number;
  timeLimit?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  totalPoints: number;
  totalTimeLimit?: number;
}

interface QuizPreviewProps {
  quiz: Quiz;
  onClose: () => void;
  onEdit: () => void;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz, onClose, onEdit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: Set<string> }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.totalTimeLimit || 0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<{ [questionId: string]: number }>({});

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    if (quiz.totalTimeLimit && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (quiz.totalTimeLimit && timeLeft === 0 && !showResults) {
      setIsTimeUp(true);
      handleSubmit();
    }
  }, [timeLeft, showResults, quiz.totalTimeLimit]);

  useEffect(() => {
    // Track time spent on each question
    if (currentQuestion && !questionStartTime[currentQuestion.id]) {
      setQuestionStartTime(prev => ({
        ...prev,
        [currentQuestion.id]: Date.now()
      }));
    }
  }, [currentQuestion, questionStartTime]);

  const toggleAnswer = (questionId: string, optionId: string) => {
    if (showResults || isTimeUp) return;
    
    const currentAnswers = selectedAnswers[questionId] || new Set();
    const newAnswers = new Set(currentAnswers);
    
    if (newAnswers.has(optionId)) {
      newAnswers.delete(optionId);
    } else {
      newAnswers.add(optionId);
    }
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: newAnswers
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setIsTimeUp(false);
    setTimeLeft(quiz.totalTimeLimit || 0);
    setCurrentQuestionIndex(0);
    setQuestionStartTime({});
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const questionResults: { [questionId: string]: boolean } = {};

    quiz.questions.forEach(question => {
      maxScore += question.points;
      const userAnswers = selectedAnswers[question.id] || new Set();
      const correctAnswers = question.options.filter(option => option.isCorrect);
      const selectedCorrect = Array.from(userAnswers).filter(id => 
        question.options.find(option => option.id === id)?.isCorrect
      );
      
      const isCorrect = selectedCorrect.length === correctAnswers.length && 
                       userAnswers.size === correctAnswers.length;
      
      if (isCorrect) {
        totalScore += question.points;
        questionResults[question.id] = true;
      } else {
        questionResults[question.id] = false;
      }
    });

    return { totalScore, maxScore, questionResults };
  };

  const { totalScore, maxScore, questionResults } = showResults ? calculateResults() : { totalScore: 0, maxScore: 0, questionResults: {} };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    const hasAnswers = selectedAnswers[question.id] && selectedAnswers[question.id].size > 0;
    
    if (showResults) {
      return questionResults[question.id] ? 'correct' : 'incorrect';
    }
    
    if (questionIndex === currentQuestionIndex) {
      return 'current';
    }
    
    return hasAnswers ? 'answered' : 'unanswered';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} • {maxScore} total point{maxScore !== 1 ? 's' : ''}
              </p>
            </div>
            
            {quiz.totalTimeLimit && (
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                timeLeft <= 60 && !showResults ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-semibold">
                  {showResults ? 'Completed' : formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex">
          {/* Question Navigation Sidebar */}
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="space-y-2">
              {quiz.questions.map((question, index) => {
                const status = getQuestionStatus(index);
                let statusClass = 'bg-white border-gray-200 text-gray-700';
                
                if (status === 'current') {
                  statusClass = 'bg-purple-100 border-purple-300 text-purple-700';
                } else if (status === 'answered') {
                  statusClass = 'bg-blue-100 border-blue-300 text-blue-700';
                } else if (status === 'correct') {
                  statusClass = 'bg-green-100 border-green-300 text-green-700';
                } else if (status === 'incorrect') {
                  statusClass = 'bg-red-100 border-red-300 text-red-700';
                }

                return (
                  <button
                    key={question.id}
                    onClick={() => !showResults && goToQuestion(index)}
                    disabled={showResults}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${statusClass} ${
                      showResults ? 'cursor-default' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Q{index + 1}</span>
                      <div className="flex items-center">
                        {status === 'correct' && <CheckCircle className="w-4 h-4" />}
                        {status === 'incorrect' && <XCircle className="w-4 h-4" />}
                        {status === 'answered' && !showResults && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResults && (
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Final Score</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {totalScore}/{maxScore}
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round((totalScore / maxScore) * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {!showResults ? (
              <>
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <p className="text-lg text-gray-900">{currentQuestion.question}</p>
                  </div>
                  
                  {isTimeUp && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium">Time's up! Your answers have been submitted automatically.</p>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestion.id]?.has(option.id) || false;
                    
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleAnswer(currentQuestion.id, option.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            <span className="text-sm font-medium text-gray-500 mr-3">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <span className="text-gray-900 flex-1">{option.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      currentQuestionIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-3">
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        Submit Quiz
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    ) : (
                      <button
                        onClick={() => goToQuestion(currentQuestionIndex + 1)}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Results View */
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Complete!</h3>
                  <div className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold ${
                    totalScore === maxScore
                      ? 'bg-green-100 text-green-800'
                      : totalScore >= maxScore * 0.7
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Final Score: {totalScore}/{maxScore} ({Math.round((totalScore / maxScore) * 100)}%)
                  </div>
                </div>

                {/* Question Review */}
                <div className="space-y-6">
                  {quiz.questions.map((question, questionIndex) => {
                    const userAnswers = selectedAnswers[question.id] || new Set();
                    const isQuestionCorrect = questionResults[question.id];
                    
                    return (
                      <div key={question.id} className={`border-2 rounded-lg p-6 ${
                        isQuestionCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Question {questionIndex + 1}: {question.question}
                          </h4>
                          <div className="flex items-center">
                            {isQuestionCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className={`font-semibold ${
                              isQuestionCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {isQuestionCorrect ? question.points : 0}/{question.points} pts
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = userAnswers.has(option.id);
                            const isCorrect = option.isCorrect;
                            
                            let optionClass = 'border-gray-200 bg-white';
                            if (isCorrect) {
                              optionClass = 'border-green-500 bg-green-100';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'border-red-500 bg-red-100';
                            }
                            
                            return (
                              <div key={option.id} className={`p-3 rounded border-2 ${optionClass}`}>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-500 mr-3">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span className="flex-1">{option.text}</span>
                                  <div className="flex items-center space-x-2">
                                    {isSelected && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Your answer
                                      </span>
                                    )}
                                    {isCorrect && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <h5 className="font-semibold text-blue-900 mb-1">Explanation:</h5>
                            <p className="text-blue-800 text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
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
            
            {showResults && (
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;