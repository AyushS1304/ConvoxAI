import { useState, useEffect } from "react"
import { Phone, Mail, User, Calendar, FileAudio, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { getUserAudioFiles, type AudioFileMetadata } from "@/lib/api"

interface ProfilePageProps {
  onBack: () => void
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth()
  const [audioFiles, setAudioFiles] = useState<AudioFileMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadRecentCalls()
    }
  }, [user])

  const loadRecentCalls = async () => {
    setIsLoading(true)
    try {
      const files = await getUserAudioFiles()
      setAudioFiles(files.slice(0, 5)) // Get 5 most recent calls
    } catch (error) {
      console.error('Failed to load recent calls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const initials = user.email
    ?.split('@')[0]
    .substring(0, 2)
    .toUpperCase() || 'U'

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const phoneNumber = user.user_metadata?.phone || user.phone || 'Not provided'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Details */}
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Name */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Full Name</span>
                      </div>
                      <p className="text-base font-medium text-foreground">{fullName}</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </div>
                      <p className="text-base font-medium text-foreground">{user.email}</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </div>
                      <p className="text-base font-medium text-foreground">{phoneNumber}</p>
                    </div>

                    {/* Member Since */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Member Since</span>
                      </div>
                      <p className="text-base font-medium text-foreground">
                        {user.created_at ? formatDate(user.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Calls Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5" />
                Recent Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading recent calls...
                </div>
              ) : audioFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No calls yet. Upload an audio file to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {audioFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileAudio className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {file.filename}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {file.created_at ? formatDate(file.created_at) : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {file.duration_minutes && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {formatDuration(file.duration_minutes)}
                            </p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                        )}
                        {file.sentiment && (
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              file.sentiment === 'Positive' ? 'text-green-600' :
                              file.sentiment === 'Negative' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {file.sentiment}
                            </p>
                            <p className="text-xs text-muted-foreground">Sentiment</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-primary">{audioFiles.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Calls</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-primary">
                    {audioFiles.reduce((sum, file) => sum + (file.duration_minutes || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Minutes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-primary">
                    {audioFiles.filter(f => f.sentiment === 'Positive').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Positive Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}

export default ProfilePage
