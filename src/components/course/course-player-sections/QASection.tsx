import { Heart, Reply, Send, ThumbsUp } from "lucide-react";
import { useState } from "react";

export interface QAData {
  id: string;
  student: string;
  studentImage: string;
  question: string;
  timestamp: string;
  date: string;
  fullTimestamp: string;
  likes: number;
  isLiked: boolean;
  replies: {
    id: string;
    author: string;
    authorImage: string;
    isInstructor: boolean;
    content: string;
    timestamp: string;
    date: string;
    likes: number;
    isLiked: boolean;
  }[];
}

interface QASextionProps {
  newQuestion: string;
  replyText: string;
  replyingTo: string | null;
  setNewQuestion: React.Dispatch<React.SetStateAction<string>>;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
}

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    dateTime: now.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function QASection({
  replyingTo,
  setReplyText,
  setReplyingTo,
  replyText,
  newQuestion,
  setNewQuestion,
}: QASextionProps) {
  const [qaData, setQaData] = useState([
    {
      id: "1",
      student: "Sarah Johnson",
      studentImage:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
      question: "What is the difference between React and Angular?",
      timestamp: "5:30",
      date: "Jan 15, 2024",
      fullTimestamp: "Jan 15, 2024 at 5:30 PM",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: "1",
          author: "John Doe",
          authorImage:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
          isInstructor: true,
          content:
            'Great question! React is a library focused on building UI components, while Angular is a full framework with more built-in features like routing, forms, and HTTP client. You can learn more about React at <a href="https://reactjs.org" target="_blank" class="text-purple-600 hover:text-purple-800 underline">reactjs.org</a> and Angular at <a href="https://angular.io" target="_blank" class="text-purple-600 hover:text-purple-800 underline">angular.io</a>.',
          timestamp: "2 hours ago",
          date: "Jan 15, 2024",
          likes: 8,
          isLiked: true,
        },
      ],
    },
    {
      id: "2",
      student: "Mike Chen",
      studentImage:
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      question: "Can you explain JSX in more detail?",
      timestamp: "8:15",
      date: "Jan 15, 2024",
      fullTimestamp: "Jan 15, 2024 at 8:15 PM",
      likes: 7,
      isLiked: true,
      replies: [
        {
          id: "2",
          author: "John Doe",
          authorImage:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
          isInstructor: true,
          content:
            'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. It gets compiled to regular JavaScript function calls. Check out the official JSX documentation at <a href="https://reactjs.org/docs/introducing-jsx.html" target="_blank" class="text-purple-600 hover:text-purple-800 underline">React JSX Guide</a> for more details.',
          timestamp: "1 hour ago",
          date: "Jan 15, 2024",
          likes: 5,
          isLiked: false,
        },
      ],
    },
  ]);

  const handleAskQuestion = () => {
    if (newQuestion.trim()) {
      const currentTime = getCurrentDateTime();
      const newQA = {
        id: Date.now().toString(),
        student: "You", // Current user
        studentImage:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100", // Provide a default or current user's image
        question: newQuestion,
        timestamp: currentTime.time,
        date: currentTime.date,
        fullTimestamp: `${currentTime.date} at ${currentTime.time}`,
        likes: 0,
        isLiked: false,
        replies: [],
      };

      setQaData((prev) => [newQA, ...prev]);
      setNewQuestion("");
      console.log("New question added:", newQA);
    }
  };

  const handleLikeQuestion = (questionId: string) => {
    setQaData((prev) =>
      prev.map((qa) =>
        qa.id === questionId
          ? {
              ...qa,
              isLiked: !qa.isLiked,
              likes: qa.isLiked ? qa.likes - 1 : qa.likes + 1,
            }
          : qa
      )
    );
  };

  const handleLikeReply = (questionId: string, replyId: string) => {
    setQaData((prev) =>
      prev.map((qa) =>
        qa.id === questionId
          ? {
              ...qa,
              replies: qa.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply
              ),
            }
          : qa
      )
    );
  };

  const handleReply = (questionId: string) => {
    if (replyText.trim()) {
      const currentTime = getCurrentDateTime();
      const newReply = {
        id: Date.now().toString(),
        author: "You", // Current user
        authorImage:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
        isInstructor: false,
        content: replyText,
        timestamp: "just now",
        date: currentTime.date,
        likes: 0,
        isLiked: false,
      };

      setQaData((prev) =>
        prev.map((qa) =>
          qa.id === questionId
            ? { ...qa, replies: [...qa.replies, newReply] }
            : qa
        )
      );

      setReplyText("");
      setReplyingTo(null);
      console.log("Reply added to question:", questionId, newReply);
    }
  };
  return (
    <div className="bg-gray-800 p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">
              Questions & Answers
            </h3>
            <div className="space-y-4">
              {qaData.map((qa: any) => (
                <div
                  key={qa.id}
                  className="bg-gray-900 rounded-lg p-5 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={qa.studentImage}
                        alt={qa.student}
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                      />
                      <div>
                        <h4 className="font-medium text-white hover:text-purple-300 cursor-pointer transition-colors">
                          {qa.student}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {qa.fullTimestamp || `${qa.date} at ${qa.timestamp}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300 mb-4 ml-11 leading-relaxed">
                    <p>{qa.question}</p>
                  </div>

                  {/* Question Actions */}
                  <div className="ml-11 mb-4 flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeQuestion(qa.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        qa.isLiked
                          ? "text-red-400 hover:text-red-300"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          qa.isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{qa.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(qa.id)}
                      className="flex items-center space-x-1 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Replies */}
                  <div className="ml-11 space-y-3">
                    {qa.replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={reply.authorImage}
                              alt={reply.author}
                              className="w-6 h-6 rounded-full object-cover border border-gray-500"
                            />
                            <span className="font-medium text-white hover:text-purple-300 cursor-pointer transition-colors">
                              {reply.author}
                            </span>
                            {reply.isInstructor && (
                              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">
                                Instructor
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {reply.timestamp}
                          </span>
                        </div>
                        <div
                          className="text-gray-300 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: reply.content,
                          }}
                        />

                        {/* Reply Actions */}
                        <div className="flex items-center space-x-4 mt-3">
                          <button
                            onClick={() => handleLikeReply(qa.id, reply.id)}
                            className={`flex items-center space-x-1 text-xs transition-colors ${
                              reply.isLiked
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-gray-400 hover:text-blue-400"
                            }`}
                          >
                            <ThumbsUp
                              className={`w-3 h-3 ${
                                reply.isLiked ? "fill-current" : ""
                              }`}
                            />
                            <span>{reply.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Section */}
                  <div className="mt-4 ml-11">
                    {replyingTo === qa.id && (
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center mb-3">
                          <img
                            src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100"
                            alt="You"
                            className="w-6 h-6 rounded-full object-cover border border-gray-500 mr-2"
                          />
                          <span className="text-sm text-gray-300">
                            Replying to {qa.student}
                          </span>
                        </div>
                        <textarea
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="flex justify-end space-x-3 mt-3">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(qa.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask Question */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-5 sticky top-4 border border-gray-700">
              <h4 className="font-medium text-white mb-3">Ask a Question</h4>
              <textarea
                placeholder="Type your question here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
              />
              <button
                onClick={handleAskQuestion}
                className="w-full mt-3 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                Ask Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
