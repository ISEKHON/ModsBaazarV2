import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError, resolveAssetUrl } from "@/lib/api";
import { connectSocket, onSocketEvent, emitSocketEvent } from "@/lib/socket";
import { Send, ImagePlus, ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";

interface Chat {
  id: string;
  mod: { id: string; title: string; iconUrl: string };
  otherUser: { id: string; username: string; displayName: string; avatarUrl: string | null };
  buyer: any;
  modder: any;
  lastMessage: { content: string | null; imageUrl: string | null; createdAt: string } | null;
  unreadCount: number;
  status: string;
  updatedAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"unpaid" | "paid" | "archived">("unpaid");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const messagesContainer = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const fallbackAvatar = "/user-placeholder.svg";

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) connectSocket();
  }, [user]);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    api.get("/chats").then(({ data }) => {
      setChats(data.chats || []);
      setLoadingChats(false);
    }).catch(() => setLoadingChats(false));
  }, [user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;
    api.get(`/chats/${activeChat}`).then(({ data }) => {
      setMessages(data.messages || []);
    });
    emitSocketEvent("chat:join", activeChat);
  }, [activeChat]);

  // Auto-scroll chat container only
  useEffect(() => {
    if (!messagesContainer.current) return;
    const container = messagesContainer.current;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, activeChat]);

  // Real-time messages
  useEffect(() => {
    const unsub = onSocketEvent<Message>("chat:message", (msg) => {
      if (msg.chatId === activeChat) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update chat list
      setChats((prev) =>
        prev.map((c) =>
          c.id === msg.chatId
            ? { ...c, lastMessage: { content: msg.content, imageUrl: msg.imageUrl, createdAt: msg.createdAt } }
            : c
        )
      );
    });
    return unsub;
  }, [activeChat]);

  // Typing indicator
  useEffect(() => {
    const unsub = onSocketEvent<{ chatId: string; userId: string; isTyping: boolean }>("chat:typing", (data) => {
      if (data.chatId !== activeChat) return;
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.isTyping }));
    });
    return unsub;
  }, [activeChat]);

  // Presence updates
  useEffect(() => {
    const unsub = onSocketEvent<{ userId: string; status: "online" | "offline" }>("user:presence", (data) => {
      setOnlineUsers((prev) => ({ ...prev, [data.userId]: data.status === "online" }));
    });
    const unsubSync = onSocketEvent<{ userIds: string[] }>("presence:sync", (data) => {
      const next: Record<string, boolean> = {};
      data.userIds.forEach((id) => { next[id] = true; });
      setOnlineUsers(next);
    });
    emitSocketEvent("presence:request");
    return () => {
      unsub();
      unsubSync();
    };
  }, []);

  // Chat status updates
  useEffect(() => {
    const unsub = onSocketEvent<{ chatId: string; status: "active" | "paid" | "archived" }>("chat:status", (data) => {
      setChats((prev) => prev.map((c) => (c.id === data.chatId ? { ...c, status: data.status } : c)));
    });
    return unsub;
  }, []);

  const isPrivileged = user?.role === "admin" || user?.role === "owner";
  const isModderOrAbove = user?.role === "modder" || isPrivileged;

  const updateChatStatus = async (chatId: string, status: "active" | "paid" | "archived") => {
    if (!isModderOrAbove) return;
    try {
      await api.put(`/chats/${chatId}/status`, { status });
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, status } : c)));
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeChat || sending) return;
    setSending(true);
    try {
      await api.post(`/chats/${activeChat}/messages`, { content: newMsg });
      setNewMsg("");
      emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: false });
    } catch {}
    setSending(false);
  };

  const sendImage = async (file: File) => {
    if (!activeChat) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await api.post(`/chats/${activeChat}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {}
  };

  const selectChat = (chatId: string) => {
    setActiveChat(chatId);
    setMobileShowChat(true);
  };

  const activeChatData = chats.find((c) => c.id === activeChat);
  const otherUserId = activeChatData?.otherUser.id;
  const isOtherTyping = otherUserId ? Boolean(typingUsers[otherUserId]) : false;
  const isOtherOnline = otherUserId ? Boolean(onlineUsers[otherUserId]) : false;
  const canManageActiveChat =
    Boolean(activeChatData) && (isPrivileged || activeChatData?.modder?.id === user?.id);

  const statusCounts = chats.reduce(
    (acc, chat) => {
      const status = chat.status || "active";
      if (status === "active") acc.unpaid += 1;
      if (status === "paid") acc.paid += 1;
      if (status === "archived") acc.archived += 1;
      return acc;
    },
    { unpaid: 0, paid: 0, archived: 0 }
  );

  const filteredChats = isModderOrAbove
    ? chats.filter((chat) => {
        const status = chat.status || "active";
        if (statusTab === "unpaid") return status === "active";
        if (statusTab === "paid") return status === "paid";
        return status === "archived";
      })
    : chats.filter((chat) => (chat.status || "active") !== "archived");

  useEffect(() => {
    if (!isModderOrAbove && activeChatData?.status === "archived") {
      setActiveChat(null);
    }
  }, [activeChatData?.status, isModderOrAbove]);

  if (!user) return null;

  return (
    <>
      <Head><title>Messages — FS Mods Hub</title></Head>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6" data-testid="messages-page">
        <div className="flex h-[calc(100vh-160px)] border border-[var(--color-border)]">
          {/* Chat List */}
          <div className={`w-full md:w-80 border-r border-[var(--color-border)] flex flex-col ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-[var(--color-border)]">
              <h1 className="heading text-lg">MESSAGES</h1>
            </div>
            {isModderOrAbove && (
              <div className="p-3 border-b border-[var(--color-border)] flex gap-2">
                {([
                  { key: "unpaid", label: "UNPAID", count: statusCounts.unpaid },
                  { key: "paid", label: "PAID", count: statusCounts.paid },
                  { key: "archived", label: "ARCHIVED", count: statusCounts.archived },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusTab(tab.key)}
                    className={`mono text-[10px] px-2 py-1 border ${
                      statusTab === tab.key
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/60"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {loadingChats && <div className="p-4 mono text-xs text-[var(--color-muted-foreground)]">Loading...</div>}
              {!loadingChats && filteredChats.length === 0 && (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 mx-auto text-[var(--color-muted-foreground)] mb-3" />
                  <p className="mono text-xs text-[var(--color-muted-foreground)]">No conversations yet</p>
                </div>
              )}
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`w-full text-left p-3 border-b border-[var(--color-border)] flex gap-3 hover:bg-[var(--color-muted)] transition-colors ${
                    activeChat === chat.id ? "bg-[var(--color-muted)]" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={resolveAssetUrl(chat.mod.iconUrl) || "/placeholder.png"}
                      alt=""
                      className="w-12 h-12 object-cover border border-[var(--color-border)]"
                    />
                    <img
                      src={resolveAssetUrl(chat.otherUser.avatarUrl) || fallbackAvatar}
                      alt=""
                      className="absolute -bottom-1 -right-1 w-5 h-5 object-cover border border-[var(--color-border)] bg-[var(--color-background)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="heading text-xs truncate flex items-center gap-2">
                        {chat.otherUser.displayName}
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          onlineUsers[chat.otherUser.id] ? "bg-[hsl(142,50%,45%)]" : "bg-[var(--color-muted-foreground)]"
                        }`} />
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-[9px] mono w-4 h-4 flex items-center justify-center shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="mono text-[10px] text-[var(--color-muted-foreground)] truncate">{chat.mod.title}</div>
                    <div className="text-[10px] text-[var(--color-muted-foreground)] truncate mt-0.5">
                      {chat.lastMessage?.content || (chat.lastMessage?.imageUrl ? "📷 Image" : "...")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-[var(--color-muted-foreground)] mb-4" />
                  <p className="heading text-lg">SELECT A CONVERSATION</p>
                  <p className="mono text-xs text-[var(--color-muted-foreground)] mt-1">Choose from your chats on the left</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-3">
                  <button onClick={() => setMobileShowChat(false)} className="md:hidden p-1">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative shrink-0">
                    <img
                      src={resolveAssetUrl(activeChatData?.mod.iconUrl) || "/placeholder.png"}
                      alt=""
                      className="w-9 h-9 object-cover border border-[var(--color-border)]"
                    />
                    <img
                      src={resolveAssetUrl(activeChatData?.otherUser.avatarUrl) || fallbackAvatar}
                      alt=""
                      className="absolute -bottom-1 -right-1 w-4 h-4 object-cover border border-[var(--color-border)] bg-[var(--color-background)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="heading text-sm truncate flex items-center gap-2">
                      {activeChatData?.otherUser.displayName}
                      <span className={`mono text-[9px] px-1.5 py-0.5 border ${
                        isOtherOnline ? "border-[hsl(142,50%,40%)] text-[hsl(142,50%,40%)]" : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
                      }`}>
                        {isOtherOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <div className="mono text-[10px] text-[var(--color-muted-foreground)] truncate">{activeChatData?.mod.title}</div>
                  </div>
                  {canManageActiveChat && (
                    <div className="flex items-center gap-2">
                      {activeChatData?.status !== "paid" && (
                        <button
                          onClick={() => updateChatStatus(activeChatData!.id, "paid")}
                          className="mono text-[9px] px-2 py-0.5 border border-[hsl(142,50%,40%)] text-[hsl(142,50%,40%)] hover:opacity-80"
                        >
                          MARK PAID
                        </button>
                      )}
                      {activeChatData?.status !== "archived" && (
                        <button
                          onClick={() => updateChatStatus(activeChatData!.id, "archived")}
                          className="mono text-[9px] px-2 py-0.5 border border-[hsl(45,80%,40%)] text-[hsl(45,80%,40%)] hover:opacity-80"
                        >
                          ARCHIVE
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div ref={messagesContainer} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] flex gap-2 ${msg.senderId === user.id ? "flex-row-reverse" : "flex-row"}`}>
                        {msg.senderId !== user.id && (
                          <img
                            src={resolveAssetUrl(msg.sender.avatarUrl) || fallbackAvatar}
                            alt=""
                            className="w-6 h-6 object-cover border border-[var(--color-border)] self-end"
                          />
                        )}
                        <div className={`${msg.senderId === user.id
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        : "bg-[var(--color-muted)] border border-[var(--color-border)]"
                        } p-3`}>
                        <div className="mono text-[10px] opacity-70 mb-1">{msg.sender.displayName}</div>
                        {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                        {msg.imageUrl && (
                          <img
                            src={resolveAssetUrl(msg.imageUrl)}
                            alt=""
                            className="max-w-full max-h-48 object-contain mt-1 cursor-pointer"
                            onClick={() => window.open(resolveAssetUrl(msg.imageUrl), "_blank")}
                          />
                        )}
                        <div className="mono text-[9px] opacity-50 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  ))}
                  {isOtherTyping && (
                    <div className="mono text-[10px] text-[var(--color-muted-foreground)]">{activeChatData?.otherUser.displayName} is typing...</div>
                  )}
                  <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[var(--color-border)] flex items-center gap-2">
                  <input type="file" ref={fileInput} className="hidden" accept="image/*"
                    onChange={(e) => { if (e.target.files?.[0]) sendImage(e.target.files[0]); e.target.value = ""; }} />
                  <button onClick={() => fileInput.current?.click()} className="p-2 hover:bg-[var(--color-muted)] transition-colors" data-testid="image-upload-btn">
                    <ImagePlus className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </button>
                  <input
                    value={newMsg}
                    onChange={(e) => {
                      setNewMsg(e.target.value);
                      if (!activeChat) return;
                      emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: true });
                      if (typingTimeout.current) clearTimeout(typingTimeout.current);
                      typingTimeout.current = setTimeout(() => {
                        emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: false });
                      }, 1200);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    onBlur={() => {
                      if (!activeChat) return;
                      emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: false });
                    }}
                    placeholder="Type a message..."
                    className="flex-1 mono bg-transparent border border-[var(--color-border)] h-10 px-3 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                    data-testid="message-input"
                  />
                  <button onClick={sendMessage} disabled={sending || !newMsg.trim()}
                    className="p-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                    data-testid="send-btn">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
