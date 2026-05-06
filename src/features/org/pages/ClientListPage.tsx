import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Building, Mail, Phone, Globe, MapPin, Clock, CheckCircle2, XCircle, User, DollarSign, Palette, Search, Power } from 'lucide-react';
import { tenantApi } from '../api/tenantApi';
import { Tenant, TenantRequest, ClientOnboardingRequest } from '../types/tenant.types';
import { LogoUpload } from '../components/LogoUpload';
import toast from 'react-hot-toast';

export const ClientListPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Form data for creating new client (with admin user)
    const [onboardingData, setOnboardingData] = useState<ClientOnboardingRequest>({
        name: '',
        slug: '',
        prefix: '',
        contactEmail: '',
        phoneNumber: '',
        website: '',
        address: '',
        industry: '',
        timezone: 'Asia/Kolkata',
        brandColor: '#6366F1',
        currency: 'INR',
        logoUrl: '',
        adminUser: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            designation: '',
            department: ''
        }
    });

    // Form data for editing existing client (no admin user)
    const [editData, setEditData] = useState<TenantRequest>({
        name: '',
        slug: '',
        prefix: '',
        contactEmail: '',
        phoneNumber: '',
        website: '',
        address: '',
        industry: '',
        timezone: 'UTC',
        brandColor: '#6366F1',
        currency: 'INR',
        logoUrl: '',
        active: true
    });

    // Load immediately on mount, debounce subsequent search changes
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadTenants();
            return;
        }
        const timer = setTimeout(() => {
            loadTenants();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadTenants = async () => {
        try {
            const data = await tenantApi.getAll(searchTerm || undefined);
            setTenants(data);
        } catch (error) {
            console.error('Failed to load tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tenant?: Tenant) => {
        setError('');
        if (tenant) {
            // Editing existing tenant
            setSelectedTenant(tenant);
            setEditData({
                name: tenant.name,
                slug: tenant.slug,
                prefix: tenant.prefix,
                contactEmail: tenant.contactEmail,
                phoneNumber: tenant.phoneNumber || '',
                website: tenant.website || '',
                address: tenant.address || '',
                industry: tenant.industry || '',
                timezone: tenant.timezone || 'UTC',
                brandColor: tenant.brandColor || '#6366F1',
                currency: tenant.currency || 'INR',
                logoUrl: tenant.logoUrl || '',
                active: tenant.active
            });
        } else {
            // Creating new tenant
            setSelectedTenant(null);
            setOnboardingData({
                name: '',
                slug: '',
                prefix: '',
                contactEmail: '',
                phoneNumber: '',
                website: '',
                address: '',
                industry: '',
                timezone: 'Asia/Kolkata',
                brandColor: '#6366F1',
                currency: 'INR',
                logoUrl: '',
                adminUser: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    designation: '',
                    department: ''
                }
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const data = selectedTenant ? editData : onboardingData;
            const payload = {
                ...data,
                slug: data.slug
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, ''),
                website: data.website?.trim() || null,
                logoUrl: data.logoUrl?.trim() || null
            };

            if (selectedTenant) {
                // Editing - use regular tenant update
                await tenantApi.update(selectedTenant.id, payload as any);
                toast.success('Client updated successfully');
            } else {
                // Creating new - use full onboarding
                const response = await tenantApi.onboardClient(payload as any);
                console.log('Client onboarded:', response);
                toast.success(`Client onboarded! Admin login: ${response.adminEmail}`);
            }
            setIsModalOpen(false);
            loadTenants();
        } catch (error: any) {
            const msg = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Failed to update client';
            setError(msg);
            console.error('Update error:', error.response);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?\n\nThis will permanently delete the organization and all associated data.`)) {
            try {
                await tenantApi.delete(id);
                toast.success('Client deleted');
                loadTenants();
            } catch (error) {
                console.error('Failed to delete tenant:', error);
                toast.error('Failed to delete client');
            }
        }
    };

    const handleToggleActivation = async (id: string, currentState: boolean, name: string) => {
        const action = currentState ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
            try {
                await tenantApi.toggleActivation(id);
                toast.success(`Client ${action}d`);
                loadTenants();
            } catch (error) {
                console.error(`Failed to ${action} tenant:`, error);
                toast.error(`Failed to ${action} client`);
            }
        }
    };

    // Auto-generate slug function
    const generateSlug = (name: string): string =>
        name.toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

    // Auto-generate slug from name (for new clients)
    const handleNameChange = (name: string) => {
        setOnboardingData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    // Auto-generate slug for edit
    const handleEditNameChange = (name: string) => {
        setEditData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Client <span className="text-red-600">Accounts</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Multi-tenant Management • {tenants.filter(t => t.active).length} Active / {tenants.length} Total
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/30 text-xs uppercase tracking-widest active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Onboard New Client
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, slug, industry, email, or prefix..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 font-bold text-sm"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl animate-pulse" />
                    ))
                ) : tenants.map(tenant => (
                    <div
                        key={tenant.id}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between"
                        style={{ borderTopColor: tenant.brandColor || '#6366F1', borderTopWidth: '4px' }}
                    >
                        {/* Decorative Element */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform opacity-10"
                            style={{ backgroundColor: tenant.brandColor || '#6366F1' }}
                        />

                        <div className="relative space-y-4">
                            {/* Logo or Icon */}
                            {tenant.logoUrl ? (
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden">
                                    <img
                                        src={tenant.logoUrl}
                                        alt={tenant.name}
                                        className="w-full h-full object-contain p-2"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>`;
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: tenant.brandColor || '#6366F1' }}
                                >
                                    <Building className="w-8 h-8" />
                                </div>
                            )}

                            {/* Company Name & Tags */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                                    {tenant.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {tenant.slug}
                                    </span>
                                    <span
                                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border"
                                        style={{
                                            backgroundColor: `${tenant.brandColor || '#6366F1'}15`,
                                            color: tenant.brandColor || '#6366F1',
                                            borderColor: `${tenant.brandColor || '#6366F1'}30`
                                        }}
                                    >
                                        {tenant.prefix}
                                    </span>
                                    {tenant.industry && (
                                        <span className="px-2 py-0.5 bg-blue-50 rounded text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
                                            {tenant.industry}
                                        </span>
                                    )}
                                    {tenant.currency && (
                                        <span className="px-2 py-0.5 bg-emerald-50 rounded text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                            <DollarSign className="w-2.5 h-2.5" />
                                            {tenant.currency}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 text-[11px] font-medium text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" style={{ color: tenant.brandColor || '#EF4444' }} />
                                    <span className="truncate">{tenant.contactEmail}</span>
                                </div>
                                {tenant.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" style={{ color: tenant.brandColor || '#EF4444' }} />
                                        {tenant.phoneNumber}
                                    </div>
                                )}
                                {tenant.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5" style={{ color: tenant.brandColor || '#EF4444' }} />
                                        <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                            {tenant.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                                {tenant.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: tenant.brandColor || '#EF4444' }} />
                                        <span className="line-clamp-2">{tenant.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" style={{ color: tenant.brandColor || '#EF4444' }} />
                                    {tenant.timezone}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="relative pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1.5">
                                {tenant.active ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Active
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-rose-500 font-black text-[9px] uppercase tracking-widest">
                                        <XCircle className="w-3.5 h-3.5" />
                                        Inactive
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(tenant)}
                                    className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm hover:shadow-md"
                                    title="Edit client"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleActivation(tenant.id, tenant.active, tenant.name)}
                                    className={`p-2.5 bg-gray-50 rounded-xl transition-all shadow-sm hover:shadow-md ${tenant.active
                                            ? 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
                                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    title={tenant.active ? 'Deactivate client' : 'Activate client'}
                                >
                                    <Power className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(tenant.id, tenant.name)}
                                    className="p-2.5 bg-gray-50 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 transition-all shadow-sm hover:shadow-md"
                                    title="Delete client"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="relative bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Modal Header - Sticky */}
                        <div className="sticky top-0 z-20 p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/95 to-white/95 backdrop-blur-lg">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {selectedTenant ? '🔧 Edit' : '✨ Onboard'} <span className="text-red-600">Client</span>
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
                                {selectedTenant
                                    ? `Update ${selectedTenant.name} settings`
                                    : 'Complete client setup with admin user creation'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-32">
                            {/* Error Display */}
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex items-start gap-3 animate-in slide-in-from-top">
                                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold">Error</div>
                                        <div>{error}</div>
                                    </div>
                                </div>
                            )}

                            {/* Logo Upload */}
                            <div>
                                <LogoUpload
                                    value={selectedTenant ? editData.logoUrl || '' : onboardingData.logoUrl || ''}
                                    onChange={(url) => {
                                        if (selectedTenant) {
                                            setEditData(prev => ({ ...prev, logoUrl: url }));
                                        } else {
                                            setOnboardingData(prev => ({ ...prev, logoUrl: url }));
                                        }
                                    }}
                                    companyName={selectedTenant ? editData.name : onboardingData.name}
                                />
                            </div>

                            {/* Organization Details */}
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Building className="w-5 h-5 text-red-600" />
                                    Organization Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Company Name */}
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={selectedTenant ? editData.name : onboardingData.name}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    handleEditNameChange(e.target.value);
                                                } else {
                                                    handleNameChange(e.target.value);
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            placeholder="e.g., Acme Corporation Pvt Ltd"
                                        />
                                    </div>

                                    {/* Slug */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Slug * (URL friendly)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={selectedTenant ? editData.slug : onboardingData.slug}
                                                onChange={(e) => {
                                                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                    if (selectedTenant) {
                                                        setEditData(prev => ({ ...prev, slug }));
                                                    } else {
                                                        setOnboardingData(prev => ({ ...prev, slug }));
                                                    }
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 pr-12 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="acme"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold uppercase tracking-widest pointer-events-none">
                                                AUTO
                                            </span>
                                        </div>
                                    </div>

                                    {/* Prefix */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Prefix * (Employee IDs)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={selectedTenant ? editData.prefix : onboardingData.prefix}
                                            onChange={(e) => {
                                                const prefix = e.target.value.toUpperCase();
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, prefix }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, prefix }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors uppercase"
                                            placeholder="ACM"
                                            maxLength={10}
                                        />
                                    </div>

                                    {/* Contact Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Contact Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={selectedTenant ? editData.contactEmail : onboardingData.contactEmail}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, contactEmail: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, contactEmail: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            placeholder="contact@company.com"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={selectedTenant ? editData.phoneNumber : onboardingData.phoneNumber}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, phoneNumber: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, phoneNumber: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            placeholder="+1-555-0100"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Address *
                                        </label>
                                        <textarea
                                            required
                                            value={selectedTenant ? editData.address : onboardingData.address}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, address: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, address: e.target.value }));
                                                }
                                            }}
                                            rows={2}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors resize-none"
                                            placeholder="123 Business Street, City, State, ZIP"
                                        />
                                    </div>

                                    {/* Industry */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Industry
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedTenant ? editData.industry : onboardingData.industry}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, industry: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, industry: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            placeholder="e.g., IT Services, Manufacturing"
                                        />
                                    </div>

                                    {/* Website */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={selectedTenant ? editData.website : onboardingData.website}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, website: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, website: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            placeholder="https://company.com"
                                        />
                                    </div>

                                    {/* Timezone */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Timezone *
                                        </label>
                                        <select
                                            value={selectedTenant ? editData.timezone : onboardingData.timezone}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, timezone: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, timezone: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                            <option value="America/Chicago">America/Chicago (CST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Europe/Paris">Europe/Paris (CET)</option>
                                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                            <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                            <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                                        </select>
                                    </div>

                                    {/* Currency */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Currency *
                                        </label>
                                        <select
                                            value={selectedTenant ? editData.currency : onboardingData.currency}
                                            onChange={(e) => {
                                                if (selectedTenant) {
                                                    setEditData(prev => ({ ...prev, currency: e.target.value }));
                                                } else {
                                                    setOnboardingData(prev => ({ ...prev, currency: e.target.value }));
                                                }
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                        >
                                            <option value="USD">USD - US Dollar ($)</option>
                                            <option value="EUR">EUR - Euro (€)</option>
                                            <option value="GBP">GBP - British Pound (£)</option>
                                            <option value="INR">INR - Indian Rupee (₹)</option>
                                            <option value="JPY">JPY - Japanese Yen (¥)</option>
                                            <option value="CNY">CNY - Chinese Yuan (¥)</option>
                                            <option value="AUD">AUD - Australian Dollar ($)</option>
                                            <option value="CAD">CAD - Canadian Dollar ($)</option>
                                            <option value="SGD">SGD - Singapore Dollar ($)</option>
                                            <option value="AED">AED - UAE Dirham (د.إ)</option>
                                        </select>
                                    </div>

                                    {/* Brand Color */}
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                            <Palette className="w-3 h-3" />
                                            Brand Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={selectedTenant ? editData.brandColor : onboardingData.brandColor}
                                                onChange={(e) => {
                                                    if (selectedTenant) {
                                                        setEditData(prev => ({ ...prev, brandColor: e.target.value }));
                                                    } else {
                                                        setOnboardingData(prev => ({ ...prev, brandColor: e.target.value }));
                                                    }
                                                }}
                                                className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={selectedTenant ? editData.brandColor : onboardingData.brandColor}
                                                onChange={(e) => {
                                                    if (selectedTenant) {
                                                        setEditData(prev => ({ ...prev, brandColor: e.target.value }));
                                                    } else {
                                                        setOnboardingData(prev => ({ ...prev, brandColor: e.target.value }));
                                                    }
                                                }}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="#6366F1"
                                                pattern="^#[0-9A-Fa-f]{6}$"
                                            />
                                            <div className="flex gap-2">
                                                {['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => {
                                                            if (selectedTenant) {
                                                                setEditData(prev => ({ ...prev, brandColor: color }));
                                                            } else {
                                                                setOnboardingData(prev => ({ ...prev, brandColor: color }));
                                                            }
                                                        }}
                                                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin User Section - Only for New Clients */}
                            {!selectedTenant && (
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <User className="w-5 h-5 text-red-600" />
                                        Admin User (CLIENT_ADMIN Role)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        {/* First Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={onboardingData.adminUser.firstName}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, firstName: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={onboardingData.adminUser.lastName}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, lastName: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={onboardingData.adminUser.email}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, email: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="admin@company.com"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                Password * (minimum 8 characters)
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                value={onboardingData.adminUser.password}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, password: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        {/* Designation */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                Designation *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={onboardingData.adminUser.designation}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, designation: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="e.g., HR Manager"
                                            />
                                        </div>

                                        {/* Department */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                Department *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={onboardingData.adminUser.department}
                                                onChange={(e) => setOnboardingData(prev => ({
                                                    ...prev,
                                                    adminUser: { ...prev.adminUser, department: e.target.value }
                                                }))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none hover:bg-white transition-colors"
                                                placeholder="e.g., Human Resources"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-6 border-t border-gray-100 flex items-center justify-between gap-4 rounded-b-[3rem] z-20 mt-8 -mx-8 -mb-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-12 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        selectedTenant ? '💾 Update Client' : '✨ Onboard Client'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
