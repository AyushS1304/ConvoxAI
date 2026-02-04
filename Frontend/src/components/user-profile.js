import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
export function UserProfile({ onGoToProfile }) {
    const { user, signOut } = useAuth();
    if (!user)
        return null;
    const initials = user.email
        ?.split('@')[0]
        .substring(0, 2)
        .toUpperCase() || 'U';
    const fullName = user.user_metadata?.full_name || user.email;
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-10 w-10 rounded-full", children: _jsx(Avatar, { className: "h-10 w-10", children: _jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: initials }) }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: fullName }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "cursor-pointer", onClick: onGoToProfile, children: [_jsx(User, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Profile" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "cursor-pointer text-red-600 focus:text-red-600", onClick: signOut, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Log out" })] })] })] }));
}
