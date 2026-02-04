import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Play, Pause, Download, Share2, Upload, FileAudio, X, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { summarizeAudio, uploadAudioFile, updateFileSummary, getSignedAudioUrl } from "@/lib/api";
import { jsPDF } from "jspdf";
export function Dashboard({ selectedCall, setSelectedCall, selectedFile: selectedAudioFile, onClearSelectedFile, onRefreshSidebar, onGoToChat }) {
    const [summaryData, setSummaryData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFileMetadata, setUploadedFileMetadata] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);
    const prevSelectedAudioFile = useRef(undefined);
    // Load selected file data from sidebar OR clear when null
    useEffect(() => {
        if (selectedAudioFile && selectedAudioFile.summary) {
            setSummaryData({
                summary: selectedAudioFile.summary,
                transcript: selectedAudioFile.transcript || undefined,
                key_aspects: selectedAudioFile.key_aspects || [],
                duration_minutes: selectedAudioFile.duration_minutes || 0,
                no_of_participants: selectedAudioFile.no_of_participants || 0,
                sentiment: selectedAudioFile.sentiment || undefined
            });
            setUploadedFileMetadata(selectedAudioFile);
        }
        else if (selectedAudioFile === null && prevSelectedAudioFile.current !== undefined) {
            // Clear state when New Call is clicked (selectedAudioFile changed from something to null)
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
            setSummaryData(null);
            setUploadedFileMetadata(null);
            setSelectedFile(null);
            setError(null);
        }
        prevSelectedAudioFile.current = selectedAudioFile;
    }, [selectedAudioFile]);
    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
    const allowedMimeTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/ogg'];
    // Play/Pause audio
    const handlePlayAudio = async () => {
        if (!uploadedFileMetadata?.id)
            return;
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }
        try {
            setIsLoadingAudio(true);
            const signedUrl = await getSignedAudioUrl(uploadedFileMetadata.id);
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(signedUrl);
            audioRef.current = audio;
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => {
                setIsPlaying(false);
                setError('Failed to play audio');
            };
            await audio.play();
            setIsPlaying(true);
        }
        catch (err) {
            console.error('Failed to play audio:', err);
            setError('Failed to play audio');
        }
        finally {
            setIsLoadingAudio(false);
        }
    };
    // Download PDF report
    const handleDownloadPDF = () => {
        if (!summaryData || !uploadedFileMetadata)
            return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;
        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Call Summary Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        // File info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`File: ${uploadedFileMetadata.filename}`, 20, yPos);
        yPos += 6;
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
        yPos += 15;
        // Summary section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Summary', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(summaryData.summary, pageWidth - 40);
        doc.text(summaryLines, 20, yPos);
        yPos += summaryLines.length * 5 + 10;
        // Stats
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Call Statistics', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Duration: ${summaryData.duration_minutes || 0} minutes`, 20, yPos);
        yPos += 6;
        doc.text(`Participants: ${summaryData.no_of_participants || 0}`, 20, yPos);
        yPos += 6;
        doc.text(`Sentiment: ${summaryData.sentiment || 'N/A'}`, 20, yPos);
        yPos += 12;
        // Key Aspects
        if (summaryData.key_aspects && summaryData.key_aspects.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Discussion Points', 20, yPos);
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            summaryData.key_aspects.forEach((aspect, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const aspectLines = doc.splitTextToSize(`• ${aspect}`, pageWidth - 45);
                doc.text(aspectLines, 25, yPos);
                yPos += aspectLines.length * 5 + 3;
            });
            yPos += 5;
        }
        // Transcript
        if (summaryData.transcript) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Transcript', 20, yPos);
            yPos += 8;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const transcriptLines = doc.splitTextToSize(summaryData.transcript, pageWidth - 40);
            transcriptLines.forEach((line) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, 20, yPos);
                yPos += 5;
            });
        }
        // Save
        const fileName = uploadedFileMetadata.filename.replace(/\.[^/.]+$/, '');
        doc.save(`${fileName}_report.pdf`);
    };
    // Share functionality
    const handleShare = async () => {
        if (!summaryData || !uploadedFileMetadata)
            return;
        const shareText = `📞 Call Summary: ${uploadedFileMetadata.filename}\n\n` +
            `📝 Summary:\n${summaryData.summary}\n\n` +
            `⏱️ Duration: ${summaryData.duration_minutes || 0} min | 👥 Participants: ${summaryData.no_of_participants || 0}\n` +
            `💬 Sentiment: ${summaryData.sentiment || 'N/A'}\n\n` +
            (summaryData.key_aspects && summaryData.key_aspects.length > 0
                ? `🔑 Key Points:\n${summaryData.key_aspects.map(a => `• ${a}`).join('\n')}`
                : '');
        // Try Web Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Call Summary: ${uploadedFileMetadata.filename}`,
                    text: shareText
                });
                return;
            }
            catch (err) {
                // User cancelled or share failed, fallback to clipboard
            }
        }
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            // Show a temporary success message (you could use a toast here)
            alert('Summary copied to clipboard!');
        }
        catch (err) {
            console.error('Failed to copy:', err);
            setError('Failed to share');
        }
    };
    const handleFileSelect = (file) => {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(fileExtension) && !allowedMimeTypes.includes(file.type)) {
            setError(`Invalid file format. Supported formats: ${allowedExtensions.join(', ')}`);
            return;
        }
        setSelectedFile(file);
        setError(null);
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleUpload = async () => {
        if (!selectedFile)
            return;
        setIsUploading(true);
        setError(null);
        try {
            // First, upload to storage
            const uploadResponse = await uploadAudioFile(selectedFile);
            // Convert to metadata format for display
            const metadata = {
                id: uploadResponse.file_id,
                filename: uploadResponse.filename,
                storage_url: uploadResponse.storage_url,
                file_size: selectedFile.size,
                created_at: new Date().toISOString()
            };
            setUploadedFileMetadata(metadata);
            // Then, summarize the audio
            const response = await summarizeAudio(selectedFile);
            setSummaryData(response);
            // Save summary data to database
            await updateFileSummary(uploadResponse.file_id, {
                summary: response.summary,
                transcript: response.transcript,
                key_aspects: response.key_aspects,
                duration_minutes: response.duration_minutes,
                no_of_participants: response.no_of_participants,
                sentiment: response.sentiment
            });
            // Refresh sidebar to show new file
            onRefreshSidebar?.();
            setSelectedFile(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process audio file');
        }
        finally {
            setIsUploading(false);
        }
    };
    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleNewUpload = () => {
        // Stop any playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setSummaryData(null);
        setUploadedFileMetadata(null);
        setSelectedFile(null);
        setError(null);
        onClearSelectedFile?.();
    };
    return (_jsx("div", { className: "flex-1 h-full overflow-hidden flex flex-col", children: _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "p-8 min-h-0", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-foreground mb-2", children: "Call Summary" }), _jsx("p", { className: "text-muted-foreground", children: summaryData ? 'Analysis Complete' : 'Upload an audio file to get started' })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(AnimatedThemeToggler, { className: "pr-4" }), summaryData && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", size: "icon", onClick: handlePlayAudio, disabled: isLoadingAudio || !uploadedFileMetadata?.id, title: isPlaying ? "Pause" : "Play", children: isLoadingAudio ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : isPlaying ? (_jsx(Pause, { className: "w-4 h-4" })) : (_jsx(Play, { className: "w-4 h-4" })) }), _jsx(Button, { variant: "outline", size: "icon", onClick: handleDownloadPDF, title: "Download PDF Report", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: handleShare, title: "Share Summary", children: _jsx(Share2, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => onGoToChat?.(), title: "Analyze with AI", children: _jsx(Sparkles, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(MoreVertical, { className: "w-4 h-4" }) })] }))] })] }), !summaryData && (_jsx(Card, { className: "mb-8 bg-card border-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50'}`, children: [_jsx(FileAudio, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-semibold mb-2 text-foreground", children: "Upload Audio File" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Drag and drop your audio file here, or click to browse" }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Supported formats: WAV, MP3, M4A, FLAC, OGG" }), _jsx("input", { ref: fileInputRef, type: "file", accept: allowedExtensions.join(','), onChange: handleFileChange, className: "hidden" }), _jsxs(Button, { onClick: () => fileInputRef.current?.click(), variant: "outline", disabled: isUploading, children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Select File"] })] }), selectedFile && (_jsxs("div", { className: "mt-4 p-4 bg-muted rounded-lg flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileAudio, { className: "w-5 h-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-foreground", children: selectedFile.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleUpload, disabled: isUploading, size: "sm", children: isUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : ('Upload & Analyze') }), _jsx(Button, { onClick: clearFile, disabled: isUploading, variant: "ghost", size: "sm", children: _jsx(X, { className: "w-4 h-4" }) })] })] })), error && (_jsx("div", { className: "mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg", children: _jsx("p", { className: "text-sm text-destructive", children: error }) }))] }) })), summaryData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-4 gap-4 mb-8", children: [_jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Duration" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: summaryData.duration_minutes }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "minutes" })] }) }), _jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Participants" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: summaryData.no_of_participants }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "people" })] }) }), _jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Sentiment" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: summaryData.sentiment || 'N/A' }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "overall mood" })] }) }), _jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-2", children: "Key Topics" }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: summaryData.key_aspects?.length || 0 }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "identified" })] }) })] }), _jsxs(Tabs, { defaultValue: "summary", className: "w-full", children: [_jsxs(TabsList, { className: "bg-muted mb-6", children: [_jsx(TabsTrigger, { value: "summary", children: "Summary" }), _jsx(TabsTrigger, { value: "transcript", children: "Transcript" }), _jsx(TabsTrigger, { value: "insights", children: "Key Insights" })] }), _jsxs(TabsContent, { value: "summary", className: "space-y-4", children: [_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Executive Summary" }) }), _jsx(CardContent, { className: "text-sm text-foreground leading-relaxed space-y-3", children: _jsx("p", { children: summaryData.summary }) })] }), uploadedFileMetadata && (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Uploaded File" }) }), _jsxs(CardContent, { className: "text-sm space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileAudio, { className: "w-4 h-4 text-primary" }), _jsx("p", { className: "font-medium text-foreground", children: uploadedFileMetadata.filename })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Size: ", (uploadedFileMetadata.file_size / 1024 / 1024).toFixed(2), " MB"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Uploaded: ", uploadedFileMetadata.created_at ? new Date(uploadedFileMetadata.created_at).toLocaleString() : 'Unknown'] })] })] })), _jsxs(Button, { onClick: handleNewUpload, variant: "outline", className: "w-full", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Upload Another File"] })] }), _jsx(TabsContent, { value: "transcript", className: "space-y-4", children: _jsx(Card, { className: "bg-card border-border", children: _jsx(CardContent, { className: "pt-6", children: _jsx("div", { className: "space-y-4 text-sm", children: _jsx("p", { className: "text-foreground whitespace-pre-wrap", children: summaryData.transcript || 'Transcript not available' }) }) }) }) }), _jsx(TabsContent, { value: "insights", className: "space-y-3", children: summaryData.key_aspects && summaryData.key_aspects.length > 0 ? (summaryData.key_aspects.map((topic, i) => (_jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "pt-6 flex items-start gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" }), _jsx("p", { className: "text-sm text-foreground", children: topic })] }) }, i)))) : (_jsx(Card, { className: "bg-card border-border", children: _jsx(CardContent, { className: "pt-6", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No key topics identified" }) }) })) })] })] }))] }) }) }));
}
export default Dashboard;
