import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axiosInstance from '@/lib/api/axiosInstance';
import { Settings, Save, Palette, Building, Globe, DollarSign } from 'lucide-react';
import clsx from 'clsx';

export const SettingsPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'branding'>('general');

    const [tenantData, setTenantData] = useState({
        id: '',
        name: '',
        contactEmail: '',
        phoneNumber: '',
        website: '',
        address: '',
        industry: '',
        timezone: '',
        logoUrl: '',
        brandColor: '#ef4444', // Default Red
        currency: 'USD'
    });

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                // 1. Fetch User to get Tenant ID
                const userRes = await axiosInstance.get(`/users/${user?.id}`);
                const tenantId = userRes.data.tenantId;

                if (tenantId) {
                    // 2. Fetch Tenant Details
                    const tenantRes = await axiosInstance.get(`/tenants/${tenantId}`);
                    const data = tenantRes.data;
                    setTenantData({
                        id: data.id,
                        name: data.name || '',
                        contactEmail: data.contactEmail || '',
                        phoneNumber: data.phoneNumber || '',
                        website: data.website || '',
                        address: data.address || '',
                        industry: data.industry || '',
                        timezone: data.timezone || '',
                        logoUrl: data.logoUrl || '',
                        brandColor: data.brandColor || '#ef4444',
                        currency: data.currency || 'USD'
                    });
                }
            } catch (err) {
                console.error("Failed to fetch tenant settings", err);
                setError("Could not load organization settings.");
            }
        };
        if (user?.id) fetchTenant();
    }, [user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTenantData({ ...tenantData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosInstance.put(`/tenants/${tenantData.id}`, tenantData);
            setSuccess('Settings saved successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        System <span className="text-red-600">Settings</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure your organization</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={clsx(
                            "px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all",
                            activeTab === 'general' ? "text-red-600 bg-red-50/50 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        General Info
                    </button>
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={clsx(
                            "px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all",
                            activeTab === 'branding' ? "text-red-600 bg-red-50/50 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        Branding & Appearance
                    </button>
                </div>

                <div className="p-8">
                    {success && (
                        <div className="mb-6 bg-green-50 text-green-600 px-4 py-3 rounded-xl text-xs font-bold animate-pulse border border-green-100 flex items-center gap-2">
                            <Save className="w-4 h-4" /> {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold animate-pulse border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Organization Name</label>
                                        <div className="relative">
                                            <Building className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={tenantData.name}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Website</label>
                                        <div className="relative">
                                            <Globe className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                            <input
                                                type="url"
                                                name="website"
                                                value={tenantData.website}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Timezone</label>
                                        <input
                                            type="text"
                                            name="timezone"
                                            value={tenantData.timezone}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Currency</label>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                                            <input
                                                type="text"
                                                name="currency"
                                                value={tenantData.currency}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={tenantData.address}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Brand Color</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                name="brandColor"
                                                value={tenantData.brandColor}
                                                onChange={handleChange}
                                                className="h-12 w-24 bg-transparent cursor-pointer rounded-xl overflow-hidden border border-gray-100"
                                            />
                                            <span className="text-sm font-mono text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{tenantData.brandColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Logo URL</label>
                                        <input
                                            type="url"
                                            name="logoUrl"
                                            value={tenantData.logoUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/logo.png"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                        />
                                        {tenantData.logoUrl && (
                                            <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 inline-block">
                                                <img src={tenantData.logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-all active:scale-95",
                                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-red-500/30 hover:-translate-y-0.5"
                                )}
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving Changes...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
