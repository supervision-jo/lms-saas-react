import { useState } from "react";
import { Plus, Mail, Calendar, Filter, UserCheck, UserX } from "lucide-react";
import Modal from "../../reusable-components/Modal";
import Button from "../../reusable-components/Button";
import SearchInput from "../../reusable-components/SearchInput";
import UserAvatar from "../../reusable-components/UserAvatar";
import { useCustomQuery } from "../../../hooks/useQuery";
import { API_ENDPOINTS } from "../../../utils/constants";
import { formatDateTimeSimple } from "../../../utils/formatDateTime";
import { useTranslation } from "react-i18next";

interface CourseUser {
  id: string;
  email: string;
  progress: number | null;
  full_name: string;
  enrolled_at: string;
  last_active: null | string;
  profile_image: string;
}
export default function UserManagement({ courseId }: { courseId: string }) {
  const { t } = useTranslation("courseBuilder");
  const { data, isLoading } = useCustomQuery(
    `${API_ENDPOINTS.courseUsers}${courseId}`,
    ["course-users", courseId],
    undefined,
    !!courseId
  );

  const users: CourseUser[] = data?.data?.students ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    // const matchesStatus =
    //   statusFilter === "all" || user.status === statusFilter;
    return matchesSearch;
    // && matchesStatus;
  });

  const handleAddUser = async () => {
    //
  };

  const handleRemoveUser = (userId: string) => {
    console.log(userId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800",
        label: t("userManagement.active"),
      },
      inactive: {
        color: "bg-yellow-100 text-yellow-800",
        label: t("userManagement.inactive"),
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        label: t("userManagement.completed"),
      },
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
          <h2 className="text-2xl font-bold text-gray-900">
            {t("userManagement.CourseUsers")}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} of {users.length} {t("userManagement.users")}
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          icon={Plus}
          variant="primary"
        >
          {t("userManagement.addUser")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("userManagement.searchByNameEmail")}
          className="flex-1"
        />

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t("userManagement.allStatus")}</option>
            <option value="active">{t("userManagement.active")}</option>
            <option value="inactive">{t("userManagement.inactive")}</option>
            <option value="completed">{t("userManagement.completed")}</option>
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
                  {t("userManagement.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userManagement.progress")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userManagement.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userManagement.enrolled")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userManagement.lastActive")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userManagement.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar
                        name={user?.full_name}
                        avatar={user?.profile_image}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.full_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${user?.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user?.progress ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge("active")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDateTimeSimple(user?.enrolled_at ?? new Date())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user?.last_active ?? ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleRemoveUser(user?.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title={t("userManagement.removeUser")}
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
              {t("userManagement.noUsers")}
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? t("userManagement.noUsersMatch")
                : t("userManagement.noUsersGet")}
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title={t("userManagement.addUserToCourse")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("userManagement.userEmail")}*
            </label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder={t("userManagement.enterUserEmailAddress")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("userManagement.invitationEmailMessage")}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 gap-2">
            <Button
              onClick={() => setIsAddUserModalOpen(false)}
              variant="secondary"
            >
              {t("userManagement.cancel")}
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!newUserEmail.trim() || isLoading}
              variant="primary"
            >
              {isLoading
                ? t("userManagement.adding")
                : t("userManagement.addUser")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
