import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Phone, MessageSquare, Plus, Loader2, FileAudio, Trash2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfile } from "@/components/user-profile";
import { getUserAudioFiles, deleteAudioFile } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
export function Sidebar({ activeView, setActiveView, onSelectFile, refreshKey, isCollapsed = false, onToggleCollapse, onGoToChat, onGoToProfile }) {
    const { user } = useAuth();
    const [audioFiles, setAudioFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    // Load audio files when user is authenticated or refreshKey changes
    useEffect(() => {
        if (user) {
            loadAudioFiles();
        }
    }, [user, refreshKey]);
    const loadAudioFiles = async () => {
        if (!user)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const files = await getUserAudioFiles();
            setAudioFiles(files);
        }
        catch (err) {
            console.error('Failed to load audio files:', err);
            setError('Failed to load recent calls');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDeleteFile = async (e, fileId) => {
        e.stopPropagation(); // Prevent selecting the file when deleting
        if (!fileId)
            return;
        setDeletingId(fileId);
        try {
            await deleteAudioFile(fileId);
            setAudioFiles(prev => prev.filter(f => f.id !== fileId));
        }
        catch (err) {
            console.error('Failed to delete file:', err);
        }
        finally {
            setDeletingId(null);
        }
    };
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 60)
            return `${diffMins} min ago`;
        if (diffHours < 24)
            return `${diffHours} hours ago`;
        if (diffDays === 1)
            return '1 day ago';
        return `${diffDays} days ago`;
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    return (_jsxs("aside", { className: `${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0`, children: [_jsxs("div", { className: `p-4 border-b border-border ${isCollapsed ? 'flex flex-col items-center' : ''}`, children: [_jsxs("div", { className: `flex items-center ${isCollapsed ? 'flex-col mb-4' : 'justify-between mb-6'}`, children: [_jsxs("div", { className: `flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-3'}`, children: [_jsx("div", { className: "w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Phone, { className: "w-5 h-5 text-primary-foreground" }) }), !isCollapsed && _jsx("h1", { className: "text-lg font-semibold text-foreground", children: "ConvoxAI" })] }), !isCollapsed && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: onToggleCollapse, children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }))] }), isCollapsed && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 mb-2", onClick: onToggleCollapse, children: _jsx(ChevronRight, { className: "w-4 h-4" }) })), _jsxs(Button, { className: "w-full relative group", size: isCollapsed ? "icon" : "sm", variant: "default", onClick: () => {
                            onSelectFile?.(null); // Clear selected file
                            setActiveView("dashboard");
                        }, title: "New Call", children: [_jsx(Plus, { className: `w-4 h-4 ${isCollapsed ? '' : 'mr-2'}` }), !isCollapsed && "New Call"] })] }), _jsxs("div", { className: `px-2 py-4 border-b border-border flex ${isCollapsed ? 'flex-col items-center' : ''} gap-2`, children: [_jsxs("button", { onClick: () => setActiveView("dashboard"), className: `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md text-sm font-medium transition-colors w-full ${activeView === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`, title: "Dashboard", children: [_jsx(Phone, { className: "w-4 h-4 flex-shrink-0" }), !isCollapsed && _jsx("span", { className: "ml-2", children: "Dashboard" })] }), _jsxs("button", { onClick: () => setActiveView("chat"), className: `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md text-sm font-medium transition-colors w-full ${activeView === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`, title: "Chat", children: [_jsx(MessageSquare, { className: "w-4 h-4 flex-shrink-0" }), !isCollapsed && _jsx("span", { className: "ml-2", children: "Chat" })] })] }), _jsxs("div", { className: "flex-1 flex flex-col min-h-0", children: [_jsxs("div", { className: `px-4 py-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`, children: [!isCollapsed && _jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Recent Calls" }), isLoading && _jsx(Loader2, { className: "w-3 h-3 animate-spin text-muted-foreground" })] }), _jsx(ScrollArea, { className: "flex-1", children: error ? (_jsxs("div", { className: "px-4 py-2", children: [!isCollapsed && _jsx("p", { className: "text-xs text-destructive", children: error }), _jsx(Button, { variant: "ghost", size: "sm", onClick: loadAudioFiles, className: `mt-2 w-full text-xs ${isCollapsed ? 'p-1 h-8' : ''}`, children: isCollapsed ? _jsx(Loader2, { className: "w-3 h-3" }) : "Retry" })] })) : audioFiles.length === 0 && !isLoading ? (_jsx("div", { className: "px-4 py-2", children: _jsx("p", { className: "text-xs text-muted-foreground", children: "No calls yet. Upload an audio file to get started!" }) })) : (_jsx("div", { className: "px-2 space-y-1", children: audioFiles.map((file) => (_jsxs("div", { className: `w-full text-left rounded-md hover:bg-muted transition-colors group relative flex items-center ${isCollapsed ? 'justify-center py-2' : 'px-3 py-2.5'}`, children: [_jsx("div", { className: `flex-1 flex items-start ${isCollapsed ? 'justify-center' : 'justify-between min-w-0'} cursor-pointer`, onClick: () => onSelectFile?.(file), title: file.filename, children: !isCollapsed ? (_jsx(_Fragment, { children: _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(FileAudio, { className: "w-3 h-3 text-primary flex-shrink-0" }), _jsx("p", { className: "text-sm font-medium text-foreground truncate group-hover:text-primary", children: file.filename })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: file.created_at ? formatTimeAgo(file.created_at) : 'Unknown' })] }) })) : (_jsx("div", { className: "relative", children: _jsx(FileAudio, { className: "w-4 h-4 text-primary" }) })) }), !isCollapsed && (_jsxs("div", { className: "flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("span", { className: "text-xs text-muted-foreground mr-1", children: formatFileSize(file.file_size) }), _jsx("button", { onClick: (e) => {
                                                    e.stopPropagation();
                                                    onSelectFile?.(file);
                                                    onGoToChat?.();
                                                }, className: "p-1 hover:bg-primary/10 rounded transition-all text-primary", title: "Analyze with AI", children: _jsx(Sparkles, { className: "w-3 h-3" }) }), _jsx("button", { onClick: (e) => file.id && handleDeleteFile(e, file.id), disabled: deletingId === file.id, className: "p-1 hover:bg-destructive/10 rounded transition-all text-destructive", title: "Delete", children: deletingId === file.id ? (_jsx(Loader2, { className: "w-3 h-3 animate-spin" })) : (_jsx(Trash2, { className: "w-3 h-3" })) })] }))] }, file.id))) })) })] }), _jsx("div", { className: `p-4 border-t border-border ${isCollapsed ? 'flex justify-center' : ''}`, children: _jsx(UserProfile, { onGoToProfile: onGoToProfile }) })] }));
}
export default Sidebar;
