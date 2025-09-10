import { MessageCircle, Search, Send, Users, X } from "lucide-react";

interface ChatModalProps {
  handleSendGroupMessage: any;
  activeChatGroup: any;
  handleCloseChatModal: any;
  groupMessage: any;
  setGroupMessage: any;
}

export default function ChatModal({
  activeChatGroup,
  handleSendGroupMessage,
  handleCloseChatModal,
  groupMessage,
  setGroupMessage,
}: ChatModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex">
        {/* Left Sidebar - Group Info & Members */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Group Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full ${activeChatGroup.color} mr-3`}
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {activeChatGroup.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {activeChatGroup.members.length} members
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseChatModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm">
              {activeChatGroup.description}
            </p>
          </div>

          {/* Members List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Members ({activeChatGroup.members.length})
            </h4>
            <div className="space-y-3">
              {activeChatGroup.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {member.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {member.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Actions */}
          <div className="p-6 border-t border-gray-700">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
              Leave Group
            </button>
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Group Chat</h3>
                <p className="text-gray-400 text-sm">
                  {
                    activeChatGroup.members.filter((m: any) => m.isOnline)
                      .length
                  }{" "}
                  online now
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
            <div className="space-y-6">
              {/* Extended mock messages for long chat */}
              {[
                ...activeChatGroup.messages,
                {
                  id: "3",
                  user: "Sarah Wilson",
                  avatar:
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Has anyone finished the React Hooks section yet? I'm having trouble with useEffect.",
                  timestamp: "30 minutes ago",
                },
                {
                  id: "4",
                  user: "Alex Chen",
                  avatar:
                    "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Yes! The key is understanding the dependency array. Let me share a helpful resource.",
                  timestamp: "25 minutes ago",
                },
                {
                  id: "5",
                  user: "Emily Rodriguez",
                  avatar:
                    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "I found this article really helpful: https://react.dev/reference/react/useEffect",
                  timestamp: "20 minutes ago",
                },
                {
                  id: "6",
                  user: "David Kim",
                  avatar:
                    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Thanks Emily! That article cleared up a lot of confusion for me.",
                  timestamp: "15 minutes ago",
                },
                {
                  id: "7",
                  user: "Lisa Zhang",
                  avatar:
                    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Should we schedule a study session for this weekend? We could go through the exercises together.",
                  timestamp: "10 minutes ago",
                },
                {
                  id: "8",
                  user: "Tom Wilson",
                  avatar:
                    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Great idea! I'm free Saturday afternoon. What time works for everyone?",
                  timestamp: "8 minutes ago",
                },
                {
                  id: "9",
                  user: "Sarah Wilson",
                  avatar:
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Saturday 2 PM works for me! Should we use Zoom or Discord?",
                  timestamp: "5 minutes ago",
                },
                {
                  id: "10",
                  user: "Alex Chen",
                  avatar:
                    "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
                  message:
                    "Discord would be great! I can create a server for our study group.",
                  timestamp: "2 minutes ago",
                },
              ].map((message: any) => (
                <div key={message.id} className="flex items-start space-x-4">
                  <img
                    src={message.avatar}
                    alt={message.user}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white text-sm">
                        {message.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp}
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-2xl px-4 py-3 max-w-2xl">
                      <p className="text-gray-200 leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {activeChatGroup.messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    No messages yet
                  </h4>
                  <p className="text-gray-400">
                    Start the conversation with your study group!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-700 bg-gray-800">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  placeholder={`Message ${activeChatGroup.name}...`}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendGroupMessage(activeChatGroup.id);
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors">
                      <span className="text-lg">😊</span>
                    </button>
                    <button className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors">
                      📎
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSendGroupMessage(activeChatGroup.id)}
                disabled={!groupMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
