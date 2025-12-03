import {
  MessageCircle,
  Search,
  Send,
  Users,
  X,
  Paperclip,
  Smile,
  Image,
  FileText,
  Film,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCustomQuery } from "../../../hooks/useQuery";
import { API_ENDPOINTS, ACCESS_TOKEN_KEY } from "../../../utils/constants";
import { getTimeAgo } from "../../../utils/getTimeAgo";
import { getCookie } from "../../../services/cookies";
import { readUserFromStorage } from "../../../services/auth";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

// Get WebSocket URL based on current environment
const getWebSocketURL = () => {
  if (
    window.location.href.includes("vercel") ||
    window.location.href.includes("localhost")
  ) {
    return "wss://ollms-api.vision-jo.com";
  }
  // Convert current origin to wss API URL
  const url = new URL(window.location.origin);
  const parts = url.hostname.split(".");
  let newHostname;
  if (parts[0].toLowerCase() === "www") {
    newHostname = ["api", ...parts.slice(1)].join(".");
  } else if (parts.length > 2) {
    newHostname = parts[0] + "-api." + parts.slice(1).join(".");
  } else {
    newHostname = `api.${url.hostname}`;
  }
  return `wss://${newHostname}`;
};

interface ChatModalProps {
  handleSendGroupMessage: any;
  activeChatGroup: any;
  handleCloseChatModal: any;
  groupMessage: any;
  setGroupMessage: any;
}

