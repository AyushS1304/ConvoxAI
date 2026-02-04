import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
export function LoginForm({ onToggleForm }) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) {
            setError(error.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
        else {
            // Success - clear form
            setEmail('');
            setPassword('');
            // Loading state will be cleared by redirect
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", children: "Welcome Back" }), _jsx("p", { className: "text-muted-foreground", children: "Sign in to your ConvoxAI account" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Signing in..."] })) : ('Sign In') })] }), _jsxs("div", { className: "text-center text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Don't have an account? " }), _jsx("button", { onClick: onToggleForm, className: "text-primary hover:underline font-medium", type: "button", children: "Sign up" })] })] }));
}
