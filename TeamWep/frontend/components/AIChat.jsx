'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

const starterMessage = {
  role: 'assistant',
  content: 'Hi! I can help with tasks, requests, team communication, and planning.',
};

export default function AIChat() {
  const [messages, setMessages] = useState([starterMessage]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.request('/ai/history')
      .then((data) => {
        if (active && data.messages?.length) {
          setMessages(data.messages);
        }
      })
      .catch(() => {
        if (active) setError('Saved chat history could not be loaded.');
      });

    return () => {
      active = false;
    };
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    const history = messages.filter((item) => item !== starterMessage);
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setDraft('');
    setError('');
    setSending(true);

    try {
      const data = await api.request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">TeamWep AI</p>
          <h1 className="mt-2 text-3xl font-black">AI Assistant</h1>
          <p className="mt-2 text-sm text-slate-600">Ask for a concise plan, draft, or answer about your team’s work.</p>
        </div>
        <a
          className="btn-secondary shrink-0"
          href="https://gemini.google.com/app"
          rel="noreferrer"
          target="_blank"
        >
          Try Google Gemini
        </a>
      </div>

      <div className="h-[430px] space-y-4 overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
        {messages.map((item, index) => (
          <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === 'user' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          </div>
        ))}
        {sending && <div className="text-sm text-slate-500">Thinking...</div>}
      </div>

      <form className="border-t border-slate-200 p-5 dark:border-slate-700" onSubmit={sendMessage}>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <input
            className="input min-w-0 flex-1"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask the assistant..."
            maxLength={4000}
            disabled={sending}
          />
          <button className="btn-primary shrink-0" type="submit" disabled={sending || !draft.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}