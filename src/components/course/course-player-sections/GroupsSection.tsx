import { Users } from "lucide-react";

const courseGroups = [
  {
    id: "1",
    name: "Frontend Developers",
    description: "Students focusing on React and frontend technologies",
    color: "bg-blue-500",
    members: [
      {
        id: "1",
        name: "John Doe",
        avatar:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
        isOnline: true,
      },
      {
        id: "2",
        name: "Jane Smith",
        avatar:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
        isOnline: false,
      },
      {
        id: "3",
        name: "Mike Johnson",
        avatar:
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
        isOnline: true,
      },
    ],
    messages: [
      {
        id: "1",
        user: "Jane Smith",
        avatar:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
        message: "Hey everyone! How are you finding this React lesson?",
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        user: "Mike Johnson",
        avatar:
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
        message: "Really helpful! The JSX explanation was clear.",
        timestamp: "1 hour ago",
      },
    ],
  },
  {
    id: "2",
    name: "Backend Engineers",
    description: "Students working on server-side development",
    color: "bg-green-500",
    members: [
      {
        id: "4",
        name: "Sarah Wilson",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
        isOnline: true,
      },
      {
        id: "5",
        name: "Alex Brown",
        avatar:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
        isOnline: false,
      },
    ],
    messages: [
      {
        id: "1",
        user: "Sarah Wilson",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
        message: "Anyone working on the backend integration for React apps?",
        timestamp: "3 hours ago",
      },
    ],
  },
];

interface GroupsProps {
  handleJoinGroup: any;
  handleShowChat: any;
}

export default function GroupsSection({
  handleJoinGroup,
  handleShowChat,
}: GroupsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Study Groups</h3>
        <p className="text-gray-300 text-sm mb-6">
          Join study groups to collaborate with fellow students and discuss
          course content.
        </p>

        {/* Groups List */}
        <div className="space-y-4">
          {courseGroups.map((group) => (
            <div key={group.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${group.color} mr-3`} />
                  <div>
                    <h4 className="font-semibold text-white">{group.name}</h4>
                    <p className="text-gray-300 text-sm">{group.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {group.members.length} member
                    {group.members.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>

              {/* Group Members */}
              <div className="flex items-center mb-3">
                <span className="text-gray-400 text-sm mr-3">Members:</span>
                <div className="flex -space-x-2">
                  {group.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full border-2 border-gray-700"
                        title={member.name}
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-gray-700"></div>
                      )}
                    </div>
                  ))}
                  {group.members.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-700 flex items-center justify-center text-xs text-white">
                      +{group.members.length - 5}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="border-t border-gray-600 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">
                    Recent Discussion:
                  </span>
                  <button
                    onClick={() => handleShowChat(group)}
                    className="text-purple-400 hover:text-purple-300 text-xs"
                  >
                    Show Chat
                  </button>
                </div>

                {group.messages.length > 0 ? (
                  <div className="space-y-2">
                    {group.messages.slice(-2).map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-2"
                      >
                        <img
                          src={message.avatar}
                          alt={message.user}
                          className="w-5 h-5 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-sm font-medium">
                              {message.user}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {message.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {courseGroups.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              No Study Groups Yet
            </h4>
            <p className="text-gray-400">
              Study groups will appear here when they're created by your
              instructor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
