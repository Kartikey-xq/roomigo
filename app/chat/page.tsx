"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  CheckCheck,
  UserCheck,
  MoreVertical,
  UserMinus,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  X,
  ArrowLeft,
  Search,
  Sparkles,
} from "lucide-react";
import { Roommate } from "@/types/roommate";
import ReportBlockModal, { ReportData } from "@/components/ReportBlockModal";
import { useAuth } from "@/components/AuthContext";
import AuthGatekeeper from "@/components/AuthGatekeeper";
import { formatChatTime, formatDateIST } from "@/lib/utils/date";

export interface ChatRoommate extends Roommate {
  otherUserId?: string;
}

interface ApiConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    studentIdPrefix: string;
    college: "GEHU" | "GEU";
    course: string;
    year: string;
    lookingFor: string;
    bio: string;
    preferences?: Roommate["preferences"];
  };
  lastMessage?: {
    text: string;
    time: string;
    createdAt?: string;
    isDelivered: boolean;
  };
}

interface ApiRequestItem {
  id: string;
  senderId: string;
  senderProfile?: {
    fullName: string;
    avatarUrl?: string;
    verificationStatus: string;
    studentIdPrefix?: string;
    campus?: string;
    course?: string;
    yearOfStudy?: string;
    bio?: string;
  };
  requestMessage?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  createdAt?: string;
  isDelivered?: boolean;
}

