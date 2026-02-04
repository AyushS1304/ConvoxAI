import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { AuthPage } from './components/auth/auth-page';
import { ProtectedRoute } from './components/protected-route';
import CallSummarizer from "./components/call-summarizer";
import { PublicRoute } from './components/public-route';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/auth", element: _jsx(PublicRoute, { children: _jsx(AuthPage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx("main", { className: "h-screen bg-background", children: _jsx(CallSummarizer, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/auth", replace: true }) })] }) }) }));
}
export default App;
