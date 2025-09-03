import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  Save,
  Eye,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
  initialQuiz?: Quiz;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({
  onSave,
  onPreview,
  initialQuiz,
}) => {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz || {
      id: Date.now().toString(),
      title: "",
      description: "",
      questions: [
        {
          id: Date.now().toString(),
          question: "",
          options: [
            { id: "1", text: "", isCorrect: false },
            { id: "2", text: "", isCorrect: false },
          ],
          explanation: "",
          points: 1,
          timeLimit: undefined,
        },
      ],
      totalPoints: 1,
      totalTimeLimit: undefined,
    }
  );

  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set([quiz.questions[0]?.id])
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: [
        { id: Date.now().toString() + "_1", text: "", isCorrect: false },
        { id: Date.now().toString() + "_2", text: "", isCorrect: false },
      ],
      explanation: "",
      points: 1,
      timeLimit: undefined,
    };

    const updatedQuiz = {
      ...quiz,
      questions: [...quiz.questions, newQuestion],
      totalPoints: quiz.totalPoints + 1,
    };

    setQuiz(updatedQuiz);
    setExpandedQuestions(new Set([...expandedQuestions, newQuestion.id]));
  };

  const removeQuestion = (questionId: string) => {
    if (quiz.questions.length <= 1) {
      alert("A quiz must have at least 1 question");
      return;
    }

    const questionToRemove = quiz.questions.find((q) => q.id === questionId);
    const updatedQuiz = {
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== questionId),
      totalPoints: quiz.totalPoints - (questionToRemove?.points || 0),
    };

    setQuiz(updatedQuiz);

    const newExpanded = new Set(expandedQuestions);
    newExpanded.delete(questionId);
    setExpandedQuestions(newExpanded);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedQuestions = quiz.questions.map((q) => {
      if (q.id === questionId) {
        const updatedQuestion = { ...q, ...updates };
        return updatedQuestion;
      }
      return q;
    });

    // Recalculate total points
    const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);

    setQuiz({
      ...quiz,
      questions: updatedQuestions,
      totalPoints,
    });
  };

  const addOption = (questionId: string) => {
    const newOption: AnswerOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };

    updateQuestion(questionId, {
      options: [
        ...(quiz.questions.find((q) => q.id === questionId)?.options || []),
        newOption,
      ],
    });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question || question.options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }

    updateQuestion(questionId, {
      options: question.options.filter((option) => option.id !== optionId),
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, text } : option
      ),
    });
  };

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options.map((option) =>
        option.id === optionId
          ? { ...option, isCorrect: !option.isCorrect }
          : option
      ),
    });
  };

  const toggleQuestionExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const validateQuiz = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!quiz.title.trim()) {
      newErrors.title = "Quiz title is required";
    }

    quiz.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${question.id}`] = `Question ${
          index + 1
        } text is required`;
      }

      if (question.options.some((option) => !option.text.trim())) {
        newErrors[`options_${question.id}`] = `All options in question ${
          index + 1
        } must have text`;
      }

      if (!question.options.some((option) => option.isCorrect)) {
        newErrors[`correct_${question.id}`] = `Question ${
          index + 1
        } must have at least one correct answer`;
      }

      if (question.points < 1) {
        newErrors[`points_${question.id}`] = `Question ${
          index + 1
        } points must be at least 1`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateQuiz()) {
      onSave(quiz);
    }
  };

  const handlePreview = () => {
    if (validateQuiz()) {
      onPreview(quiz);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Builder</h2>
        <p className="text-gray-600">
          Create engaging quizzes with multiple questions and answer options
        </p>
      </div>

      <div className="space-y-8">
        {/* Quiz Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quiz Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                placeholder="Enter quiz title"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={quiz.totalTimeLimit || ""}
                onChange={(e) =>
                  setQuiz({
                    ...quiz,
                    totalTimeLimit: e.target.value
                      ? parseInt(e.target.value) * 60
                      : undefined,
                  })
                }
                placeholder="Optional"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={quiz.description || ""}
              onChange={(e) =>
                setQuiz({ ...quiz, description: e.target.value })
              }
              placeholder="Brief description of the quiz"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Questions ({quiz.questions.length})
            </h3>
            <button
              onClick={addQuestion}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, questionIndex) => {
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Question Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleQuestionExpanded(question.id)}
                        className="flex items-center space-x-3 flex-1 text-left"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Question {questionIndex + 1}
                            {question.question &&
                              `: ${question.question.substring(0, 50)}${
                                question.question.length > 50 ? "..." : ""
                              }`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {question.options.length} options •{" "}
                            {question.points} point
                            {question.points !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeQuestion(question.id)}
                        disabled={quiz.questions.length <= 1}
                        className={`p-2 rounded-lg transition-colors ${
                          quiz.questions.length <= 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          quiz.questions.length <= 1
                            ? "Minimum 1 question required"
                            : "Remove question"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          placeholder="Enter your question here..."
                          rows={3}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                            errors[`question_${question.id}`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`question_${question.id}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`question_${question.id}`]}
                          </p>
                        )}
                      </div>

                      {/* Answer Options */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Answer Options *
                          </label>
                          <button
                            onClick={() => addOption(question.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center mt-1">
                                <span className="text-sm font-medium text-gray-500 mr-3">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <button
                                  onClick={() =>
                                    toggleCorrectAnswer(question.id, option.id)
                                  }
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    option.isCorrect
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-gray-300 hover:border-green-400"
                                  }`}
                                  title={
                                    option.isCorrect
                                      ? "Correct answer"
                                      : "Mark as correct"
                                  }
                                >
                                  {option.isCorrect && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) =>
                                    updateOption(
                                      question.id,
                                      option.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + optionIndex
                                  )}`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>

                              <button
                                onClick={() =>
                                  removeOption(question.id, option.id)
                                }
                                disabled={question.options.length <= 2}
                                className={`p-1 rounded transition-colors ${
                                  question.options.length <= 2
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                                title={
                                  question.options.length <= 2
                                    ? "Minimum 2 options required"
                                    : "Remove option"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {errors[`options_${question.id}`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors[`options_${question.id}`]}
                          </p>
                        )}
                        {errors[`correct_${question.id}`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors[`correct_${question.id}`]}
                          </p>
                        )}
                      </div>

                      {/* Question Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(question.id, {
                                points: parseInt(e.target.value) || 1,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`points_${question.id}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`points_${question.id}`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`points_${question.id}`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Limit (seconds)
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="600"
                            value={question.timeLimit || ""}
                            onChange={(e) =>
                              updateQuestion(question.id, {
                                timeLimit: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation (Optional)
                        </label>
                        <textarea
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              explanation: e.target.value,
                            })
                          }
                          placeholder="Provide an explanation for the correct answer..."
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Quiz Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Questions:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.questions.length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Points:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.totalPoints}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Options:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.questions.reduce((sum, q) => sum + q.options.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Est. Time:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.totalTimeLimit
                  ? `${Math.floor(quiz.totalTimeLimit / 60)}m`
                  : "No limit"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""} • {quiz.totalPoints} total
            point{quiz.totalPoints !== 1 ? "s" : ""}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handlePreview}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Quiz
            </button>
            <button
              onClick={handleSave}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
