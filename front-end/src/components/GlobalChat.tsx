import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './GlobalChat.css';

interface ChatMessage {
    _id: string;
    username: string;
    message: string;
    type: 'user' | 'system';
    createdAt: string;
}

interface OnlineUser {
    _id: string;
    name: string;
    surname: string;
}

const GlobalChat: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tagging states
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const lastSeenIdRef = useRef<string | null>(null);
    const initialFetchRef = useRef(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/chat');
            const data = response.data;

            if (data.length > 0) {
                const latestMsgId = data[data.length - 1]._id;

                if (initialFetchRef.current) {
                    lastSeenIdRef.current = latestMsgId;
                    initialFetchRef.current = false;
                } else if (!isOpen && latestMsgId !== lastSeenIdRef.current) {
                    setHasUnread(true);
                }
            }

            setMessages(data);
        } catch (err) {
            console.error('Error fetching chat:', err);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const response = await api.get('/chat/online');
            setOnlineUsers(response.data);
        } catch (err) {
            console.error('Error fetching online users:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            if (messages.length > 0) {
                lastSeenIdRef.current = messages[messages.length - 1]._id;
            }
            scrollToBottom();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (messages.length > 0) {
                lastSeenIdRef.current = messages[messages.length - 1]._id;
            }
        }
    }, [messages]);

    useEffect(() => {
        fetchMessages();
        fetchOnlineUsers();
        const msgInterval = setInterval(fetchMessages, 2000);
        const onlineInterval = setInterval(fetchOnlineUsers, 10000);
        return () => {
            clearInterval(msgInterval);
            clearInterval(onlineInterval);
        };
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessage = (msg: string) => {
        const parts = msg.split(/(@[\w\s-]+:?)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="mention-tag">{part}</span>;
            }
            return part;
        });
    };

    const formatTimestamp = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewMessage(val);

        const lastAtPos = val.lastIndexOf('@');
        if (lastAtPos !== -1 && lastAtPos >= val.length - 15) {
            const search = val.substring(lastAtPos + 1).toLowerCase();
            setMentionSearch(search);
            setShowSuggestions(true);
            setSuggestionIndex(0);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectUser = (user: OnlineUser) => {
        const lastAtPos = newMessage.lastIndexOf('@');
        const prefix = newMessage.substring(0, lastAtPos);
        const name = `${user.name} ${user.surname}`;
        setNewMessage(`${prefix}@${name} `);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions) {
            const filtered = onlineUsers.filter(u =>
                `${u.name} ${u.surname}`.toLowerCase().includes(mentionSearch)
            );

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev + 1) % filtered.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev - 1 + filtered.length) % filtered.length);
            } else if (e.key === 'Enter' && filtered.length > 0) {
                e.preventDefault();
                selectUser(filtered[suggestionIndex]);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        setError(null);

        try {
            await api.post('/chat', { message: newMessage });
            setNewMessage('');
            fetchMessages();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mesaj göndərilmədi');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsSending(false);
        }
    };

    if (!isAuthenticated) return null;

    const quizLimitReached = (user?.totalAnswered || 0) >= 20;

    return (
        <div className={`global-chat-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            <button
                className="chat-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && hasUnread && <span className="chat-badge" />}
            </button>

            {/* Chat Window */}
            <div className="chat-window glass-card">
                <div className="chat-header">
                    <h3>Qlobal Söhbət</h3>
                    <div className="chat-status">
                        <span className="status-dot"></span> Online
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`chat-message ${msg.type === 'system' ? 'system-msg' : ''}`}
                        >
                            <span
                                className="msg-author"
                                onClick={() => setNewMessage(`@${msg.username} `)}
                            >
                                {msg.username}:
                            </span>
                            <span className="msg-content">{formatMessage(msg.message)}</span>
                            <span className="msg-time">{formatTimestamp(msg.createdAt)}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-footer">
                    {showSuggestions && (
                        <div className="chat-suggestions">
                            {onlineUsers
                                .filter(u => `${u.name} ${u.surname}`.toLowerCase().includes(mentionSearch))
                                .slice(0, 5)
                                .map((u, i) => (
                                    <div
                                        key={u._id}
                                        className={`suggestion-item ${i === suggestionIndex ? 'active' : ''}`}
                                        onClick={() => selectUser(u)}
                                    >
                                        {u.name} {u.surname}
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {!quizLimitReached ? (
                        <div className="chat-requirement-notice">
                            <Info size={16} />
                            <span>Çatda yazmaq üçün minimum 20 sual tamamlamalısınız ({user?.totalAnswered || 0}/20)</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Mesajınızı yazın..."
                                maxLength={200}
                                disabled={isSending}
                            />
                            <button type="submit" disabled={isSending || !newMessage.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                    {error && <div className="chat-error-toast">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
