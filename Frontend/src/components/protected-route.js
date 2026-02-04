import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
export function ProtectedRoute({ children }) {
    const { session, loading } = useAuth();
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen flex items-center justify-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin mx-auto text-blue-600" }), _jsx("p", { className: "text-muted-foreground", children: "Loading..." })] }));
    }
    if (!session) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
