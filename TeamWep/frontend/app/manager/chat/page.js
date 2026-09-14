'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export default function ManagerChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);

  const getAvatarUrl = (person) => {
    const name = person?.name || 'Team member';
    return person?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  };

  const appendMessage = (message) => {
    setMessages((current) => {
      const key = message?._id || `${message?.sender?._id || 'anon'}-${message?.createdAt || new Date().toISOString()}-${message?.message || 'no-message'}`;
      if (current.some((item) => {
        const itemKey = item?._id || `${item?.sender?._id || 'anon'}-${item?.createdAt || new Date().toISOString()}-${item?.message || 'no-message'}`;
        return itemKey === key;
      })) {
        return current;
      }
      return [...current, message];
    });
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setMessages(data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadMessages();

    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = socket;
    socket.emit('join-team-chat');
    socket.on('receive-message', (message) => {
      appendMessage(message);
    });

    return () => {
      socket.emit('leave-team-chat');
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!draft.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: draft.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Message failed');

      socketRef.current.emit('send-message', data);
      appendMessage(data);
      setDraft('');
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card rounded-3xl p-8">
        <h1 className="text-3xl font-black">Group Chat</h1>
        <div className="mt-6 h-[480px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {messages.length === 0 ? (
            <div className="text-slate-500">No messages yet.</div>
          ) : (
            messages.map((message, index) => {
              const messageKey = message?._id || `${message?.sender?._id || 'anon'}-${message?.createdAt || 'unknown'}-${message?.message || 'no-message'}-${index}`;
              const isMine = message.sender?._id === (user?._id || user?.id);

              return (
                <div key={messageKey} className={`mb-4 flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <img
                      src={getAvatarUrl(message.sender)}
                      alt={message.sender?.name || 'Team member'}
                      className="h-9 w-9 rounded-full border border-slate-600 object-cover"
                    />
                  )}

                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'bg-indigo-600 text-white' : 'border border-slate-700 bg-slate-800 text-slate-100'}`}>
                    <div className={`mb-1 text-[11px] font-semibold ${isMine ? 'text-indigo-100' : 'text-slate-300'}`}>
                      {isMine ? 'You' : message.sender?.name || 'Team member'}
                    </div>
                    <div className="break-words">{message.message}</div>
                  </div>

                  {isMine && (
                    <img
                      src={getAvatarUrl(user)}
                      alt={user?.name || 'You'}
                      className="h-9 w-9 rounded-full border border-indigo-400 object-cover"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button className="btn-primary" onClick={sendMessage} disabled={sending || !draft.trim()}>{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
