import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/api/axiosInstance';
import { setCredentials } from '../store/authSlice';
import { Mail, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { token, userId, email: userEmail, role, firstName, lastName, tenantId, permissions } = response.data;

            dispatch(setCredentials({
                user: { id: userId, email: userEmail, role, firstName, lastName, tenantId, permissions: permissions || [] },
                token
            }));
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">

            {/* LEFT SIDE - LOGIN FORM */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-20 relative z-10 bg-white">
                <div className="max-w-md mx-auto w-full">

                    {/* Logo & Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="LisHR Logo" className="w-12 h-12 object-contain" />
                            <span className="text-2xl font-bold text-gray-900">LisHR</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back!</h1>
                        <p className="text-gray-500 text-lg">Enter your credentials to access your account.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl text-center border border-red-100 font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-base rounded-2xl focus:ring-red-500 focus:border-red-500 block w-full p-4 pl-5 outline-none transition-all focus:bg-white focus:shadow-md hover:bg-white"
                                    placeholder="admin@lishr.com"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-base rounded-2xl focus:ring-red-500 focus:border-red-500 block w-full p-4 pl-5 outline-none transition-all focus:bg-white focus:shadow-md hover:bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer group-focus-within:text-red-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-sm px-1">
                            <label className="flex items-center cursor-pointer select-none group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                                <span className="ml-2 text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                            </label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-2xl text-lg px-5 py-4 text-center shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm">© 2026 LisHR. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - ARTWORK */}
            <div className="hidden md:block w-1/2 relative bg-black overflow-hidden">
                {/* Liquid Fire Abstract Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-orange-900">
                    {/* CSS patterns to mimic the wavy liquid look */}
                    <div className="absolute inset-0 opacity-80 mix-blend-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500 via-red-600 to-transparent blur-3xl scale-150 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-red-600 via-orange-900 to-transparent blur-2xl opacity-60"></div>

                    {/* SVG Waves for the liquid effect */}
                    <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise)" />
                    </svg>

                    {/* Curvy Lines Overlay */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23FF0000\' fill-opacity=\'0.1\' d=\'M38.6,-49.8C50.5,-38.3,60.8,-27.1,64.9,-13.6C69,0,66.9,15.8,58.8,29.9C50.8,44,36.8,56.3,21.3,62.8C5.8,69.3,-11.2,70,-26.8,64.1C-42.3,58.2,-56.3,45.7,-64.1,29.9C-71.9,14.1,-73.4,-5,-66.6,-20.9C-59.8,-36.8,-44.7,-49.5,-30.3,-59.4C-15.9,-69.3,2,-76.4,13.8,-76.2C25.6,-76,38.6,-68.5,38.6,-49.8Z\' transform=\'translate(100 100)\' /%3E%3C/svg%3E")',
                        backgroundSize: '150%',
                        backgroundPosition: 'center',
                        filter: 'blur(40px) contrast(150%)'
                    }}></div>
                </div>

                {/* Glass Footer Card - Updated info */}
                <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-sm shadow-2xl">
                    <p className="font-medium text-white mb-2">Enterprise Access</p>
                    <p className="text-white/60 text-xs leading-relaxed">
                        Authorized personnel only. Access to this system is monitored.
                        By logging in, you agree to the organization's security policies and terms of use.
                    </p>
                </div>
            </div>
        </div>
    );
};
