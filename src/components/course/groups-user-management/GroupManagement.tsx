// import React, { useState } from "react";
// import { Plus, Users, Trash2, UserPlus, UserMinus } from "lucide-react";
// import Modal from "../shared/Modal";
// import Button from "../shared/Button";
// import SearchInput from "../shared/SearchInput";
// import UserAvatar from "../shared/UserAvatar";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
// }

// interface Group {
//   id: string;
//   name: string;
//   description: string;
//   color: string;
//   members: User[];
//   createdAt: string;
// }

// interface GroupManagementProps {
//   courseId: string;
// }

// const GroupManagement: React.FC<GroupManagementProps> = ({ courseId }) => {
//   console.log(courseId);

//   const [groups, setGroups] = useState<Group[]>([
//     {
//       id: "1",
//       name: "Frontend Developers",
//       description: "Students focusing on React and frontend technologies",
//       color: "bg-blue-500",
//       members: [
//         { id: "1", name: "John Doe", email: "john.doe@example.com" },
//         { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
//       ],
//       createdAt: "2024-01-15",
//     },
//     {
//       id: "2",
//       name: "Backend Engineers",
//       description: "Students working on server-side development",
//       color: "bg-green-500",
//       members: [
//         { id: "3", name: "Mike Johnson", email: "mike.johnson@example.com" },
//       ],
//       createdAt: "2024-01-20",
//     },
//   ]);

//   const [availableUsers] = useState<User[]>([
//     { id: "1", name: "John Doe", email: "john.doe@example.com" },
//     { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
//     { id: "3", name: "Mike Johnson", email: "mike.johnson@example.com" },
//     { id: "4", name: "Sarah Wilson", email: "sarah.wilson@example.com" },
//     { id: "5", name: "Alex Brown", email: "alex.brown@example.com" },
//   ]);

//   const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
//   const [isManageMembersModalOpen, setIsManageMembersModalOpen] =
//     useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [memberSearchQuery, setMemberSearchQuery] = useState("");

//   const [newGroup, setNewGroup] = useState({
//     name: "",
//     description: "",
//     color: "bg-blue-500",
//   });

//   const colors = [
//     "bg-blue-500",
//     "bg-green-500",
//     "bg-purple-500",
//     "bg-red-500",
//     "bg-yellow-500",
//     "bg-pink-500",
//     "bg-indigo-500",
//     "bg-teal-500",
//   ];

//   const filteredGroups = groups.filter(
//     (group) =>
//       group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       group.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleCreateGroup = () => {
//     if (!newGroup.name.trim()) return;

//     const group: Group = {
//       id: Date.now().toString(),
//       name: newGroup.name,
//       description: newGroup.description,
//       color: newGroup.color,
//       members: [],
//       createdAt: new Date().toISOString().split("T")[0],
//     };

//     setGroups([...groups, group]);
//     setNewGroup({ name: "", description: "", color: "bg-blue-500" });
//     setIsCreateGroupModalOpen(false);
//   };

//   const handleDeleteGroup = (groupId: string) => {
//     if (window.confirm("Are you sure you want to delete this group?")) {
//       setGroups(groups.filter((group) => group.id !== groupId));
//     }
//   };

//   const handleAddMemberToGroup = (userId: string) => {
//     if (!selectedGroup) return;

//     const user = availableUsers.find((u) => u.id === userId);
//     if (!user) return;

//     const updatedGroups = groups.map((group) => {
//       if (group.id === selectedGroup.id) {
//         return {
//           ...group,
//           members: [...group.members, user],
//         };
//       }
//       return group;
//     });

//     setGroups(updatedGroups);
//     setSelectedGroup({
//       ...selectedGroup,
//       members: [...selectedGroup.members, user],
//     });
//   };

//   const handleRemoveMemberFromGroup = (userId: string) => {
//     if (!selectedGroup) return;

//     const updatedGroups = groups.map((group) => {
//       if (group.id === selectedGroup.id) {
//         return {
//           ...group,
//           members: group.members.filter((member) => member.id !== userId),
//         };
//       }
//       return group;
//     });

//     setGroups(updatedGroups);
//     setSelectedGroup({
//       ...selectedGroup,
//       members: selectedGroup.members.filter((member) => member.id !== userId),
//     });
//   };

//   const getAvailableUsersForGroup = () => {
//     if (!selectedGroup) return availableUsers;

//     const memberIds = selectedGroup.members.map((member) => member.id);
//     return availableUsers.filter(
//       (user) =>
//         !memberIds.includes(user.id) &&
//         (user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
//           user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
//     );
//   };

//   const getGroupMembers = () => {
//     if (!selectedGroup) return [];

//     return selectedGroup.members.filter(
//       (member) =>
//         member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
//         member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
//           <p className="text-gray-600 mt-1">{groups.length} groups created</p>
//         </div>
//         <Button
//           onClick={() => setIsCreateGroupModalOpen(true)}
//           icon={Plus}
//           variant="primary"
//         >
//           Create Group
//         </Button>
//       </div>

//       {/* Search */}
//       <SearchInput
//         value={searchQuery}
//         onChange={setSearchQuery}
//         placeholder="Search groups..."
//         className="max-w-md"
//       />

