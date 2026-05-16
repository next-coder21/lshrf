import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axiosInstance from '@/lib/api/axiosInstance';
import { User, Lock, Save, Camera, Mail, Phone, Shield, Briefcase, Building2, Calendar, DollarSign, BadgeCheck } from 'lucide-react';
import clsx from 'clsx';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { Employee } from '@/features/employees/types/employee.types';

export const ProfilePage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);

    const hasPermission = (perm: string) => (user?.permissions || []).includes(perm);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get(`/users/${user?.id}`);
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneNumber: data.phoneNumber || ''
                }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        if (user?.id) fetchProfile();
        employeeApi.getMe().then(setEmployeeData);
    }, [user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosInstance.put('/users/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess('Profile updated successfully');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile. Check your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                    My <span className="text-red-600">Profile</span>
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ID Card Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-600 to-orange-600 opacity-90"></div>
                        <div className="relative pt-12 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg mb-4 cursor-pointer group-hover:scale-105 transition-transform relative">
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    <User className="w-10 h-10 text-gray-300" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-red-600 text-white p-1.5 rounded-full shadow-md">
                                    <Camera className="w-3 h-3" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{user?.role?.replace('_', ' ')}</p>

                            <div className="w-full space-y-3 mt-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Mail className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                                        <p className="text-xs font-semibold text-gray-700 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <Shield className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Security Level</p>
                                        <p className="text-xs font-semibold text-gray-700">Tier 1 • Authenticated</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative">
                        {success && (
                            <div className="absolute top-4 right-8 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold animate-pulse border border-green-100">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="absolute top-4 right-8 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold animate-pulse border border-red-100">
                                {error}
                            </div>
                        )}

                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-red-600" />
                            Personal Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-8"></div>

                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-orange-600" />
                            Security Check
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Current Password (Required to Save)</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password (Optional)</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all active:scale-95",
                                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 hover:shadow-xl"
                                )}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Employee Details Card */}
            {employeeData && (
                <div className="mt-8 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-red-600" />
                        Employee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Employee ID */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <BadgeCheck className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Employee ID</p>
                                <p className="text-sm font-black text-gray-800">{employeeData.employeeId}</p>
                            </div>
                        </div>

                        {/* Designation */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Briefcase className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Designation</p>
                                <p className="text-sm font-semibold text-gray-700">{employeeData.designation || '—'}</p>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Department</p>
                                <p className="text-sm font-semibold text-gray-700">{employeeData.department || '—'}</p>
                            </div>
                        </div>

                        {/* Employment Type / Status */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Employment Status</p>
                                <p className="text-sm font-semibold text-gray-700">{employeeData.status || '—'}</p>
                            </div>
                        </div>

                        {/* Date of Joining */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date of Joining</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {employeeData.dateOfJoining
                                        ? new Date(employeeData.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Reporting Manager */}
                        {employeeData.linkedUserName && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Shield className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Linked Account</p>
                                    <p className="text-sm font-semibold text-gray-700">{employeeData.linkedUserName}</p>
                                </div>
                            </div>
                        )}

                        {/* Base Salary — only if user has PAYROLL_VIEW */}
                        {hasPermission('PAYROLL_VIEW') && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Base Salary</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {employeeData.salary != null
                                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(employeeData.salary)
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
