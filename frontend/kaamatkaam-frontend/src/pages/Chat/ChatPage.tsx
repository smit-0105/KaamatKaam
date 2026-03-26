import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { chatApi } from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../../components/ui/Avatar";
import { PageSpinner } from "../../components/ui/Spinner";
import { Send, MessageCircle, ArrowLeft, Search, Smile } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c._id === location.state.conversationId);
      if (convo) selectConversation(convo);
    }
  }, [conversations, location.state]);

  useEffect(() => {
    if (!socket || !selectedConvo) return;

    socket.emit("join_conversation", selectedConvo._id);

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.emit("leave_conversation", selectedConvo._id);
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, selectedConvo]);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getMyConversations();
      setConversations(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectConversation = async (convo: any) => {
    setSelectedConvo(convo);
    setIsTyping(false);
    try {
      const res = await chatApi.getMessages(convo._id);
      setMessages(res.data.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket && selectedConvo) {
      socket.emit("typing", { conversationId: selectedConvo._id, userId: user?._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { conversationId: selectedConvo._id, userId: user?._id });
      }, 2000);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(selectedConvo._id, newMessage.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage("");
      scrollToBottom();

      socket?.emit("send_message", {
        conversationId: selectedConvo._id,
        message: res.data.data,
      });
      socket?.emit("stop_typing", { conversationId: selectedConvo._id, userId: user?._id });
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = (convo: any) => {
    return convo.participants?.find((p: any) => p._id !== user?._id) || {};
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const formatMessageDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, "HH:mm");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "dd MMM");
  };

  const getDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "EEEE, dd MMMM yyyy");
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any[], msg, i) => {
    const dateLabel = getDateLabel(msg.createdAt);
    if (i === 0 || getDateLabel(messages[i - 1].createdAt) !== dateLabel) {
      groups.push({ type: "date", label: dateLabel });
    }
    groups.push({ type: "message", data: msg });
    return groups;
  }, []);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(c);
    return other.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedConvo ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-primary-500" /> Messages
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{searchQuery ? "No matches found" : "No conversations yet"}</p>
                  <p className="text-gray-400 text-xs mt-1">Start chatting with a traveler or sender</p>
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const other = getOtherParticipant(convo);
                  const online = isUserOnline(other._id);
                  return (
                    <div
                      key={convo._id}
                      onClick={() => selectConversation(convo)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${
                        selectedConvo?._id === convo._id ? "bg-primary-50 border-l-2 border-l-primary-500" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar src={other.profilePhoto} name={other.name} size="md" />
                        {online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 text-sm truncate">{other.name}</p>
                          {convo.lastMessageAt && (
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatMessageDate(convo.lastMessageAt)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{convo.lastMessage || "Start chatting..."}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                  <button onClick={() => setSelectedConvo(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <Avatar src={getOtherParticipant(selectedConvo).profilePhoto} name={getOtherParticipant(selectedConvo).name} size="sm" />
                    {isUserOnline(getOtherParticipant(selectedConvo)._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getOtherParticipant(selectedConvo).name}</p>
                    <p className="text-xs text-gray-500">
                      {isTyping ? (
                        <span className="text-primary-500 animate-pulse">typing...</span>
                      ) : isUserOnline(getOtherParticipant(selectedConvo)._id) ? (
                        <span className="text-green-500">Online</span>
                      ) : selectedConvo.ride ? (
                        `${selectedConvo.ride.origin?.city} → ${selectedConvo.ride.destination?.city}`
                      ) : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                  {groupedMessages.map((item, i) => {
                    if (item.type === "date") {
                      return (
                        <div key={`date-${i}`} className="flex justify-center my-3">
                          <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">{item.label}</span>
                        </div>
                      );
                    }
                    const msg = item.data;
                    const isMine = msg.sender?._id === user?._id;
                    return (
                      <div key={msg._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? "bg-primary-500 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                  <input
                    type="text" value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                  <button
                    type="submit" disabled={!newMessage.trim() || sending}
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center bg-gray-50">
                <div>
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Messages</h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">Select a conversation from the sidebar to start messaging, or contact a traveler from a ride listing.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
