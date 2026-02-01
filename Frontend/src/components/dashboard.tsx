import { useState, useRef, useEffect } from "react"
import { MoreVertical, Play, Pause, Download, Share2, Upload, FileAudio, X, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { summarizeAudio, uploadAudioFile, updateFileSummary, getSignedAudioUrl, type AudioFileMetadata, type AudioFileUploadResponse } from "@/lib/api"
import type { SummaryResponse } from "@/types/api"
import { jsPDF } from "jspdf"


interface DashboardProps {
  selectedCall: string | null
  setSelectedCall: (id: string | null) => void
  selectedFile?: AudioFileMetadata | null
  onClearSelectedFile?: () => void
  onRefreshSidebar?: () => void
  onGoToChat?: () => void
}

export function Dashboard({ 
  selectedCall, 
  setSelectedCall, 
  selectedFile: selectedAudioFile, 
  onClearSelectedFile, 
  onRefreshSidebar,
  onGoToChat
}: DashboardProps) {
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileMetadata, setUploadedFileMetadata] = useState<AudioFileMetadata | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevSelectedAudioFile = useRef<AudioFileMetadata | null | undefined>(undefined)

  // Load selected file data from sidebar OR clear when null
  useEffect(() => {
    if (selectedAudioFile && selectedAudioFile.summary) {
      setSummaryData({
        summary: selectedAudioFile.summary,
        transcript: selectedAudioFile.transcript || undefined,
        key_aspects: selectedAudioFile.key_aspects || [],
        duration_minutes: selectedAudioFile.duration_minutes || 0,
        no_of_participants: selectedAudioFile.no_of_participants || 0,
        sentiment: (selectedAudioFile.sentiment as "Positive" | "Negative" | "Neutral") || undefined
      })
      setUploadedFileMetadata(selectedAudioFile)
    } else if (selectedAudioFile === null && prevSelectedAudioFile.current !== undefined) {
      // Clear state when New Call is clicked (selectedAudioFile changed from something to null)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setSummaryData(null)
      setUploadedFileMetadata(null)
      setSelectedFile(null)
      setError(null)
    }
    prevSelectedAudioFile.current = selectedAudioFile
  }, [selectedAudioFile])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg']
  const allowedMimeTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/ogg']

  // Play/Pause audio
  const handlePlayAudio = async () => {
    if (!uploadedFileMetadata?.id) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      setIsLoadingAudio(true)
      const signedUrl = await getSignedAudioUrl(uploadedFileMetadata.id)
      
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      const audio = new Audio(signedUrl)
      audioRef.current = audio
      
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setIsPlaying(false)
        setError('Failed to play audio')
      }
      
      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Failed to play audio:', err)
      setError('Failed to play audio')
    } finally {
      setIsLoadingAudio(false)
    }
  }

  // Download PDF report
  const handleDownloadPDF = () => {
    if (!summaryData || !uploadedFileMetadata) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Call Summary Report', pageWidth / 2, yPos, { align: 'center' })
    yPos += 15

    // File info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`File: ${uploadedFileMetadata.filename}`, 20, yPos)
    yPos += 6
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos)
    yPos += 15

    // Summary section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Summary', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(summaryData.summary, pageWidth - 40)
    doc.text(summaryLines, 20, yPos)
    yPos += summaryLines.length * 5 + 10

    // Stats
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Call Statistics', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Duration: ${summaryData.duration_minutes || 0} minutes`, 20, yPos)
    yPos += 6
    doc.text(`Participants: ${summaryData.no_of_participants || 0}`, 20, yPos)
    yPos += 6
    doc.text(`Sentiment: ${summaryData.sentiment || 'N/A'}`, 20, yPos)
    yPos += 12

    // Key Aspects
    if (summaryData.key_aspects && summaryData.key_aspects.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Discussion Points', 20, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      summaryData.key_aspects.forEach((aspect, index) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        const aspectLines = doc.splitTextToSize(`• ${aspect}`, pageWidth - 45)
        doc.text(aspectLines, 25, yPos)
        yPos += aspectLines.length * 5 + 3
      })
      yPos += 5
    }

    // Transcript
    if (summaryData.transcript) {
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Transcript', 20, yPos)
      yPos += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const transcriptLines = doc.splitTextToSize(summaryData.transcript, pageWidth - 40)
      transcriptLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 5
      })
    }

    // Save
    const fileName = uploadedFileMetadata.filename.replace(/\.[^/.]+$/, '')
    doc.save(`${fileName}_report.pdf`)
  }

  // Share functionality
  const handleShare = async () => {
    if (!summaryData || !uploadedFileMetadata) return

    const shareText = `📞 Call Summary: ${uploadedFileMetadata.filename}\n\n` +
      `📝 Summary:\n${summaryData.summary}\n\n` +
      `⏱️ Duration: ${summaryData.duration_minutes || 0} min | 👥 Participants: ${summaryData.no_of_participants || 0}\n` +
      `💬 Sentiment: ${summaryData.sentiment || 'N/A'}\n\n` +
      (summaryData.key_aspects && summaryData.key_aspects.length > 0 
        ? `🔑 Key Points:\n${summaryData.key_aspects.map(a => `• ${a}`).join('\n')}`
        : '')

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Call Summary: ${uploadedFileMetadata.filename}`,
          text: shareText
        })
        return
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      // Show a temporary success message (you could use a toast here)
      alert('Summary copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      setError('Failed to share')
    }
  }

  const handleFileSelect = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedExtensions.includes(fileExtension) && !allowedMimeTypes.includes(file.type)) {
      setError(`Invalid file format. Supported formats: ${allowedExtensions.join(', ')}`)
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      // First, upload to storage
      const uploadResponse = await uploadAudioFile(selectedFile)
      
      // Convert to metadata format for display
      const metadata: AudioFileMetadata = {
        id: uploadResponse.file_id,
        filename: uploadResponse.filename,
        storage_url: uploadResponse.storage_url,
        file_size: selectedFile.size,
        created_at: new Date().toISOString()
      }
      setUploadedFileMetadata(metadata)
      
      // Then, summarize the audio
      const response = await summarizeAudio(selectedFile)
      setSummaryData(response)
      
      // Save summary data to database
      await updateFileSummary(uploadResponse.file_id, {
        summary: response.summary,
        transcript: response.transcript,
        key_aspects: response.key_aspects,
        duration_minutes: response.duration_minutes,
        no_of_participants: response.no_of_participants,
        sentiment: response.sentiment
      })
      
      // Refresh sidebar to show new file
      onRefreshSidebar?.()
      
      setSelectedFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio file')
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleNewUpload = () => {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setSummaryData(null)
    setUploadedFileMetadata(null)
    setSelectedFile(null)
    setError(null)
    onClearSelectedFile?.()
  }

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 min-h-0">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Call Summary</h2>
            <p className="text-muted-foreground">
              {summaryData ? 'Analysis Complete' : 'Upload an audio file to get started'}
            </p>
          </div>
          <div className="flex gap-2">
            <AnimatedThemeToggler className="pr-4" />
            {summaryData && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handlePlayAudio}
                  disabled={isLoadingAudio || !uploadedFileMetadata?.id}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleDownloadPDF}
                  title="Download PDF Report"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                  title="Share Summary"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onGoToChat?.()}
                  title="Analyze with AI"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        {!summaryData && (
          <Card className="mb-8 bg-card border-border">
            <CardContent className="pt-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <FileAudio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Audio File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your audio file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supported formats: WAV, MP3, M4A, FLAC, OGG
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedExtensions.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upload & Analyze'
                      )}
                    </Button>
                    <Button
                      onClick={clearFile}
                      disabled={isUploading}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call Metrics */}
        {summaryData && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Duration</p>
                  <p className="text-2xl font-bold text-foreground">
                    {/* {summaryData.duration ? `${Math.floor(summaryData.duration / 60)}:${String(summaryData.duration % 60).padStart(2, '0')}` : 'N/A'} */}
                    {summaryData.duration_minutes}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">minutes</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Participants</p>
                  <p className="text-2xl font-bold text-foreground">{summaryData.no_of_participants}</p>
                  <p className="text-xs text-muted-foreground mt-2">people</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Sentiment</p>
                  <p className="text-2xl font-bold text-foreground">{summaryData.sentiment || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground mt-2">overall mood</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Key Topics</p>
                  <p className="text-2xl font-bold text-foreground">{summaryData.key_aspects?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">identified</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="bg-muted mb-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground leading-relaxed space-y-3">
                    <p>{summaryData.summary}</p>
                  </CardContent>
                </Card>
                {uploadedFileMetadata && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Uploaded File</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-primary" />
                        <p className="font-medium text-foreground">{uploadedFileMetadata.filename}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Size: {(uploadedFileMetadata.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {uploadedFileMetadata.created_at ? new Date(uploadedFileMetadata.created_at).toLocaleString() : 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Button
                  onClick={handleNewUpload}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Another File
                </Button>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="space-y-4 text-sm">
                      <p className="text-foreground whitespace-pre-wrap">
                        {summaryData.transcript || 'Transcript not available'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-3">
                {summaryData.key_aspects && summaryData.key_aspects.length > 0 ? (
                  summaryData.key_aspects.map((topic, i) => (
                    <Card key={i} className="bg-card border-border">
                      <CardContent className="pt-6 flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-sm text-foreground">{topic}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">No key topics identified</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
export default Dashboard