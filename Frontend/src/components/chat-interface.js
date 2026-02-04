import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic, Trash2, Loader2, X, FileIcon, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveConversation, getConversationHistory, getConversation, deleteConversation, queryChatbot, addMessagesToConversation, getTranscript } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
export function ChatInterface({ selectedCall, selectedFile }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: selectedFile
                ? `Hi! I'm ConvoBot, your AI call assistant. I can see you're viewing "${selectedFile.filename}". Ask me anything about this call or your other recent calls.`
                : "Hi! I'm ConvoBot, your AI call assistant. Ask me anything about your call summaries, transcripts, or action items.",
        },
    ]);
    const [input, setInput] = useState("");
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    // Load conversation history on mount (only if user is authenticated)
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);
    // Update welcome message when selectedFile changes
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === "assistant") {
            setMessages([{
                    role: "assistant",
                    content: selectedFile
                        ? `Hi! I'm ConvoBot, your AI call assistant. I can see you're viewing "${selectedFile.filename}". Ask me anything about this call or your other recent calls.`
                        : "Hi! I'm ConvoBot, your AI call assistant. Ask me anything about your call summaries, transcripts, or action items.",
                }]);
        }
    }, [selectedFile]);
    const loadConversations = async () => {
        if (!user)
            return; // Don't load if not authenticated
        try {
            const history = await getConversationHistory(20);
            setConversations(history);
        }
        catch (error) {
            console.error('Failed to load conversations:', error);
            // Don't redirect, just log the error
        }
    };
    const loadConversation = async (conversationId) => {
        try {
            const conversation = await getConversation(conversationId);
            setMessages(conversation.messages);
            setCurrentConversationId(conversationId);
        }
        catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };
    const handleFileAttach = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('File size must be less than 50MB');
                return;
            }
            setAttachedFile(file);
        }
    };
    const removeAttachment = () => {
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                setAttachedFile(audioFile);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        }
        catch (error) {
            console.error('Failed to start recording:', error);
            alert('Unable to access microphone. Please grant permission and try again.');
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };
    const handleVoiceInput = () => {
        if (isRecording) {
            stopRecording();
        }
        else {
            startRecording();
        }
    };
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const handleSend = async () => {
        if ((!input.trim() && !attachedFile) || isLoading)
            return;
        const currentAttachment = attachedFile;
        let messageContent = input.trim();
        // Clear input and attachment immediately for better UX
        setInput("");
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsLoading(true);
        try {
            // If there's a voice recording (webm file), transcribe it first
            if (currentAttachment && currentAttachment.name.includes('recording-') && currentAttachment.type.includes('audio')) {
                try {
                    const transcriptData = await getTranscript(currentAttachment);
                    // getTranscript returns string directly
                    messageContent = transcriptData || messageContent || 'Voice message';
                }
                catch (transcriptError) {
                    console.error('Failed to transcribe voice recording:', transcriptError);
                    messageContent = messageContent || '[Voice message - transcription failed]';
                }
            }
            else if (currentAttachment) {
                // For other attachments, just note the file
                messageContent = `${messageContent || 'Attached file'} [File: ${currentAttachment.name}]`;
            }
            const newMessage = {
                role: "user",
                content: messageContent,
            };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            // Get AI response from chatbot API with selected call context
            const response = await queryChatbot(newMessage.content, messages.filter(m => m.role === 'user' || m.role === 'assistant'), 'gemini', selectedFile?.id // Pass the selected call ID for context
            );
            const aiResponse = {
                role: "assistant",
                content: response.answer,
            };
            const messagesWithAI = [...updatedMessages, aiResponse];
            setMessages(messagesWithAI);
            // Save only the new messages (user + AI response) to conversation
            await saveCurrentConversation([newMessage, aiResponse]);
        }
        catch (error) {
            console.error('Failed to get AI response:', error);
            const errorResponse = {
                role: "assistant",
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
            };
            const userMsg = { role: "user", content: messageContent || input };
            const updatedMessages = [...messages, userMsg];
            const messagesWithError = [...updatedMessages, errorResponse];
            setMessages(messagesWithError);
        }
        finally {
            setIsLoading(false);
        }
    };
    const saveCurrentConversation = async (newMessages) => {
        if (!user || newMessages.length === 0)
            return;
        setIsSaving(true);
        try {
            if (currentConversationId) {
                // Conversation exists, just add the new messages
                await addMessagesToConversation(currentConversationId, newMessages);
            }
            else {
                // New conversation - save with all messages including welcome
                const allMessages = messages.concat(newMessages.filter(m => !messages.includes(m)));
                // Generate title from first user message
                const firstUserMessage = allMessages.find(m => m.role === 'user');
                const title = firstUserMessage
                    ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
                    : 'New Conversation';
                const saved = await saveConversation(title, allMessages);
                setCurrentConversationId(saved.id);
                // Reload conversations to show the new one
                await loadConversations();
            }
        }
        catch (error) {
            console.error('Failed to save conversation:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDeleteConversation = async (conversationId) => {
        try {
            await deleteConversation(conversationId);
            await loadConversations();
            // If we deleted the current conversation, reset
            if (conversationId === currentConversationId) {
                setMessages([{
                        role: "assistant",
                        content: selectedFile
                            ? `Hi! I'm ConvoBot, your AI call assistant. I can see you're viewing "${selectedFile.filename}". Ask me anything about this call or your other recent calls.`
                            : "Hi! I'm ConvoBot, your AI call assistant. Ask me anything about your call summaries, transcripts, or action items.",
                    }]);
                setCurrentConversationId(null);
            }
        }
        catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };
    const startNewConversation = () => {
        setMessages([{
                role: "assistant",
                content: selectedFile
                    ? `Hi! I'm ConvoBot, your AI call assistant. I can see you're viewing "${selectedFile.filename}". Ask me anything about this call or your other recent calls.`
                    : "Hi! I'm ConvoBot, your AI call assistant. Ask me anything about your call summaries, transcripts, or action items.",
            }]);
        setCurrentConversationId(null);
    };
    return (_jsxs("div", { className: "flex-1 flex h-full overflow-hidden", children: [_jsxs("div", { className: "w-64 border-r border-border flex flex-col overflow-hidden flex-shrink-0", children: [_jsx("div", { className: "p-4 border-b border-border", children: _jsx(Button, { onClick: startNewConversation, className: "w-full", size: "sm", children: "New Conversation" }) }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "p-2 space-y-1", children: conversations.map((conv) => (_jsx("div", { className: `group p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${currentConversationId === conv.id ? 'bg-muted' : ''}`, children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0 overflow-hidden", onClick: () => loadConversation(conv.id), children: [_jsx("p", { className: "text-sm font-medium text-foreground truncate max-w-[180px]", children: conv.title.length > 25 ? conv.title.substring(0, 25) + '...' : conv.title }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [conv.message_count, " messages"] })] }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0", onClick: (e) => {
                                                e.stopPropagation();
                                                handleDeleteConversation(conv.id);
                                            }, children: _jsx(Trash2, { className: "h-3 w-3" }) })] }) }, conv.id))) }) })] }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("div", { className: "border-b border-border p-6", children: [_jsx("h2", { className: "text-xl font-bold text-foreground", children: "ConvoBot" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: selectedFile ? `Viewing: ${selectedFile.filename}` : isLoading ? 'AI is thinking...' : isSaving ? 'Saving...' : 'Your AI call assistant' })] }), _jsx(ScrollArea, { className: "flex-1 p-6", children: _jsxs("div", { className: "space-y-4 max-w-2xl mx-auto", children: [messages.map((message, index) => (_jsx("div", { className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-md px-4 py-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`, children: [_jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: message.content }), message.created_at && (_jsx("p", { className: `text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`, children: new Date(message.created_at).toLocaleTimeString() }))] }) }, index))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "max-w-md px-4 py-3 rounded-lg bg-muted text-foreground", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { className: "text-sm", children: "Thinking..." })] }) }) }))] }) }), _jsx("div", { className: "border-t border-border p-6", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [attachedFile && (_jsxs("div", { className: "mb-3 flex items-center gap-2 p-2 bg-muted rounded-md", children: [_jsx(FileIcon, { className: "w-4 h-4 text-primary" }), _jsx("span", { className: "text-sm flex-1 truncate", children: attachedFile.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [(attachedFile.size / 1024 / 1024).toFixed(2), " MB"] }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: removeAttachment, children: _jsx(X, { className: "w-3 h-3" }) })] })), isRecording && (_jsxs("div", { className: "mb-3 flex items-center gap-2 p-2 bg-red-500/10 rounded-md", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-red-600 font-medium", children: "Recording..." }), _jsx("span", { className: "text-sm text-red-600", children: formatDuration(recordingDuration) })] })), _jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "audio/*,.pdf,.doc,.docx,.txt", className: "hidden" }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-primary", onClick: handleFileAttach, disabled: isRecording, children: _jsx(Paperclip, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 flex gap-2", children: [_jsx(Input, { placeholder: isRecording ? "Recording in progress..." : "Ask about the call...", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === "Enter" && !isRecording && handleSend(), className: "bg-muted border-0 text-foreground placeholder:text-muted-foreground", disabled: isRecording }), _jsx(Button, { variant: "ghost", size: "icon", className: `${isRecording ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground hover:text-primary'}`, onClick: handleVoiceInput, children: isRecording ? _jsx(MicOff, { className: "w-4 h-4" }) : _jsx(Mic, { className: "w-4 h-4" }) })] }), _jsx(Button, { onClick: handleSend, disabled: (!input.trim() && !attachedFile) || isSaving || isLoading || isRecording, className: "bg-primary text-primary-foreground hover:bg-primary/90", children: isLoading ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Send, { className: "w-4 h-4" }) })] })] }) })] })] }));
}
export default ChatInterface;
