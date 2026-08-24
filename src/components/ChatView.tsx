import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { AvatarViewer } from './AvatarViewer';
import { ArrowLeft, Send, Lock } from 'lucide-react';

interface ChatViewProps {
  partner: User;
  messages: Message[];
  connectionId: string;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isChallenger?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  partner,
  messages,
  connectionId,
  onSendMessage,
  onBack,
  isChallenger = false,
}) => {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChallenger || !text.trim()) return;

    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-base text-zinc-50" id="chat-workspace-container">
      {/* Header */}
      <div className="p-3 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shadow-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border-0"
            id="btn-back-from-chat"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <AvatarViewer config={partner.avatarConfig} className="w-9 h-9 border border-zinc-800" />
            <div>
              <h2 className="text-xs font-black text-white leading-none">{partner.name}</h2>
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                @{partner.avatarConfig.displayName} • {partner.fitnessLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5">
          {isChallenger ? (
            <span className="text-[10px] font-bold font-mono text-brand-pop bg-brand-pop/10 border border-brand-pop/25 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5" /> PACER ONLY
            </span>
          ) : (
            <span className="text-[10px] font-bold font-mono text-brand-green bg-brand-green/10 border border-brand-green/25 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
              ● SECURE
            </span>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.senderId !== partner.id;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                id={`chat-bubble-${msg.id}`}
              >
                <div className={`px-3.5 py-2.5 rounded-2xl text-xs font-medium shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-brand-green to-brand-blue text-slate-950 font-black rounded-tr-none'
                    : 'bg-surface text-zinc-100 rounded-tl-none border border-zinc-700/50'
                }`}>
                  <p className="leading-relaxed break-words">{msg.text}</p>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono mt-1 px-1">{time}</span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12 text-center px-4">
            <p className="text-xs font-bold font-mono uppercase tracking-wider">Secure Signal Established</p>
            <p className="text-[10px] text-zinc-500 mt-1">Start of secure encrypted local trail chat history.</p>
          </div>
        )}
      </div>

      {/* Challenger Blocking Notice */}
      {isChallenger && (
        <div className="p-3 mx-4 mb-2 bg-brand-pop/10 border border-brand-pop/25 rounded-2xl text-brand-pop text-[11px] leading-relaxed font-semibold flex gap-2 items-start shrink-0">
          <Lock className="w-4 h-4 text-brand-pop shrink-0 mt-0.5" />
          <div>
            <span className="font-black uppercase text-[9px] font-mono tracking-wider block text-white mb-0.5">Private Messaging Restricted</span>
            Pacer-tier contacts cannot accept direct personal chats. Complete a joint session or promote them to 'Friend' status in the lobby to enable conversation.
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2 shrink-0 z-10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isChallenger}
          placeholder={isChallenger ? "Private messaging locked..." : `Message @${partner.avatarConfig.displayName}...`}
          className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all ${
            isChallenger 
              ? 'bg-zinc-900 border-zinc-850 text-zinc-500 cursor-not-allowed' 
              : 'bg-zinc-900/60 border-zinc-700 text-white placeholder-zinc-500'
          }`}
          id="input-chat-message"
        />
        <button
          type="submit"
          disabled={isChallenger}
          className={`p-2.5 text-slate-950 rounded-xl transition-colors shrink-0 shadow-sm border-0 ${
            isChallenger
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none'
              : 'bg-brand-green hover:opacity-90 cursor-pointer'
          }`}
          id="btn-send-message"
        >
          <Send className="w-4 h-4 fill-slate-950" />
        </button>
      </form>
    </div>
  );
};
