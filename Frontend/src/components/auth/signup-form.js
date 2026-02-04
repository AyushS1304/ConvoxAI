import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Sign Up Form Component
 *
 * Provides a beautiful sign up form with email, password, and name inputs.
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
export function SignUpForm({ onToggleForm }) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const { error } = await signUp(email, password, fullName);
        if (error) {
            setError(error.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
        else {
            setSuccess(true);
            setLoading(false);
            // Auto-switch to login after 2 seconds
            setTimeout(() => {
                onToggleForm();
            }, 2000);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", children: "Create Account" }), _jsx("p", { className: "text-muted-foreground", children: "Join ConvoxAI and start summarizing calls" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), success && (_jsx(Alert, { className: "bg-green-50 text-green-900 border-green-200", children: _jsx(AlertDescription, { children: "Account created successfully! Redirecting to login..." }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fullName", children: "Full Name (Optional)" }), _jsx(Input, { id: "fullName", type: "text", placeholder: "John Doe", value: fullName, onChange: (e) => setFullName(e.target.value), disabled: loading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-email", children: "Email" }), _jsx(Input, { id: "signup-email", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-password", children: "Password" }), _jsx(Input, { id: "signup-password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading, minLength: 6 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }), _jsx(Input, { id: "confirm-password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, disabled: loading, minLength: 6 })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading || success, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Creating account..."] })) : success ? ('Account created!') : ('Sign Up') })] }), _jsxs("div", { className: "text-center text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Already have an account? " }), _jsx("button", { onClick: onToggleForm, className: "text-primary hover:underline font-medium", type: "button", children: "Sign in" })] })] }));
}
