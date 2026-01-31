import { useState, useEffect } from "react"
import { Phone, MessageSquare, Plus, Loader2, FileAudio, Trash2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserProfile } from "@/components/user-profile"
import { getUserAudioFiles, deleteAudioFile, type AudioFileMetadata } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"


interface SidebarProps {
  activeView: "dashboard" | "chat"
  setActiveView: (view: "dashboard" | "chat") => void
  onSelectFile?: (file: AudioFileMetadata | null) => void
  refreshKey?: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onGoToChat?: () => void
}

export function Sidebar({ 
  activeView, 
  setActiveView, 
  onSelectFile, 
  refreshKey,
  isCollapsed = false,
  onToggleCollapse,
  onGoToChat
}: SidebarProps) {
  const { user } = useAuth()
  const [audioFiles, setAudioFiles] = useState<AudioFileMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load audio files when user is authenticated or refreshKey changes
  useEffect(() => {
    if (user) {
      loadAudioFiles()
    }
  }, [user, refreshKey])

  const loadAudioFiles = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    try {
      const files = await getUserAudioFiles()
      setAudioFiles(files)
    } catch (err) {
      console.error('Failed to load audio files:', err)
      setError('Failed to load recent calls')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation() // Prevent selecting the file when deleting
    if (!fileId) return
    
    setDeletingId(fileId)
    try {
      await deleteAudioFile(fileId)
      setAudioFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      console.error('Failed to delete file:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <aside 
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col h-full transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-border ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center mb-4' : 'justify-between gap-2 mb-6'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && <h1 className="text-lg font-semibold text-foreground">CallSum</h1>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 ${isCollapsed ? 'mb-2' : ''}`}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        <Button 
          className="w-full relative group" 
          size={isCollapsed ? "icon" : "sm"} 
          variant="default"
          onClick={() => {
            onSelectFile?.(null) // Clear selected file
            setActiveView("dashboard")
          }}
          title="New Call"
        >
          <Plus className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
          {!isCollapsed && "New Call"}
        </Button>
      </div>

      {/* Navigation */}
      <div className={`px-2 py-4 border-b border-border flex ${isCollapsed ? 'flex-col items-center' : ''} gap-2`}>
        <button
          onClick={() => setActiveView("dashboard")}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md text-sm font-medium transition-colors w-full ${
            activeView === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
          title="Dashboard"
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Dashboard</span>}
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md text-sm font-medium transition-colors w-full ${
            activeView === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
          title="Chat"
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Chat</span>}
        </button>
      </div>

      {/* Recent Calls */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={`px-4 py-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Calls</p>}
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>
        <ScrollArea className="flex-1">
          {error ? (
            <div className="px-4 py-2">
              {!isCollapsed && <p className="text-xs text-destructive">{error}</p>}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadAudioFiles}
                className={`mt-2 w-full text-xs ${isCollapsed ? 'p-1 h-8' : ''}`}
              >
                {isCollapsed ? <Loader2 className="w-3 h-3" /> : "Retry"}
              </Button>
            </div>
          ) : audioFiles.length === 0 && !isLoading ? (
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground">No calls yet. Upload an audio file to get started!</p>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {audioFiles.map((file) => (
                <div
                  key={file.id}
                  className={`w-full text-left rounded-md hover:bg-muted transition-colors group relative flex items-center ${isCollapsed ? 'justify-center py-2' : 'px-3 py-2.5'}`}
                >
                  {/* Main Clickable Area */}
                  <div 
                     className={`flex-1 flex items-start ${isCollapsed ? 'justify-center' : 'justify-between min-w-0'} cursor-pointer`}
                     onClick={() => onSelectFile?.(file)}
                     title={file.filename}
                  >
                    {!isCollapsed ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileAudio className="w-3 h-3 text-primary flex-shrink-0" />
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                              {file.filename}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">{file.created_at ? formatTimeAgo(file.created_at) : 'Unknown'}</p>
                        </div>
                      </>
                    ) : (
                      <div className="relative">
                        <FileAudio className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (Only visible on hover when expanded) */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-muted-foreground mr-1">
                        {formatFileSize(file.file_size)}
                      </span>
                      
                      {/* Analyze Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectFile?.(file)
                          onGoToChat?.()
                        }}
                        className="p-1 hover:bg-primary/10 rounded transition-all text-primary"
                        title="Analyze with AI"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => file.id && handleDeleteFile(e, file.id)}
                        disabled={deletingId === file.id}
                        className="p-1 hover:bg-destructive/10 rounded transition-all text-destructive"
                        title="Delete"
                      >
                       {deletingId === file.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer - User Profile */}
      <div className={`p-4 border-t border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
        <UserProfile />
      </div>
    </aside>
  )
}
export default Sidebar
