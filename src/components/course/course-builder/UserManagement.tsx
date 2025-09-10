import { useState } from "react";
import { Plus, Mail, Calendar, Filter, UserCheck, UserX } from "lucide-react";
import Button from "../../reusable-components/Button";
import SearchInput from "../../reusable-components/SearchInput";
import UserAvatar from "../../reusable-components/UserAvatar";
import Modal from "../../reusable-components/Modal";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: string;
  progress: number;
  status: "active" | "inactive" | "completed";
  lastActivity: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      enrollmentDate: "2024-01-15",
      progress: 75,
      status: "active",
      lastActivity: "2 hours ago",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      enrollmentDate: "2024-01-20",
      progress: 100,
      status: "completed",
      lastActivity: "1 day ago",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      enrollmentDate: "2024-02-01",
      progress: 45,
      status: "active",
      lastActivity: "5 hours ago",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      enrollmentDate: "2024-02-05",
      progress: 20,
      status: "inactive",
      lastActivity: "3 days ago",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserEmail
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        email: newUserEmail,
        enrollmentDate: new Date().toISOString().split("T")[0],
        progress: 0,
        status: "active",
        lastActivity: "Just enrolled",
      };

      setUsers([...users, newUser]);
      setNewUserEmail("");
      setIsAddUserModalOpen(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveUser = (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user from the course?"
      )
    ) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-yellow-100 text-yellow-800", label: "Inactive" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Users</h2>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          icon={Plus}
          variant="primary"
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by name or email..."
          className="flex-1"
        />

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar name={user.name} avatar={user.avatar} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.enrollmentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove user"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add users to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add User to Course"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email *
            </label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter user email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              The user will receive an invitation email to join the course.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setIsAddUserModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!newUserEmail.trim() || isLoading}
              variant="primary"
            >
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
