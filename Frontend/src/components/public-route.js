import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
export function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