//       {/* Groups Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredGroups.map((group) => (
//           <div
//             key={group.id}
//             className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center">
//                 <div className={`w-4 h-4 rounded-full ${group.color} mr-3`} />
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   {group.name}
//                 </h3>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <button
//                   onClick={() => {
//                     setSelectedGroup(group);
//                     setIsManageMembersModalOpen(true);
//                   }}
//                   className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
//                   title="Manage members"
//                 >
//                   <UserPlus className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteGroup(group.id)}
//                   className="p-1 text-gray-400 hover:text-red-600 transition-colors"
//                   title="Delete group"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             <p className="text-gray-600 text-sm mb-4">{group.description}</p>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center text-sm text-gray-500">
//                 <Users className="w-4 h-4 mr-1" />
//                 <span>
//                   {group.members.length} member
//                   {group.members.length !== 1 ? "s" : ""}
//                 </span>
//               </div>
//               <div className="text-xs text-gray-400">
//                 Created {new Date(group.createdAt).toLocaleDateString()}
//               </div>
//             </div>

//             {/* Member Avatars */}
//             {group.members.length > 0 && (
//               <div className="mt-4 flex -space-x-2">
//                 {group.members.slice(0, 5).map((member) => (
//                   <UserAvatar
//                     key={member.id}
//                     name={member.name}
//                     avatar={member.avatar}
//                     size="sm"
//                     className="border-2 border-white"
//                   />
//                 ))}
//                 {group.members.length > 5 && (
//                   <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
//                     +{group.members.length - 5}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {filteredGroups.length === 0 && (
//         <div className="text-center py-12">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             No groups found
//           </h3>
//           <p className="text-gray-500">
//             {searchQuery
//               ? "Try adjusting your search"
//               : "Create your first study group to get started"}
//           </p>
//         </div>
//       )}

//       {/* Create Group Modal */}
//       <Modal
//         isOpen={isCreateGroupModalOpen}
//         onClose={() => setIsCreateGroupModalOpen(false)}
//         title="Create Study Group"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Group Name *
//             </label>
//             <input
//               type="text"
//               value={newGroup.name}
//               onChange={(e) =>
//                 setNewGroup({ ...newGroup, name: e.target.value })
//               }
//               placeholder="Enter group name"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               value={newGroup.description}
//               onChange={(e) =>
//                 setNewGroup({ ...newGroup, description: e.target.value })
//               }
//               placeholder="Describe the purpose of this group"
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Group Color
//             </label>
//             <div className="flex space-x-2">
//               {colors.map((color) => (
//                 <button
//                   key={color}
//                   onClick={() => setNewGroup({ ...newGroup, color })}
//                   className={`w-8 h-8 rounded-full ${color} ${
//                     newGroup.color === color
//                       ? "ring-2 ring-offset-2 ring-gray-400"
//                       : ""
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               onClick={() => setIsCreateGroupModalOpen(false)}
//               variant="secondary"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleCreateGroup}
//               disabled={!newGroup.name.trim()}
//               variant="primary"
//             >
//               Create Group
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Manage Members Modal */}
//       <Modal
//         isOpen={isManageMembersModalOpen}
//         onClose={() => setIsManageMembersModalOpen(false)}
//         title={`Manage Members - ${selectedGroup?.name}`}
//         size="lg"
//       >
//         <div className="space-y-6">
//           <SearchInput
//             value={memberSearchQuery}
//             onChange={setMemberSearchQuery}
//             placeholder="Search users..."
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Current Members */}
//             <div>
//               <h4 className="font-medium text-gray-900 mb-3">
//                 Current Members ({selectedGroup?.members.length || 0})
//               </h4>
//               <div className="space-y-2 max-h-64 overflow-y-auto">
//                 {getGroupMembers().map((member) => (
//                   <div
//                     key={member.id}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex items-center">
//                       <UserAvatar
//                         name={member.name}
//                         avatar={member.avatar}
//                         size="sm"
//                       />
//                       <div className="ml-3">
//                         <div className="text-sm font-medium text-gray-900">
//                           {member.name}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {member.email}
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => handleRemoveMemberFromGroup(member.id)}
//                       className="text-red-600 hover:text-red-800 p-1"
//                       title="Remove from group"
//                     >
//                       <UserMinus className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//                 {getGroupMembers().length === 0 && (
//                   <p className="text-gray-500 text-sm text-center py-4">
//                     {memberSearchQuery
//                       ? "No members match your search"
//                       : "No members in this group"}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Available Users */}
//             <div>
//               <h4 className="font-medium text-gray-900 mb-3">
//                 Available Users ({getAvailableUsersForGroup().length})
//               </h4>
//               <div className="space-y-2 max-h-64 overflow-y-auto">
//                 {getAvailableUsersForGroup().map((user) => (
//                   <div
//                     key={user.id}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex items-center">
//                       <UserAvatar
//                         name={user.name}
//                         avatar={user.avatar}
//                         size="sm"
//                       />
//                       <div className="ml-3">
//                         <div className="text-sm font-medium text-gray-900">
//                           {user.name}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {user.email}
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => handleAddMemberToGroup(user.id)}
//                       className="text-green-600 hover:text-green-800 p-1"
//                       title="Add to group"
//                     >
//                       <UserPlus className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//                 {getAvailableUsersForGroup().length === 0 && (
//                   <p className="text-gray-500 text-sm text-center py-4">
//                     {memberSearchQuery
//                       ? "No users match your search"
//                       : "All users are already in this group"}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end pt-4">
//             <Button
//               onClick={() => setIsManageMembersModalOpen(false)}
//               variant="primary"
//             >
//               Done
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default GroupManagement;
