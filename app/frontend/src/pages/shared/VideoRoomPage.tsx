import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { entretiensService } from '@/services/entretiens.service'
import { Button } from '@/components/ui/Button'
import { VideoOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { LoadingState } from '@/components/feedback/States'
import { VideoSidebar } from '@/components/video/VideoSidebar'
import { Entretien } from '@/types/entretien'
import { JitsiApi } from '@/types/jitsi'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: new (domain: string, options: any) => JitsiApi
  }
}

export default function VideoRoomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomInfo, setRoomInfo] = useState<{
    room_name: string
    jitsi_domain: string
    external_url?: string
  } | null>(null)
  const [entretien, setEntretien] = useState<Entretien | null>(null)
  const [jitsiApi, setJitsiApi] = useState<JitsiApi | null>(null)
  const [isEnding, setIsEnding] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      try {
        const [roomData, entretienData] = await Promise.all([
          entretiensService.getRoomAccess(parseInt(id)),
          entretiensService.getById(parseInt(id)),
        ])

        if (roomData.external_url) {
          window.location.href = roomData.external_url
          return
        }

        setRoomInfo(roomData)
        setEntretien(entretienData)
      } catch (err: unknown) {
        const error = err as Error
        setError(
          error.message || "Impossible d'accéder à la salle de visioconférence."
        )
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (!roomInfo || !jitsiContainerRef.current || !entretien) return

    const scriptId = 'jitsi-external-api'
    const scriptUrl = `https://${roomInfo.jitsi_domain}/external_api.js`

    const initJitsi = () => {
      if (!jitsiContainerRef.current) return
      
      const options = {
        roomName: roomInfo.room_name,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user ? `${user.prenom} ${user.nom}` : 'Utilisateur JobTech',
          email: user?.email
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          // Force chat to be hidden in Jitsi so we use our own ChatTab
          hideChatButton: true,
          // Also hide some other buttons to keep UI clean
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'profile', 'recording',
            'livestreaming', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'help', 'mute-everyone',
            'security'
          ],
        },
      }
      const api = new window.JitsiMeetExternalAPI(roomInfo.jitsi_domain, options)
      setJitsiApi(api)
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = scriptUrl
      script.async = true
      script.onload = initJitsi
      document.body.appendChild(script)
    } else if (window.JitsiMeetExternalAPI) {
      initJitsi()
    }

    return () => {
      // Cleanup is handled by the api object itself if set
    }
  }, [roomInfo, user, entretien])

  // Separate effect for cleanup to avoid re-initializing on every render
  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose()
      }
    }
  }, [jitsiApi])

  const handleEndInterview = async () => {
    if (!id || !entretien) return
    
    if (confirm("Êtes-vous sûr de vouloir terminer cet entretien ? Cela générera automatiquement le compte-rendu IA.")) {
      setIsEnding(true)
      try {
        await entretiensService.updateStatut(parseInt(id), 'termine')
        navigate('/dashboard/entretiens')
      } catch (err) {
        console.error("Failed to end interview:", err)
        alert("Erreur lors de la clôture de l'entretien.")
      } finally {
        setIsEnding(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 shadow-glow-blue/5 rounded-2xl p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <VideoOff className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Accès Refusé</h1>
          <p className="mb-8 text-slate-400">{error}</p>
          <Button onClick={() => navigate(-1)} variant="secondary" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux entretiens
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="flex h-16 items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 text-white z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-tight">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Entretien en direct
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              {entretien?.offre_titre} — {entretien?.candidat_nom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4 border-r border-white/10 pr-4">
            <div className="text-xs font-semibold text-white">{user?.prenom} {user?.nom}</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{user?.role}</div>
          </div>
          
          <Button 
            onClick={handleEndInterview} 
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 text-white border-none h-9 px-4 text-xs font-bold transition-all shadow-lg shadow-red-600/20"
          >
            {isEnding ? (
              <LoadingState size="xs" color="white" />
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Terminer l'entretien
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Jitsi Video (70%) */}
        <div className="flex-[0.7] bg-black relative">
          <div ref={jitsiContainerRef} className="h-full w-full" />
        </div>

        {/* Sidebar (30%) */}
        <div className="flex-[0.3] min-w-[350px] max-w-[450px]">
          {entretien && (
            <VideoSidebar 
              api={jitsiApi}
              user={user}
              entretienId={entretien.id}
              candidateName={entretien.candidat_nom}
              candidateEmail={entretien.candidat_email || ''}
              scoreIA={entretien.score_ia || null}
              cvUrl={entretien.cv_url || null}
              initialNotes={entretien.notes}
            />
          )}
        </div>
      </div>
    </div>
  )
}
