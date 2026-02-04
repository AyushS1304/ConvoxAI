import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { ChatInterface } from "@/components/chat-interface";
import { ProfilePage } from "@/components/profile-page";
export function CallSummarizer() {
    const [selectedCall, setSelectedCall] = useState(null);
    const [activeView, setActiveView] = useState("dashboard");
    const [selectedFile, setSelectedFile] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const handleSelectFile = useCallback((file) => {
        setSelectedFile(file);
        setActiveView("dashboard");
    }, []);
    const handleRefreshSidebar = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);
    const handleClearSelectedFile = useCallback(() => {
        setSelectedFile(null);
    }, []);
    const handleGoToChat = useCallback(() => {
        setActiveView("chat");
    }, []);
    const handleGoToProfile = useCallback(() => {
        setActiveView("profile");
    }, []);
    const handleBackFromProfile = useCallback(() => {
        setActiveView("dashboard");
    }, []);
    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);
    return (_jsxs("div", { className: "flex h-screen w-screen overflow-hidden bg-background", children: [_jsx(Sidebar, { activeView: activeView, setActiveView: setActiveView, onSelectFile: handleSelectFile, refreshKey: refreshKey, isCollapsed: isSidebarCollapsed, onToggleCollapse: toggleSidebar, onGoToChat: handleGoToChat, onGoToProfile: handleGoToProfile }), _jsx("div", { className: "flex-1 flex flex-col overflow-hidden", children: activeView === "dashboard" ? (_jsx(Dashboard, { selectedCall: selectedCall, setSelectedCall: setSelectedCall, selectedFile: selectedFile, onClearSelectedFile: handleClearSelectedFile, onRefreshSidebar: handleRefreshSidebar, onGoToChat: handleGoToChat })) : activeView === "chat" ? (_jsx(ChatInterface, { selectedCall: selectedCall, selectedFile: selectedFile })) : (_jsx(ProfilePage, { onBack: handleBackFromProfile })) })] }));
}
export default CallSummarizer;
