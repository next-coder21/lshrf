import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '@/lib/api/axiosInstance';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axiosInstance.post('/auth/reset-password', { token, newPassword });
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Reset failed. The link may be expired or already used.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <p className="text-red-600 font-semibold">Invalid or missing reset token.</p>
                    <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-20 relative z-10 bg-white">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-lg">L</div>
                            <span className="text-2xl font-bold text-gray-900">LisHR</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Set New Password</h1>
                        <p className="text-gray-500 text-lg">Choose a strong password for your account.</p>
                    </div>

                    {done ? (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                                <p className="text-gray-500 text-sm">
                                    Your password has been reset successfully. Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl text-center border border-red-100 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-base rounded-2xl focus:ring-red-500 focus:border-red-500 block p-4 pl-5 outline-none transition-all focus:bg-white focus:shadow-md"
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-base rounded-2xl focus:ring-red-500 focus:border-red-500 block p-4 pl-5 outline-none transition-all focus:bg-white focus:shadow-md"
                                    placeholder="Repeat your password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-bold rounded-2xl text-lg px-5 py-4 text-center shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Updating...
                                    </span>
                                ) : 'Reset Password'}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="hidden md:block w-1/2 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-orange-900">
                    <div className="absolute inset-0 opacity-80 mix-blend-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500 via-red-600 to-transparent blur-3xl scale-150"></div>
                </div>
                <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-sm shadow-2xl">
                    <p className="font-medium text-white mb-2">Password Security Tips</p>
                    <p className="text-white/60 text-xs leading-relaxed">
                        Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols for a strong password.
                    </p>
                </div>
            </div>
        </div>
    );
};
