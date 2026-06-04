import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { api, resolveAssetUrl } from "@/lib/api";
import { emitSocketEvent, onSocketEvent, getSocket, connectSocket } from "@/lib/socket";
import LoadingIndicator from "@/components/LoadingIndicator";
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const messagesContainer = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const fallbackAvatar = "/user-placeholder.svg";
  const [isSending, setIsSending] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create a notification sound using Web Audio API
    if (typeof window !== 'undefined') {
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        return () => {
          try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a pleasant notification sound (two quick beeps)
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            
            // Second beep
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 1000;
            oscillator2.type = 'sine';
            
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
            
            oscillator2.start(audioContext.currentTime + 0.15);
            oscillator2.stop(audioContext.currentTime + 0.25);
          } catch (e) {
            console.log('Audio playback failed:', e);
          }
        };
      };
      
      audioRef.current = { play: createNotificationSound() } as any;
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const socket = getSocket();
      if (!socket?.connected) {
        connectSocket();
      }
    }
  }, [user]);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    api.get("/chats").then(({ data }) => {
      setChats(data.chats || []);
      setLoadingChats(false);
      
      // Auto-select chat from query param if present
      const chatId = router.query.chat as string | undefined;
      if (chatId && data.chats?.some((c: Chat) => c.id === chatId)) {
        setActiveChat(chatId);
        setMobileShowChat(true);
        // Clean up URL
        router.replace("/messages", undefined, { shallow: true });
      }
    }).catch(() => setLoadingChats(false));
  }, [user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;
    setLoadingMessages(true);
    api.get(`/chats/${activeChat}`)
      .then(({ data }) => {
        setMessages(data.messages || []);
        setLoadingMessages(false);
        
        // Mark notifications from this chat as read
        api.put('/notifications/read-by-chat', { chatId: activeChat })
          .then(() => {
            // Emit event to update notification count in header
            window.dispatchEvent(new CustomEvent('notifications-updated'));
          })
          .catch(() => {});
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
        setLoadingMessages(false);
      });
    
    // Join the chat room for real-time events
    const socket = getSocket();
    if (socket?.connected) {
      emitSocketEvent("chat:join", activeChat);
    }
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
        setMessages((prev) => {
          // Avoid duplicates - check if message already exists
          if (prev.some(m => m.id === msg.id)) {
            return prev;
          }
          // Remove any temp messages and add the real one
          return [...prev.filter(m => !m.id.startsWith('temp-')), msg];
        });
        
        // Mark notifications for this chat as read since we're viewing it
        api.put('/notifications/read-by-chat', { chatId: activeChat })
          .then(() => {
            window.dispatchEvent(new CustomEvent('notifications-updated'));
          })
          .catch(() => {});
        
        // Play sound if message is from someone else
        if (msg.senderId !== user?.id && audioRef.current?.play) {
          try {
            audioRef.current.play();
          } catch (error) {
            // Ignore audio errors
          }
        }
      }
      // Update chat list
      setChats((prev) =>
        prev.map((c) =>
          c.id === msg.chatId
            ? { ...c, lastMessage: { content: msg.content, imageUrl: msg.imageUrl, createdAt: msg.createdAt } }
            : c
        )
      );
      
      // Play sound for messages in other chats
      if (msg.chatId !== activeChat && msg.senderId !== user?.id && audioRef.current?.play) {
        try {
          audioRef.current.play();
        } catch (error) {
          // Ignore audio errors
        }
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [activeChat, user?.id]);

  // Typing indicator
  useEffect(() => {
    const unsub = onSocketEvent<{ chatId: string; userId: string; username: string; isTyping: boolean }>("chat:typing", (data) => {
      if (data.chatId !== activeChat) return;
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.isTyping }));
      
      // Auto-clear typing after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => ({ ...prev, [data.userId]: false }));
        }, 3000);
      }
    });
    return () => {
      if (unsub) unsub();
    };
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
    
    // Request presence sync when socket connects
    const socket = getSocket();
    if (socket?.connected) {
      emitSocketEvent("presence:request");
    }
    
    // Also listen for socket connection to request presence
    const handleConnect = () => {
      emitSocketEvent("presence:request");
    };
    
    if (socket) {
      socket.on('connect', handleConnect);
    }
    
    return () => {
      if (unsub) unsub();
      if (unsubSync) unsubSync();
      if (socket) {
        socket.off('connect', handleConnect);
      }
    };
  }, []);

  // Chat status updates
  useEffect(() => {
    const unsub = onSocketEvent<{ chatId: string; status: "active" | "paid" | "archived" }>("chat:status", (data) => {
      setChats((prev) => prev.map((c) => (c.id === data.chatId ? { ...c, status: data.status } : c)));
    });
    return () => {
      if (unsub) unsub();
    };
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
    if (!newMsg.trim() || !activeChat || sending || isSending) return;
    
    const messageToSend = newMsg.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - show message immediately
    const optimisticMessage: Message = {
      id: tempId,
      chatId: activeChat,
      senderId: user!.id,
      content: messageToSend,
      imageUrl: null,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user!.id,
        username: user!.username,
        displayName: user!.displayName || user!.username,
        avatarUrl: user!.avatarUrl || null,
      },
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMsg(""); // Clear input immediately
    setIsSending(true);
    setSending(true);
    
    // Simulate typing delay (100-300ms based on message length)
    const typingDelay = Math.min(300, Math.max(100, messageToSend.length * 10));
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    
    try {
      const { data } = await api.post(`/chats/${activeChat}/messages`, { content: messageToSend });
      // Replace optimistic message with real one
      // The socket will also emit this message, but we handle duplicates in the socket listener
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
      emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: false });
    } catch (error) {
      // Remove optimistic message and restore input on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setNewMsg(messageToSend);
    } finally {
      setIsSending(false);
      setSending(false);
    }
  };

  const sendImage = async (file: File) => {
    if (!activeChat) return;
    
    const tempId = `temp-img-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    
    // Optimistic update - show image immediately with loading state
    const optimisticMessage: Message = {
      id: tempId,
      chatId: activeChat,
      senderId: user!.id,
      content: null,
      imageUrl: previewUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user!.id,
        username: user!.username,
        displayName: user!.displayName || user!.username,
        avatarUrl: user!.avatarUrl || null,
      },
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const { data } = await api.post(`/chats/${activeChat}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Replace optimistic message with real one
      setMessages((prev) => prev.map(m => {
        if (m.id === tempId) {
          URL.revokeObjectURL(previewUrl); // Clean up blob URL
          return data;
        }
        return m;
      }));
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      URL.revokeObjectURL(previewUrl); // Clean up blob URL
    }
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
              {loadingChats && (
                <div className="p-4">
                  <LoadingIndicator label="Loading chats" size="sm" />
                </div>
              )}
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
                      className="absolute -bottom-1 -right-1 w-5 h-5 object-cover border border-[var(--color-border)] bg-[var(--color-background)] rounded-full"
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
                      className="absolute -bottom-1 -right-1 w-4 h-4 object-cover border border-[var(--color-border)] bg-[var(--color-background)] rounded-full"
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
                <div ref={messagesContainer} className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <LoadingIndicator label="Loading messages" size="sm" />
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isTempMessage = msg.id.startsWith('temp-');
                        const isTempImage = msg.id.startsWith('temp-img-');
                        return (
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
                                className="w-6 h-6 object-cover border border-[var(--color-border)] self-end rounded-full"
                              />
                            )}
                            <div className={`${msg.senderId === user.id
                              ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                              : "bg-[var(--color-muted)] border border-[var(--color-border)]"
                            } p-3 rounded-lg`}>
                              <div className="mono text-[10px] opacity-70 mb-1">{msg.sender.displayName}</div>
                              {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                              {msg.imageUrl && (
                                <div className="relative">
                                  <img
                                    src={resolveAssetUrl(msg.imageUrl)}
                                    alt=""
                                    className={`max-w-full max-h-48 object-contain mt-1 cursor-pointer rounded-md ${isTempImage ? 'opacity-60' : ''}`}
                                    onClick={() => !isTempImage && window.open(resolveAssetUrl(msg.imageUrl), "_blank")}
                                  />
                                  {isTempImage && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-black/60 text-white px-3 py-1.5 rounded-md flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="mono text-[10px]">Uploading...</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="mono text-[9px] opacity-50 mt-1 text-right flex items-center justify-end gap-1.5">
                                {isTempMessage && !isTempImage ? (
                                  <>
                                    <span className="flex items-center gap-0.5">
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse"></span>
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span>Sending...</span>
                                  </>
                                ) : isTempImage ? (
                                  <>
                                    <span className="flex items-center gap-0.5">
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse"></span>
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                      <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        );
                      })}
                      {isOtherTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[70%] flex gap-2">
                        <img
                          src={resolveAssetUrl(activeChatData?.otherUser.avatarUrl) || fallbackAvatar}
                          alt=""
                          className="w-6 h-6 object-cover border border-[var(--color-border)] self-end rounded-full"
                        />
                        <div className="bg-[var(--color-muted)] border border-[var(--color-border)] p-3 px-4 rounded-lg">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
                            <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
                            <span className="w-2 h-2 bg-[var(--color-muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEnd} />
                    </>
                  )}
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
                    onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
                    onBlur={() => {
                      if (!activeChat) return;
                      emitSocketEvent("chat:typing", { chatId: activeChat, isTyping: false });
                    }}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1 mono bg-transparent border border-[var(--color-border)] h-10 px-3 text-sm outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                    data-testid="message-input"
                  />
                  <button onClick={sendMessage} disabled={sending || isSending || !newMsg.trim()}
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
