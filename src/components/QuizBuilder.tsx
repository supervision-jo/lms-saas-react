import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Save, Eye } from 'lucide-react';

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

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onPreview: (quiz: Quiz) => void;
  initialQuiz?: Quiz;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ onSave, onPreview, initialQuiz }) => {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz || {
      id: Date.now().toString(),
      question: '',
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
      ],
      explanation: '',
      points: 1,
      timeLimit: undefined,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addOption = () => {
    const newOption: AnswerOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
    };
    setQuiz({
      ...quiz,
      options: [...quiz.options, newOption],
    });
  };

  const removeOption = (optionId: string) => {
    if (quiz.options.length <= 2) {
      alert('A quiz must have at least 2 options');
      return;
    }
    setQuiz({
      ...quiz,
      options: quiz.options.filter(option => option.id !== optionId),
    });
  };

  const updateOption = (optionId: string, text: string) => {
    setQuiz({
      ...quiz,
      options: quiz.options.map(option =>
        option.id === optionId ? { ...option, text } : option
      ),
    });
  };

  const toggleCorrectAnswer = (optionId: string) => {
    setQuiz({
      ...quiz,
      options: quiz.options.map(option =>
        option.id === optionId
          ? { ...option, isCorrect: !option.isCorrect }
          : option
      ),
    });
  };

  const validateQuiz = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!quiz.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (quiz.options.some(option => !option.text.trim())) {
      newErrors.options = 'All options must have text';
    }

    if (!quiz.options.some(option => option.isCorrect)) {
      newErrors.correct = 'At least one option must be marked as correct';
    }

    if (quiz.points < 1) {
      newErrors.points = 'Points must be at least 1';
    }

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
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Builder</h2>
        <p className="text-gray-600">Create engaging quizzes with multiple answer options</p>
      </div>

      <div className="space-y-8">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            value={quiz.question}
            onChange={(e) => setQuiz({ ...quiz, question: e.target.value })}
            placeholder="Enter your quiz question here..."
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.question ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        {/* Answer Options */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options *
            </label>
            <button
              onClick={addOption}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </button>
          </div>

          <div className="space-y-4">
            {quiz.options.map((option, index) => (
              <div key={option.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-500 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <button
                    onClick={() => toggleCorrectAnswer(option.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      option.isCorrect
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {option.isCorrect && <Check className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => removeOption(option.id)}
                  disabled={quiz.options.length <= 2}
                  className={`p-2 rounded-lg transition-colors ${
                    quiz.options.length <= 2
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                  title={quiz.options.length <= 2 ? 'Minimum 2 options required' : 'Remove option'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="mt-2 text-sm text-red-600">{errors.options}</p>
          )}
          {errors.correct && (
            <p className="mt-2 text-sm text-red-600">{errors.correct}</p>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">i</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Quiz Tips</h4>
                <ul className="mt-1 text-sm text-blue-700 space-y-1">
                  <li>• Click the circle next to an option to mark it as correct</li>
                  <li>• You can have multiple correct answers</li>
                  <li>• Add as many options as needed using the "Add Option" button</li>
                  <li>• Minimum 2 options required per question</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quiz.points}
              onChange={(e) => setQuiz({ ...quiz, points: parseInt(e.target.value) || 1 })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.points ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.points && (
              <p className="mt-1 text-sm text-red-600">{errors.points}</p>
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
              value={quiz.timeLimit || ''}
              onChange={(e) => setQuiz({ ...quiz, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={quiz.explanation || ''}
            onChange={(e) => setQuiz({ ...quiz, explanation: e.target.value })}
            placeholder="Provide an explanation for the correct answer..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {quiz.options.length} option{quiz.options.length !== 1 ? 's' : ''} • {quiz.options.filter(o => o.isCorrect).length} correct answer{quiz.options.filter(o => o.isCorrect).length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handlePreview}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
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