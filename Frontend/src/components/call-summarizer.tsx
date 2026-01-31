import { useState, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { ChatInterface } from "@/components/chat-interface"
import type { AudioFileMetadata } from "@/lib/api"

export function CallSummarizer() {
  const [selectedCall, setSelectedCall] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard")
  const [selectedFile, setSelectedFile] = useState<AudioFileMetadata | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleSelectFile = useCallback((file: AudioFileMetadata | null) => {
    setSelectedFile(file)
    setActiveView("dashboard")
  }, [])

  const handleRefreshSidebar = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleClearSelectedFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  const handleGoToChat = useCallback(() => {
    setActiveView("chat")
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev)
  }, [])

  return (
    <div className="flex h-full bg-background">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onSelectFile={handleSelectFile}
        refreshKey={refreshKey}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onGoToChat={handleGoToChat}
      />
      <div className="flex-1 flex flex-col">
        {activeView === "dashboard" ? (
          <Dashboard 
            selectedCall={selectedCall} 
            setSelectedCall={setSelectedCall} 
            selectedFile={selectedFile}
            onClearSelectedFile={handleClearSelectedFile}
            onRefreshSidebar={handleRefreshSidebar}
            onGoToChat={handleGoToChat}
          />
        ) : (
          <ChatInterface selectedCall={selectedCall} />
        )}
      </div>
    </div>
  )
}
export default CallSummarizer