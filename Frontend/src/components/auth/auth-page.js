import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Authentication Page
 *
 * Main authentication page that toggles between login and signup forms.
 */
import { useState } from 'react';
import { LoginForm } from './login-form';
import { SignUpForm } from './signup-form';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Phone } from 'lucide-react';
export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4", children: [_jsx("div", { className: "absolute top-4 right-4", children: _jsx(AnimatedThemeToggler, {}) }), _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary shadow-lg mb-4", children: _jsx(Phone, { className: "w-8 h-8 text-primary-foreground" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "ConvoxAI" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "AI-Powered Call Summarization" })] }), _jsx(Card, { className: "backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl", children: _jsx(CardContent, { className: "pt-6", children: isLogin ? (_jsx(LoginForm, { onToggleForm: () => setIsLogin(false) })) : (_jsx(SignUpForm, { onToggleForm: () => setIsLogin(true) })) }) }), _jsx("p", { className: "text-center text-sm text-gray-600 dark:text-gray-400 mt-6", children: "By continuing, you agree to our Terms of Service and Privacy Policy" })] })] }));
}
