import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Phone, Mail, User, Calendar, FileAudio, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { getUserAudioFiles } from "@/lib/api";
export function ProfilePage({ onBack }) {
    const { user } = useAuth();
    const [audioFiles, setAudioFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (user) {
            loadRecentCalls();
        }
    }, [user]);
    const loadRecentCalls = async () => {
        setIsLoading(true);
        try {
            const files = await getUserAudioFiles();
            setAudioFiles(files.slice(0, 5)); // Get 5 most recent calls
        }
        catch (error) {
            console.error('Failed to load recent calls:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!user)
        return null;
    const initials = user.email
        ?.split('@')[0]
        .substring(0, 2)
        .toUpperCase() || 'U';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const phoneNumber = user.user_metadata?.phone || user.phone || 'Not provided';
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatDuration = (minutes) => {
        if (!minutes)
            return 'N/A';
        if (minutes < 60)
            return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col h-full overflow-hidden bg-background", children: [_jsx("div", { className: "border-b border-border p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: onBack, children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Profile" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your account settings" })] })] }) }), _jsx(ScrollArea, { className: "flex-1 p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Personal Information" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-start gap-6", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Avatar, { className: "h-24 w-24", children: _jsx(AvatarFallback, { className: "bg-primary text-primary-foreground text-2xl", children: initials }) }) }), _jsx("div", { className: "flex-1 space-y-4", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { children: "Full Name" })] }), _jsx("p", { className: "text-base font-medium text-foreground", children: fullName })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Mail, { className: "w-4 h-4" }), _jsx("span", { children: "Email Address" })] }), _jsx("p", { className: "text-base font-medium text-foreground", children: user.email })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Phone, { className: "w-4 h-4" }), _jsx("span", { children: "Phone Number" })] }), _jsx("p", { className: "text-base font-medium text-foreground", children: phoneNumber })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsx("span", { children: "Member Since" })] }), _jsx("p", { className: "text-base font-medium text-foreground", children: user.created_at ? formatDate(user.created_at) : 'N/A' })] })] }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileAudio, { className: "w-5 h-5" }), "Recent Calls"] }) }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading recent calls..." })) : audioFiles.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No calls yet. Upload an audio file to get started!" })) : (_jsx("div", { className: "space-y-3", children: audioFiles.map((file) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(FileAudio, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-foreground truncate", children: file.filename }), _jsx("p", { className: "text-sm text-muted-foreground", children: file.created_at ? formatDate(file.created_at) : 'Unknown date' })] })] }), _jsxs("div", { className: "flex items-center gap-4 flex-shrink-0", children: [file.duration_minutes && (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium text-foreground", children: formatDuration(file.duration_minutes) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Duration" })] })), file.sentiment && (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: `text-sm font-medium ${file.sentiment === 'Positive' ? 'text-green-600' :
                                                                        file.sentiment === 'Negative' ? 'text-red-600' :
                                                                            'text-yellow-600'}`, children: file.sentiment }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Sentiment" })] }))] })] }, file.id))) })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Account Statistics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { className: "text-center p-4 rounded-lg bg-muted", children: [_jsx("p", { className: "text-3xl font-bold text-primary", children: audioFiles.length }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Total Calls" })] }), _jsxs("div", { className: "text-center p-4 rounded-lg bg-muted", children: [_jsx("p", { className: "text-3xl font-bold text-primary", children: audioFiles.reduce((sum, file) => sum + (file.duration_minutes || 0), 0) }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Total Minutes" })] }), _jsxs("div", { className: "text-center p-4 rounded-lg bg-muted", children: [_jsx("p", { className: "text-3xl font-bold text-primary", children: audioFiles.filter(f => f.sentiment === 'Positive').length }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Positive Calls" })] })] }) })] })] }) })] }));
}
export default ProfilePage;
