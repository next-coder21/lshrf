import { Bell, User, Search, LogOut, Settings, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/store/authSlice';
import { RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface TopBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const TopBar = ({ isOpen, toggleSidebar }: TopBarProps) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {/* Left Section */}
            <div className="flex items-center gap-8">
                <button
                    onClick={toggleSidebar}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-gray-100 group"
                >
                    {isOpen ? (
                        <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    ) : (
                        <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Search Bar */}
                <div className="hidden lg:flex items-center gap-3 bg-gray-50/50 rounded-xl px-4 py-2 w-80 border border-gray-100 focus-within:border-red-200 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-red-500/5 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Intelligence..."
                        className="flex-1 bg-transparent text-xs font-bold text-gray-900 placeholder-gray-400 outline-none uppercase tracking-widest"
                    />
                    <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-black uppercase tracking-tighter">
                        ⌘K
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all border border-gray-100 group">
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all group border border-gray-100"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-red-500/20 border border-white/20">
                            {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="hidden md:block text-left pr-2">
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter leading-tight">
                                {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                                {user?.role ? user.role.replace('_', ' ') : 'Super Admin'}
                            </p>
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-white border border-gray-100">
                            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserMenu(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-20">
                                {/* User Info */}
                                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
                                    <p className="text-sm font-medium text-gray-900">{user?.email || 'admin@lishr.com'}</p>
                                    <p className="text-xs text-gray-600 mt-1">ID: {user?.id?.substring(0, 8) || 'N/A'}</p>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all">
                                        <User className="w-5 h-5" />
                                        <span className="text-sm">My Profile</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all">
                                        <Settings className="w-5 h-5" />
                                        <span className="text-sm">Settings</span>
                                    </button>
                                    <div className="my-2 border-t border-gray-200"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