export default function ChatModal({
  activeChatGroup,
  handleCloseChatModal,
  groupMessage,
  setGroupMessage,
}: ChatModalProps) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isCleaningUpRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Get current user to determine message alignment
  const currentUser = readUserFromStorage();
  console.log(
    "Current User in ChatModal:",
    currentUser.first_name + " " + currentUser.last_name
  );

  // GET Room Details
  const { data: roomDetails } = useCustomQuery(
    API_ENDPOINTS.rooms + activeChatGroup?.id + "/detail/",
    ["room-details"]
  );
  const roomDetailsData = roomDetails?.data || {};
  // GET Room Messages
  const { data: roomMessages } = useCustomQuery(
    API_ENDPOINTS.rooms + activeChatGroup?.id + "/messages/?page_size=9999",
    ["room-messages"]
  );
  const roomMessagesData = roomMessages?.data || [];

  // Sort messages by created_at (oldest first, newest at bottom)
  const sortedMessages = [...roomMessagesData].sort((a: any, b: any) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages.length, scrollToBottom]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // WebSocket connection
  useEffect(() => {
    if (!activeChatGroup?.id) return;

    const token = getCookie(ACCESS_TOKEN_KEY);
    if (!token) {
      console.error("No access token found");
      return;
    }
    console.log("Token being used:", token.substring(0, 20) + "..."); // Add this

    // Reset cleanup flag
    isCleaningUpRef.current = false;

    // Don't create new connection if already connected or connecting
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket already connected or connecting");
      return;
    }

    const wsUrl = `${getWebSocketURL()}/ws/chat/${
      activeChatGroup.id
    }/?token=${token}`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isCleaningUpRef.current) {
        ws.close();
        return;
      }
      console.log("WebSocket OPEN - readyState:", ws.readyState); // Add this
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("WebSocket payload received:", payload);

        // The actual message is inside payload.data
        const message = payload.data;

        if (!message) return;

        console.log("Message received:", message);

        // Refetch messages to get the new message
        queryClient.invalidateQueries({ queryKey: ["room-messages"] });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected");
      console.log("Close code:", event.code); // Add this
      console.log("Close reason:", event.reason); // Add this
      console.log("Was clean:", event.wasClean); // Add this
      setIsConnected(false);
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    // Cleanup on unmount
    return () => {
      isCleaningUpRef.current = true;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatGroup?.id]);

  // Send message via WebSocket
  const sendMessageViaWebSocket = useCallback(
    (content: string) => {
      console.log("Attempting to send message:", content);
      console.log("WebSocket readyState:", wsRef.current?.readyState);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          body: content,
          type: "text",
          files: [],
        };
        console.log("Sending message data:", messageData);
        wsRef.current.send(JSON.stringify(messageData));
        setGroupMessage("");
      } else {
        console.error(
          "WebSocket is not connected. ReadyState:",
          wsRef.current?.readyState
        );
      }
    },
    [setGroupMessage]
  );

  // Handle send message
  const handleSendMessage = () => {
    console.log("handleSendMessage called, groupMessage:", groupMessage);
    if (!groupMessage?.trim()) return;
    sendMessageViaWebSocket(groupMessage.trim());
  };

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setGroupMessage((prev: string) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  // Send file attachment
  const handleSendAttachment = async () => {
    if (
      selectedFiles.length === 0 ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;

    setIsUploading(true);

    try {
      // Convert files to base64 for WebSocket transmission
      const filesData = await Promise.all(
        selectedFiles.map(async (file) => {
          return new Promise<{
            name: string;
            type: string;
            data: string;
            size: number;
          }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                type: file.type,
                data: reader.result as string,
                size: file.size,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const messageData = {
        body: "",
        type: "file",
        files: filesData,
      };

      console.log("Sending attachment:", messageData);
      wsRef.current.send(JSON.stringify(messageData));
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending attachment:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Film className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const { t } = useTranslation("coursePlayer");
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
                  className="w-5 h-5 rounded-full ltr:mr-3 rtl:ml-3"
                  style={{ backgroundColor: roomDetailsData?.color }}
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {roomDetailsData?.name ?? ""}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t(
                      roomDetailsData?.participants?.length === 1
                        ? "chats.groupHeader.membersCount_one"
                        : "chats.groupHeader.membersCount_other",
                      { count: roomDetailsData?.participants?.length ?? 0 }
                    )}
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
              {roomDetailsData?.description ?? ""}
            </p>
          </div>

          {/* Members List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Users className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t("chats.sidebar.membersTitle")} (
              {roomDetailsData?.participants?.length ?? 0})
            </h4>
            <div className="space-y-3">
              {roomDetailsData?.participants?.map((participant: any) => (
                <div
                  key={participant?.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    {participant?.profile_image ? (
                      <img
                        src={participant.profile_image}
                        alt={participant?.name ?? ""}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                        {participant?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {participant?.name ?? ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Actions */}
          <div className="p-6 border-t border-gray-700">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
              {t("chats.sidebar.leaveGroup")}
            </button>
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t("chats.chatHeader.title")}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t("chats.chatHeader.onlineNow", {
                    count:
                      activeChatGroup?.members?.filter((m: any) => m?.isOnline)
                        ?.length ?? 0,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-6 overflow-y-auto bg-gray-900 flex flex-col"
          >
            <div className="flex-1" />
            <div className="space-y-6">
              {sortedMessages?.map((message: any) => {
                // Find the sender from participants - check both p.id and p.user?.id
                const sender = roomDetailsData?.participants?.find(
                  (p: any) =>
                    p?.user?.id === message?.sender || p?.id === message?.sender
                );
                // Get sender name/image from user object if nested, otherwise from participant directly
                const senderNameFromParticipant =
                  sender?.user?.name || sender?.name;
                const senderImage =
                  sender?.user?.profile_image || sender?.profile_image;

                // Check if this message is from the current user
                const isCurrentUser = message?.sender === currentUser?.id;

                // Use current user's full name if sender is current user, otherwise use participant name
                const senderName = isCurrentUser
                  ? (
                      currentUser?.first_name +
                      " " +
                      currentUser?.last_name
                    ).trim()
                  : senderNameFromParticipant;

                return (
                  <div
                    key={message?.id}
                    className={`flex items-start gap-4 ${
                      isCurrentUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    {senderImage ? (
                      <img
                        src={senderImage}
                        alt={senderName ?? ""}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white flex-shrink-0">
                        {senderName?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div
                      className={`flex-1 min-w-0 ${
                        isCurrentUser ? "flex flex-col items-end" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2 ${
                          isCurrentUser ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="font-semibold text-white text-sm">
                          {senderName ?? ""}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(message?.created_at)}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-2xl ${
                          isCurrentUser ? "bg-indigo-600" : "bg-gray-700"
                        }`}
                      >
                        {/* Text content */}
                        {message?.content && (
                          <p
                            className={`leading-relaxed ${
                              isCurrentUser ? "text-white" : "text-gray-200"
                            }`}
                          >
                            {message?.content}
                          </p>
                        )}
                        {/* File attachments */}
                        {message?.files && message.files.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.files.map((file: any, idx: number) => (
                              <div key={idx}>
                                {file.type?.startsWith("image/") ||
                                file.url?.match(
                                  /\.(jpg|jpeg|png|gif|webp)$/i
                                ) ? (
                                  <img
                                    src={file.url || file.data}
                                    alt={file.name || "Image"}
                                    className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90"
                                    onClick={() =>
                                      window.open(
                                        file.url || file.data,
                                        "_blank"
                                      )
                                    }
                                  />
                                ) : file.type?.startsWith("video/") ||
                                  file.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video
                                    src={file.url || file.data}
                                    controls
                                    className="max-w-full rounded-lg max-h-64"
                                  />
                                ) : (
                                  <a
                                    href={file.url || file.data}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-gray-600 px-3 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                                  >
                                    <FileText className="w-5 h-5 text-gray-300" />
                                    <span className="text-sm text-white truncate">
                                      {file.name || "Download file"}
                                    </span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!sortedMessages || sortedMessages?.length === 0) && (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {t("chats.discussion.noMessagesTitle")}
                  </h4>
                  <p className="text-gray-400">
                    {t("chats.discussion.noMessagesSubtitle")}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-700 bg-gray-800">
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">
                    {selectedFiles.length} file(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-600 px-3 py-2 rounded-lg"
                    >
                      {getFileIcon(file.type)}
                      <span className="text-sm text-white truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSendAttachment}
                  disabled={isUploading}
                  className="mt-3 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Attachment(s)
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-10">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      theme={Theme.DARK}
                      width={350}
                      height={400}
                      searchPlaceholder="Search emoji..."
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                <textarea
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  onFocus={() => setShowEmojiPicker(false)}
                  placeholder={t("chats.composer.placeholder", {
                    groupName: roomDetailsData?.name ?? "",
                  })}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-lg transition-colors ${
                        showEmojiPicker
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      className="hidden"
                      accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Connected
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {t("chats.composer.hint")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!groupMessage?.trim()}
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
