import React, { useState } from 'react'
import { MessageSquare, FileText, User as UserIcon } from 'lucide-react'
import { ChatTab } from './ChatTab'
import { NotesTab } from './NotesTab'
import { CandidateTab } from './CandidateTab'
import { JitsiApi } from '@/types/jitsi'
import { User } from '@/types/auth'

interface VideoSidebarProps {
  api: JitsiApi | null
  user: User | null
  entretienId: number
  candidateName: string
  candidateEmail: string
  scoreIA: number | null
  cvUrl: string | null
  initialNotes: string
}

type TabType = 'chat' | 'notes' | 'candidate'

export const VideoSidebar: React.FC<VideoSidebarProps> = ({
  api,
  user,
  entretienId,
  candidateName,
  candidateEmail,
  scoreIA,
  cvUrl,
  initialNotes
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-white/10 shadow-2xl">
      {/* Tabs Header */}
      <div className="flex border-b border-white/5 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold transition-all relative ${
            activeTab === 'chat' 
              ? 'text-brand-400 bg-brand-500/5' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
          {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold transition-all relative ${
            activeTab === 'notes' 
              ? 'text-brand-400 bg-brand-500/5' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Notes</span>
          {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('candidate')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold transition-all relative ${
            activeTab === 'candidate' 
              ? 'text-brand-400 bg-brand-500/5' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>Profil</span>
          {activeTab === 'candidate' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatTab api={api} user={user} />}
        {activeTab === 'notes' && <NotesTab entretienId={entretienId} initialNotes={initialNotes} />}
        {activeTab === 'candidate' && (
          <CandidateTab 
            candidateName={candidateName} 
            candidateEmail={candidateEmail} 
            scoreIA={scoreIA} 
            cvUrl={cvUrl} 
          />
        )}
      </div>
    </div>
  )
}
