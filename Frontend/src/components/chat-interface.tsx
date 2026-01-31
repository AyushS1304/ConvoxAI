import { useState, useEffect } from "react"
import { Send, Paperclip, Mic, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { saveConversation, getConversationHistory, getConversation, deleteConversation, queryChatbot, addMessagesToConversation, type ChatMessage, type ConversationListItem } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface ChatInterfaceProps {
  selectedCall: string | null
}

export function ChatInterface({ selectedCall }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Call Analysis Assistant. Ask me anything about the recent call summary, transcripts, or action items.",
    },
  ])
  const [input, setInput] = useState("")
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load conversation history on mount (only if user is authenticated)
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return // Don't load if not authenticated
    
    try {
      const history = await getConversationHistory(20)
      setConversations(history)
    } catch (error) {
      console.error('Failed to load conversations:', error)
      // Don't redirect, just log the error
    }
  }


  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId)
      setMessages(conversation.messages)
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const newMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Get AI response from chatbot API
      const response = await queryChatbot(
        input,
        messages.filter(m => m.role === 'user' || m.role === 'assistant'),
        'gemini'
      )

      const aiResponse: ChatMessage = {
        role: "assistant",
        content: response.answer,
      }
      const messagesWithAI = [...updatedMessages, aiResponse]
      setMessages(messagesWithAI)

      // Save only the new messages (user + AI response) to conversation
      await saveCurrentConversation([newMessage, aiResponse])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorResponse: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
      }
      const messagesWithError = [...updatedMessages, errorResponse]
      setMessages(messagesWithError)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentConversation = async (newMessages: ChatMessage[]) => {
    if (!user || newMessages.length === 0) return

    setIsSaving(true)
    try {
      if (currentConversationId) {
        // Conversation exists, just add the new messages
        await addMessagesToConversation(currentConversationId, newMessages)
      } else {
        // New conversation - save with all messages including welcome
        const allMessages = messages.concat(newMessages.filter(m => !messages.includes(m)))
        
        // Generate title from first user message
        const firstUserMessage = allMessages.find(m => m.role === 'user')
        const title = firstUserMessage 
          ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
          : 'New Conversation'

        const saved = await saveConversation(title, allMessages)
        setCurrentConversationId(saved.id)
        
        // Reload conversations to show the new one
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to save conversation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
      await loadConversations()
      
      // If we deleted the current conversation, reset
      if (conversationId === currentConversationId) {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm your Call Analysis Assistant. Ask me anything about the recent call summary, transcripts, or action items.",
        }])
        setCurrentConversationId(null)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const startNewConversation = () => {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm your Call Analysis Assistant. Ask me anything about the recent call summary, transcripts, or action items.",
    }])
    setCurrentConversationId(null)
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Conversation History Sidebar */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={startNewConversation} className="w-full" size="sm">
            New Conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  currentConversationId === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0" onClick={() => loadConversation(conv.id)}>
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.message_count} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConversation(conv.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h2 className="text-xl font-bold text-foreground">Call Analysis Chat</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'AI is thinking...' : isSaving ? 'Saving...' : 'Ask questions about your calls'}
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {message.created_at && (
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-md px-4 py-3 rounded-lg bg-muted text-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Ask about the call..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="bg-muted border-0 text-foreground placeholder:text-muted-foreground"
                />
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSaving || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ChatInterface