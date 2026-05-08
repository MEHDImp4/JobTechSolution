import React, { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { JitsiApi, JitsiIncomingMessageEvent } from '@/types/jitsi'
import { User } from '@/types/auth'

interface Message {
  id: string
  sender: string
  text: string
  time: string
  isMe: boolean
}

interface ChatTabProps {
  api: JitsiApi | null
  user: User | null
}

export const ChatTab: React.FC<ChatTabProps> = ({ api, user }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!api) return

    const handleIncomingMessage = (event: JitsiIncomingMessageEvent) => {
      // event: { from: string, nick: string, message: string }
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: event.nick || 'Inconnu',
        text: event.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: event.nick === (user ? `${user.prenom} ${user.nom}` : 'Moi')
      }
      setMessages((prev) => [...prev, newMessage])
    }

    api.addEventListener('incomingMessage', handleIncomingMessage)

    return () => {
      api.removeEventListener('incomingMessage', handleIncomingMessage)
    }
  }, [api, user])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !api) return

    api.executeCommand('sendChatMessage', inputValue, '', true)
    
    // Jitsi incomingMessage might not trigger for our own messages depending on config
    // But usually it does. If not, we could manually add it here.
    
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
            <p className="text-sm">Aucun message pour l'instant</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium text-slate-400">{msg.sender}</span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  msg.isMe 
                    ? 'bg-brand-500 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-900/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Écrivez un message..."
            className="w-full bg-slate-800 border-none rounded-full py-2 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 p-1.5 bg-brand-500 hover:bg-brand-600 rounded-full text-white transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
