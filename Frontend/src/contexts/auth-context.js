import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    // ✅ Load session on refresh + listen to changes
    useEffect(() => {
        const initSession = async () => {
            const { data: { session }, } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };
        initSession();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);
    // ✅ Sign Up
    const signUp = async (email, password, fullName) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error)
                throw error;
            return { error: null };
        }
        catch (error) {
            console.error("Sign up error:", error);
            return { error: error };
        }
    };
    // ✅ Sign In (force state update)
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
            // 🔥 force update state (important after logout)
            setSession(data.session);
            setUser(data.user);
            return { error: null };
        }
        catch (error) {
            console.error("Sign in error:", error);
            return { error: error };
        }
    };
    // ✅ Sign Out (FULL RESET)
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            // 🔥 IMPORTANT: clear React state manually
            setSession(null);
            setUser(null);
        }
        catch (error) {
            console.error("Sign out error:", error);
        }
    };
    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