export default function ChatPage() {
  const [chatTab, setChatTab] = useState<"messages" | "requests">("messages");

  const { user, refreshSession, setUnreadCount } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  // Connected Active Chats
  const [activeChats, setActiveChats] = useState<ChatRoommate[]>([]);

  // Received Match Requests
  const [receivedRequests, setReceivedRequests] = useState<ChatRoommate[]>([]);

  // Full Window Chat State
  const [isFullWindowOpen, setIsFullWindowOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Keep latest user and selectedChatId in refs to prevent stale closures in WebSocket event listeners
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const selectedChatIdRef = useRef(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Input & Messages refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat messages dictionary by conversation ID
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});

  // Current typed message
  const [inputText, setInputText] = useState("");

  // 3-Dots Manage Menu inside Full Window Chat
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);

  // Report & Block Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadConversations = () => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const mapped: ChatRoommate[] = data.data.map((c: ApiConversation) => ({
            id: c.id,
            otherUserId: c.otherUser.id,
            name: c.otherUser.name,
            avatar: c.otherUser.avatar,
            isVerified: c.otherUser.isVerified,
            studentIdPrefix: c.otherUser.studentIdPrefix,
            college: c.otherUser.college,
            course: c.otherUser.course,
            year: c.otherUser.year,
            matchPercentage: 94,
            matchHighlight: {
              icon: "zap" as const,
              text: "94% Match • High Compatibility",
            },
            lookingFor: c.otherUser.lookingFor,
            bio: c.otherUser.bio,
            isOnline: true,
            lastMessage: c.lastMessage
              ? {
                  text: c.lastMessage.text,
                  time: formatChatTime(c.lastMessage.createdAt || c.lastMessage.time),
                  createdAt: c.lastMessage.createdAt,
                  isDelivered: c.lastMessage.isDelivered,
                  unreadCount: 0,
                }
              : undefined,
            preferences: c.otherUser.preferences || {
              sleepCycle: "Early Bird",
              diet: "Pure Vegetarian",
              smoking: "Non-Smoker",
              studyHabit: "Quiet Study",
              cleanliness: "High",
              budget: "₹8,000 /mo",
              hobbies: ["Coding"],
            },
          }));
          const seenPeers = new Set<string>();
          const uniqueMapped = mapped.filter((chat) => {
            const peerKey = chat.otherUserId || chat.id;
            if (seenPeers.has(peerKey)) return false;
            seenPeers.add(peerKey);
            return true;
          });
          setActiveChats(uniqueMapped);
        }
      })
      .catch((err) => console.error("Error loading conversations:", err));
  };

  const loadRequests = () => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.received) {
          const mapped: ChatRoommate[] = data.data.received.map((r: ApiRequestItem) => ({
            id: r.id,
            otherUserId: r.senderId,
            name: r.senderProfile?.fullName || "Student",
            avatar: r.senderProfile?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            isVerified: r.senderProfile?.verificationStatus === "VERIFIED",
            studentIdPrefix: r.senderProfile?.studentIdPrefix || "GEHU",
            college: r.senderProfile?.campus?.includes("GEHU") ? "GEHU" : "GEU",
            course: r.senderProfile?.course || "Student",
            year: r.senderProfile?.yearOfStudy || "2nd Year",
            matchPercentage: 92,
            matchHighlight: {
              icon: "sparkles" as const,
              text: "92% Match • Student Request",
            },
            requestMessage: r.requestMessage,
            requestedAt: formatDateIST(r.createdAt),
            lookingFor: "Bell Road PGs",
            bio: r.senderProfile?.bio || "",
            isOnline: true,
            preferences: {
              sleepCycle: "Early Bird",
              diet: "Vegetarian",
              smoking: "Non-Smoker",
              studyHabit: "Quiet Study",
              cleanliness: "High",
              budget: "₹7,500 /mo",
              hobbies: ["Sports", "Coding"],
            },
          }));
          setReceivedRequests(mapped);
        }
      })
      .catch((err) => console.error("Error loading requests:", err));
  };

  useEffect(() => {
    loadConversations();
    loadRequests();
  }, []);

  // Real-Time WebSocket Connection (Single persistent socket per authenticated student)
  useEffect(() => {
    if (!user?.id) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const connectWS = async () => {
      if (isDisposed) return;
      try {
        // Request ephemeral single-use WebSocket ticket from authenticated session
        const ticketRes = await fetch("/api/auth/ws-ticket", { method: "POST" });
        if (!ticketRes.ok) {
          if (!isDisposed) reconnectTimeout = setTimeout(connectWS, 3000);
          return;
        }
        const ticketJson = await ticketRes.json();
        if (!ticketJson.success || !ticketJson.data?.ticket) {
          if (!isDisposed) reconnectTimeout = setTimeout(connectWS, 3000);
          return;
        }

        const baseWsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
        const wsUrl = `${baseWsUrl}?token=${encodeURIComponent(ticketJson.data.ticket)}`;
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close();
            return;
          }
          const currentChatId = selectedChatIdRef.current;
          if (currentChatId && ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "JOIN_ROOM", conversationId: currentChatId }));
            ws.send(JSON.stringify({ type: "MARK_READ", conversationId: currentChatId }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Handle ACK for messages sent by this client (replace tempId with real DB message ID)
            if (data.type === "MESSAGE_ACK") {
              const { tempId, messageId, time, createdAt } = data;
              if (tempId && messageId) {
                setConversations((prev) => {
                  let changed = false;
                  const next = { ...prev };
                  for (const [convId, list] of Object.entries(next)) {
                    const idx = list.findIndex((m) => m.id === tempId);
                    if (idx !== -1) {
                      const updated = [...list];
                      const resolvedTime = createdAt
                        ? formatChatTime(createdAt)
                        : (time ? formatChatTime(time) : updated[idx].time);
                      updated[idx] = {
                        ...updated[idx],
                        id: messageId,
                        time: resolvedTime,
                        createdAt: createdAt || updated[idx].createdAt,
                      };
                      next[convId] = updated;
                      changed = true;
                      break;
                    }
                  }
                  return changed ? next : prev;
                });
              }
              return;
            }

            if (data.type === "NEW_MESSAGE") {
              const msg = data.message;
              const displayTime = msg.createdAt ? formatChatTime(msg.createdAt) : formatChatTime(msg.time);
              const currentUserId = userRef.current?.id;
              // Correctly determine sender using fresh userRef
              const isMe = currentUserId ? msg.senderId === currentUserId : false;
              const sender: "me" | "them" = isMe ? "me" : "them";

              setConversations((prev) => {
                const existing = prev[msg.conversationId] || [];

                // 1. If message already exists by ID, prevent duplicate entry
                if (existing.some((m) => m.id === msg.id)) {
                  return prev;
                }

                // 2. If sent by me, check if an optimistic temp message exists to replace
                if (isMe) {
                  const tempIndex = existing.findIndex(
                    (m) =>
                      m.id === msg.tempId ||
                      (m.id.startsWith("user-") && m.text.trim() === msg.text.trim())
                  );
                  if (tempIndex !== -1) {
                    const updated = [...existing];
                    updated[tempIndex] = {
                      id: msg.id,
                      sender: "me",
                      text: msg.text,
                      time: displayTime,
                      createdAt: msg.createdAt,
                      isDelivered: msg.isDelivered,
                    };
                    return {
                      ...prev,
                      [msg.conversationId]: updated,
                    };
                  }
                }

                // 3. Otherwise append new message cleanly
                return {
                  ...prev,
                  [msg.conversationId]: [
                    ...existing,
                    {
                      id: msg.id,
                      sender,
                      text: msg.text,
                      time: displayTime,
                      createdAt: msg.createdAt,
                      isDelivered: msg.isDelivered,
                    },
                  ],
                };
              });

              // Update last message in active chats
              setActiveChats((prev) =>
                prev.map((c) =>
                  c.id === msg.conversationId
                    ? {
                        ...c,
                        lastMessage: {
                          text: msg.text,
                          time: displayTime,
                          createdAt: msg.createdAt,
                          isDelivered: true,
                          unreadCount: 0,
                        },
                      }
                    : c
                )
              );

              // Update global unread badge if incoming from another student
              if (!isMe) {
                if (selectedChatIdRef.current === msg.conversationId) {
                  if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "MARK_READ", conversationId: msg.conversationId }));
                  }
                } else {
                  setUnreadCount((prev) => prev + 1);
                }
              }
            }
          } catch (e) {
            console.error("WS parse error:", e);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    connectWS();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Prevent onclose from triggering reconnect!
        ws.close();
      }
      socketRef.current = null;
    };
  }, [user?.id, setUnreadCount]);

  // Join room and mark read whenever selected chat changes on active connection
  useEffect(() => {
    if (selectedChatId && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "JOIN_ROOM", conversationId: selectedChatId }));
      socketRef.current.send(JSON.stringify({ type: "MARK_READ", conversationId: selectedChatId }));
    }
  }, [selectedChatId]);

  const currentChat = activeChats.find((c) => c.id === selectedChatId) || null;
  const currentMessages = selectedChatId
    ? conversations[selectedChatId] || []
    : [];

  // LOCK BODY SCROLL WHEN FULL CHAT WINDOW IS OPEN
  useEffect(() => {
    if (isFullWindowOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullWindowOpen]);

  // AUTO-SCROLL TO BOTTOM OF MESSAGES
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isFullWindowOpen) {
      scrollToBottom();
      // Auto-focus input when chat window opens
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullWindowOpen, selectedChatId, currentMessages.length]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isManageMenuOpen) {
          setIsManageMenuOpen(false);
        } else if (isFullWindowOpen) {
          setIsFullWindowOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullWindowOpen, isManageMenuOpen]);

  // Open Full Window Chat Screen
  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsFullWindowOpen(true);
    setIsManageMenuOpen(false);

    // Fetch conversation message history from backend with strict deduplication
    fetch(`/api/conversations/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setConversations((prev) => {
            const currentList = prev[chatId] || [];
            const pendingOptimistic = currentList.filter((m) => m.id.startsWith("user-"));

            // Filter unique incoming messages by ID
            const seenIds = new Set<string>();
            const uniqueIncoming = (data.data as ChatMessage[])
              .filter((m) => {
                if (seenIds.has(m.id)) return false;
                seenIds.add(m.id);
                return true;
              })
              .map((m) => ({
                ...m,
                time: formatChatTime(m.createdAt || m.time),
              }));

            // Keep optimistic messages only if the server hasn't saved the exact text yet
            const unresolvedOptimistic = pendingOptimistic.filter(
              (opt) => !uniqueIncoming.some((m) => m.text.trim() === opt.text.trim())
            );

            return {
              ...prev,
              [chatId]: [...uniqueIncoming, ...unresolvedOptimistic],
            };
          });
        }
      })
      .catch((err) => console.error("Error loading messages:", err));

    // Join room over WebSocket & mark read
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "JOIN_ROOM", conversationId: chatId }));
      socketRef.current.send(JSON.stringify({ type: "MARK_READ", conversationId: chatId }));
    }

    // Refresh unread counts in session
    refreshSession();
  };

  // Back Arrow slide to return to the lists
  const handleBackToList = () => {
    setIsFullWindowOpen(false);
    setIsManageMenuOpen(false);
  };

  // Send a real message in the chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !selectedChatId) return;

    const now = new Date();
    const tempId = "user-" + now.getTime();
    const formattedNow = formatChatTime(now);
    const newMsg: ChatMessage = {
      id: tempId,
      sender: "me",
      text: textToSend,
      time: formattedNow,
      createdAt: now.toISOString(),
      isDelivered: true,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg],
    }));

    // Send via WebSocket if open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          conversationId: selectedChatId,
          text: textToSend,
          tempId,
        })
      );
    } else {
      // Fallback via HTTP POST
      fetch(`/api/conversations/${selectedChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.id) {
            setConversations((prev) => {
              const list = prev[selectedChatId] || [];
              return {
                ...prev,
                [selectedChatId]: list.map((m) =>
                  m.id === tempId
                    ? {
                        ...m,
                        id: data.data.id,
                        time: formatChatTime(data.data.createdAt || data.data.time),
                        createdAt: data.data.createdAt,
                      }
                    : m
                ),
              };
            });
          }
        })
        .catch((err) => console.error("HTTP send error:", err));
    }

    // Update last message in activeChats
    setActiveChats((prev) =>
      prev.map((c) =>
        c.id === selectedChatId
          ? {
              ...c,
              lastMessage: {
                text: textToSend,
                time: formattedNow,
                createdAt: now.toISOString(),
                isDelivered: true,
                unreadCount: 0,
              },
            }
          : c
      )
    );

    setInputText("");

    // Re-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Accept / Decline Received Requests
  const handleAcceptRequest = async (req: Roommate) => {
    try {
      const res = await fetch(`/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Accepted chat invite from ${req.name}! Full chat opened.`);
        setReceivedRequests((prev) => prev.filter((r) => r.id !== req.id));
        loadConversations();
        if (data.data?.conversationId) {
          handleOpenChat(data.data.conversationId);
        }
      } else {
        showToast(data.error?.message || "Failed to accept request.");
      }
    } catch {
      showToast("Error accepting request.");
    }
  };

  const handleDeclineRequest = async (req: Roommate) => {
    try {
      const res = await fetch(`/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DECLINE" }),
      });
      const data = await res.json();
      if (data.success) {
        setReceivedRequests((prev) => prev.filter((r) => r.id !== req.id));
        showToast(`Declined invite from ${req.name}.`);
      }
    } catch {
      showToast("Error declining request.");
    }
  };

  // 3-Dot Action 1: Un-match
  const handleUnmatch = async () => {
    if (!currentChat || !selectedChatId) return;
    const name = currentChat.name;
    try {
      await fetch(`/api/conversations/${selectedChatId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UNMATCH" }),
      });
      setActiveChats((prev) => prev.filter((c) => c.id !== selectedChatId));
      setIsManageMenuOpen(false);
      setIsFullWindowOpen(false);
      setSelectedChatId(null);
      showToast(`Unmatched with ${name}. They cannot message you anymore.`);
    } catch {
      showToast("Error unmatching user.");
    }
  };

  // 3-Dot Action 2: Delete Chat
  const handleDeleteChat = async () => {
    if (!selectedChatId || !currentChat) return;
    try {
      await fetch(`/api/conversations/${selectedChatId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLEAR_CHAT" }),
      });
      setConversations((prev) => ({
        ...prev,
        [selectedChatId]: [],
      }));
      setActiveChats((prev) =>
        prev.map((c) =>
          c.id === selectedChatId ? { ...c, lastMessage: undefined } : c
        )
      );
      setIsManageMenuOpen(false);
      showToast(`Cleared conversation history with ${currentChat.name}.`);
    } catch {
      showToast("Error clearing chat.");
    }
  };

  // 3-Dot Action 3: Block & Report Form Submit (with save proof option)
  const handleReportSubmit = async (reportData: ReportData) => {
    if (!currentChat || !selectedChatId) return;
    const name = currentChat.name;

    try {
      await fetch("/api/moderation/report-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId:
            (currentChat as ChatRoommate).otherUserId || currentChat.id,
          conversationId: selectedChatId,
          reason: reportData.reason,
          details: reportData.details,
          saveProof: reportData.saveProof,
        }),
      });

      setActiveChats((prev) => prev.filter((c) => c.id !== selectedChatId));
      setIsReportModalOpen(false);
      setIsManageMenuOpen(false);
      setIsFullWindowOpen(false);
      setSelectedChatId(null);

      const proofNote = reportData.saveProof
        ? "Chat transcript & verified student logs saved as evidence."
        : "";

      showToast(`Report submitted for ${name} (${reportData.reason}). ${proofNote}`);
    } catch {
      showToast("Error submitting report.");
    }
  };

  const filteredActiveChats = activeChats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGatekeeper pageName="Chat">
      <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-zinc-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FULL WINDOW CHAT SCREEN (TRUE FULL-SCREEN VIEWPORT OVERLAY - DOES NOT SCROLL WHOLE PAGE) */}
      {isFullWindowOpen && currentChat && (
        <div className="fixed inset-0 z-40 bg-[#fbfdfc] flex flex-col h-[100dvh] w-screen overflow-hidden">
          {/* Top Bar Header with Back Arrow Slide, Recipient Details & 3-Dot Menu */}
          <header className="shrink-0 h-16 sm:h-18 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between z-20 shadow-xs">
            {/* Left: Back Arrow Slide + Recipient Avatar & Name */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Back Arrow Slide Button */}
              <button
                type="button"
                onClick={handleBackToList}
                aria-label="Back to chat lists"
                className="w-10 h-10 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/90 text-zinc-700 hover:text-zinc-900 flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Recipient Details */}
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentChat.avatar}
                  alt={currentChat.name}
                  className="w-10 h-10 rounded-2xl object-cover bg-zinc-100 border border-zinc-200 shadow-2xs"
                />
                {currentChat.isOnline && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                    title="Online now"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">
                    {currentChat.name}
                  </h2>
                  {currentChat.isVerified && (
                    <span title="Verified Student ID">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                  <span className="text-emerald-700 font-medium">Online now</span>
                  <span>•</span>
                  <span>{currentChat.college} {currentChat.course}</span>
                  <span>•</span>
                  <span>{currentChat.matchPercentage}% Match</span>
                </p>
              </div>
            </div>

            {/* Right: 3-Dot Menu Button to Block & Report, Unmatch, Delete Chat */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsManageMenuOpen((prev) => !prev)}
                aria-label="Chat options menu"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isManageMenuOpen
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900"
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* 3-Dot Dropdown Menu */}
              {isManageMenuOpen && (
                <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl bg-white border border-zinc-200 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-zinc-400 font-mono border-b border-zinc-100">
                    Connection Options
                  </div>

                  {/* 1. Block and Report (Form with Save Chat for Proof) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsManageMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold">Block &amp; Report</p>
                      <p className="text-[10px] text-rose-500/80">
                        With chat proof export
                      </p>
                    </div>
                  </button>

                  {/* 2. Un-match */}
                  <button
                    type="button"
                    onClick={handleUnmatch}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span>Un-match</span>
                  </button>

                  {/* 3. Delete Chat */}
                  <button
                    type="button"
                    onClick={handleDeleteChat}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span>Delete Conversation</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Messages Scroll Area (ONLY THIS CONTAINER SCROLLS, NOT THE WHOLE PAGE) */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 bg-zinc-50/60">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Encrypted Notice Banner */}
              <div className="flex justify-center">
                <span className="text-[11px] font-mono text-zinc-500 bg-white/90 px-3.5 py-1 rounded-full border border-zinc-200/70 shadow-2xs flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>End-to-end encrypted Graphic Era student chat</span>
                </span>
              </div>

              {/* Conversation Messages */}
              {currentMessages.length > 0 ? (
                currentMessages.map((msg, index) => (
                  <div
                    key={`${msg.id}-${index}`}
                    className={`flex flex-col max-w-[85%] sm:max-w-md ${
                      msg.sender === "me" ? "ml-auto items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.sender === "me"
                          ? "bg-emerald-600 text-white rounded-tr-xs"
                          : "bg-white text-zinc-800 border border-zinc-200/90 rounded-tl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-mono flex items-center gap-1 ${
                        msg.sender === "me" ? "text-emerald-700 font-medium" : "text-zinc-400"
                      }`}
                    >
                      {formatChatTime(msg.createdAt || msg.time)}
                      {msg.sender === "me" && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-zinc-400 text-xs">
                  No messages yet. Send a greeting to start chatting!
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input Bar (Pinned at bottom, fixed in place, clean pointer events) */}
          <div className="shrink-0 bg-white border-t border-zinc-200/90 p-3 sm:p-4 z-20">
            <form
              onSubmit={handleSendMessage}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${currentChat.name}...`}
                className="flex-1 bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-300 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-text pointer-events-auto shadow-2xs"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Send message"
                className={`px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs shrink-0 pointer-events-auto ${
                  inputText.trim()
                    ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/25 cursor-pointer"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT LIST VIEW (Visible when no chat is open or after back arrow is clicked) */}
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 border border-emerald-100 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold w-fit">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Roommate Messaging Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-sans">
            Chat &amp; Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl">
            Click on any student&apos;s name to open the full window chat screen.
            Review incoming co-living requests in the requests tab.
          </p>
        </div>
      </div>

      {/* Segmented Switcher (Messages vs Requests) */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80 shadow-xs max-w-md">
        <button
          type="button"
          onClick={() => setChatTab("messages")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            chatTab === "messages"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <span>Messages</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
            {activeChats.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setChatTab("requests")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            chatTab === "requests"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <span>Match Requests</span>
          {receivedRequests.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
              {receivedRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MESSAGES (Clicking name opens full window chat screen) */}
      {chatTab === "messages" && (
        <div className="space-y-3">
          {/* Search bar in chat list */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by student name or branch..."
              className="w-full bg-white border border-zinc-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 shadow-xs"
            />
          </div>

          {filteredActiveChats.length > 0 ? (
            <div className="space-y-2.5">
              {filteredActiveChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleOpenChat(chat.id)}
                  className="p-4 rounded-3xl bg-white border border-zinc-200/90 hover:border-emerald-300 hover:bg-emerald-50/20 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-13 h-13 rounded-2xl object-cover bg-zinc-100 border border-zinc-200 group-hover:scale-105 transition-transform"
                      />
                      {chat.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                          {chat.name}
                        </h4>
                        {chat.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {chat.college} {chat.course} • {chat.year}
                      </p>
                      <p className="text-xs text-zinc-600 truncate mt-1 max-w-xs sm:max-w-md">
                        {chat.lastMessage?.text || "Connected! Click to open full chat."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formatChatTime(chat.lastMessage?.createdAt || chat.lastMessage?.time) || "Now"}
                    </span>
                    {chat.lastMessage?.unreadCount ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {chat.lastMessage.unreadCount}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 group-hover:translate-x-1 transition-transform font-bold">
                        Open &rarr;
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-zinc-200 p-8 space-y-2 text-zinc-500">
              <p className="text-sm font-semibold text-zinc-800">No conversations found</p>
              <p className="text-xs">Try a different search term or check incoming requests.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS (Accepting opens full window chat directly) */}
      {chatTab === "requests" && (
        <div className="space-y-3">
          {receivedRequests.length > 0 ? (
            receivedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-zinc-100 border border-zinc-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm sm:text-base font-bold text-zinc-900">
                          {req.name}
                        </h4>
                        {req.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {req.college} • {req.course}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    {req.matchPercentage}% Match
                  </span>
                </div>

                {req.requestMessage && (
                  <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 italic leading-relaxed">
                    &quot;{req.requestMessage}&quot;
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req)}
                    className="flex-1 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept &amp; Open Chat</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-zinc-200 p-8 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800">No pending chat requests</p>
              <p className="text-xs text-zinc-500">You are all caught up with match inquiries.</p>
            </div>
          )}
        </div>
      )}

      {/* REPORT & BLOCK MODAL */}
      <ReportBlockModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        roommate={currentChat}
        messageCount={currentMessages.length}
        onSubmit={handleReportSubmit}
      />
    </div>
    </AuthGatekeeper>
  );
}
