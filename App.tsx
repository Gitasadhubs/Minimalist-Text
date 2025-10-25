
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { runQuery } from './services/geminiService';
import { type Message, Role } from './types';

const BlinkingCursor: React.FC = () => {
    return <span className="animate-pulse bg-white w-2 h-4 inline-block ml-1" />;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: Role.SYSTEM, text: 'System Initialized. Awaiting input.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: Role.USER,
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await runQuery(input);

    const modelMessage: Message = {
      id: `model-${Date.now()}`,
      role: Role.MODEL,
      text: responseText,
    };
    
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);
  }, [input, isLoading]);

  return (
    <div className="bg-black text-white font-mono h-screen flex flex-col p-2 sm:p-4">
      <header className="border-b border-gray-700 pb-2 mb-4 text-xs">
        <p>Minimalist Text AI Interface [CLI v1.0]</p>
        <p>(c) 2024 Foundation Labs. All rights reserved.</p>
      </header>

      <main className="flex-grow overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2 whitespace-pre-wrap">
            {msg.role === Role.USER && <span className="text-green-400">&gt; </span>}
            {msg.role === Role.MODEL && <span className="text-blue-400"># </span>}
            {msg.role === Role.SYSTEM && <span className="text-gray-500">// </span>}
            {msg.text}
          </div>
        ))}
        {isLoading && (
            <div className="mb-2">
                <span className="text-blue-400"># </span>
                <span className="text-gray-400">processing...</span>
                <BlinkingCursor />
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="mt-4">
        <form onSubmit={handleSubmit} className="flex items-start">
          <label htmlFor="prompt" className="text-green-400 mr-2">&gt;</label>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your command..."
            className="flex-grow bg-black text-white resize-none focus:outline-none p-0 m-0 leading-tight"
            rows={1}
            disabled={isLoading}
            autoFocus
          />
        </form>
      </footer>
    </div>
  );
}
