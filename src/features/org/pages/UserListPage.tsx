import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Mail, Phone, Briefcase, Building2, CheckCircle2, XCircle, Edit, Trash2, Power, ChevronDown, Users, Globe, Shield, Download, Link } from 'lucide-react';
import { userApi } from '../api/userApi';
import { tenantApi } from '../api/tenantApi';
import { getRoles, Role as CustomRoleType } from '../api/roleApi';
import { User, UserRequest, Role } from '../types/user.types';
import { Tenant } from '../types/tenant.types';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<Role, string> = {
    SUPER_ADMIN: 'bg-red-50 text-red-600 border-red-100',
    CLIENT_ADMIN: 'bg-orange-50 text-orange-600 border-orange-100',
    ADMIN: 'bg-blue-50 text-blue-600 border-blue-100',
    MANAGER: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    USER: 'bg-gray-50 text-gray-600 border-gray-100',
};

const PLATFORM_TENANT_ID = '__platform__';

export const UserListPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isClientAdmin = user?.role === 'CLIENT_ADMIN';
    const isAdmin = user?.role === 'ADMIN';
    const canManageUsers = isSuperAdmin || isClientAdmin || isAdmin;

    const [users, setUsers] = useState<User[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [customRoles, setCustomRoles] = useState<CustomRoleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTenantIds, setExpandedTenantIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [exportingClientId, setExportingClientId] = useState<string | null>(null);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [formData, setFormData] = useState<UserRequest>({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        role: 'USER',
        tenantId: '',
        password: '',
        isActive: true,
        customRoleId: '',
    });

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadData();
            return;
        }
        const timer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadData = async () => {
        try {
            const [userData, tenantData, rolesData] = await Promise.all([
                userApi.getAll(searchTerm || undefined, undefined),
                tenantApi.getAll(),
                getRoles(),
            ]);
            setUsers(userData);
            setTenants(tenantData);
            setCustomRoles(rolesData.filter(r => r.isCustom));
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group users by tenantId
    const groupedUsers = useMemo(() => {
        const map = new Map<string, User[]>();

        users.forEach(u => {
            const key = u.tenantId || PLATFORM_TENANT_ID;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(u);
        });

        return map;
    }, [users]);

    // Build display groups — tenants that exist in the system + platform-level
    const displayGroups = useMemo(() => {
        let groups: Array<{ id: string; name: string; tenant: Tenant | null }> = [];

        tenants.forEach(t => {
            groups.push({ id: t.id, name: t.name, tenant: t });
        });

        // Platform-level (unassigned) — only for SUPER_ADMIN
        if (isSuperAdmin && groupedUsers.has(PLATFORM_TENANT_ID)) {
            groups.push({ id: PLATFORM_TENANT_ID, name: 'Platform Level', tenant: null });
        }

        // Filter by selected tenant if set (SUPER_ADMIN filter)
        if (isSuperAdmin && selectedTenantId) {
            groups = groups.filter(g => g.id === selectedTenantId);
        }

        // Filter out groups that have no users (when searching)
        if (searchTerm) {
            return groups.filter(g => (groupedUsers.get(g.id) ?? []).length > 0);
        }

        return groups;
    }, [tenants, groupedUsers, isSuperAdmin, searchTerm, selectedTenantId]);

    const toggleExpand = (tenantId: string) => {
        setExpandedTenantIds(prev => {
            const next = new Set(prev);
            if (next.has(tenantId)) {
                next.delete(tenantId);
            } else {
                next.add(tenantId);
            }
            return next;
        });
    };

    const handleOpenModal = (user?: User, preSelectedTenantId?: string) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                role: user.role,
                tenantId: user.tenantId || '',
                password: '',
                isActive: user.isActive,
                customRoleId: user.customRoleId || '',
            });
        } else {
            setSelectedUser(null);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                role: 'USER',
                tenantId: preSelectedTenantId === PLATFORM_TENANT_ID ? '' : (preSelectedTenantId || ''),
                password: '',
                isActive: true,
                customRoleId: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                await userApi.update(selectedUser.id, formData);
                toast.success(`${formData.firstName} ${formData.lastName} updated`);
            } else {
                await userApi.create(formData);
                toast.success(`${formData.firstName} ${formData.lastName} provisioned`);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Failed to save user:', error);
            toast.error('Failed to save user');
        }
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportClientUsers = async (clientId: string, clientName: string) => {
        if (clientId === PLATFORM_TENANT_ID) {
            toast.error('Platform level export not supported currently');
            return;
        }

        setExportingClientId(clientId);
        try {
            const blob = await userApi.exportUsers(clientId);
            const date = new Date().toISOString().split('T')[0];
            const cleanName = clientName.replace(/[^a-zA-Z0-9]/g, '_');

            downloadBlob(blob, `Users_${cleanName}_${date}.xlsx`);
            toast.success(`${clientName} users exported!`);
        } catch (err) {
            console.error(`Export failed for ${clientName}:`, err);
            toast.error(`Failed to export ${clientName} users`);
        } finally {
            setExportingClientId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this user?')) {
            try {
                await userApi.delete(id);
                toast.success('User removed');
                loadData();
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error('Failed to remove user');
            }
        }
    };

    const handleToggleActivation = async (user: User) => {
        const action = user.isActive ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) {
            try {
                await userApi.toggleActivation(user.id);
                toast.success(`${user.firstName} ${user.lastName} ${action}d`);
                loadData();
            } catch (error) {
                console.error(`Failed to ${action} user:`, error);
                toast.error(`Failed to ${action} user`);
            }
        }
    };

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Row 1: HEADER ROW */}
            <div className="flex items-center justify-between gap-4 mb-6">
                {/* Left: Title */}
                <div className="flex-shrink-0">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Access <span className="text-red-600">Control</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Platform User Directory
                    </p>
                </div>

                {/* Right: Org filter + Search only */}
                <div className="flex items-center gap-3">
                    {/* ALL ORGANIZATIONS dropdown */}
                    {isSuperAdmin && (
                        <select
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:border-red-500 outline-none cursor-pointer min-w-[200px]"
                        >
                            <option value="">All Organizations</option>
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    )}

                    {/* Search bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold w-64 placeholder:text-gray-400 focus:border-red-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Row 2: Summary Stats */}
            <div className="flex gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
                        <p className="text-lg font-black text-gray-900">{totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</p>
                        <p className="text-lg font-black text-gray-900">{activeUsers}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clients</p>
                        <p className="text-lg font-black text-gray-900">{tenants.length}</p>
                    </div>
                </div>
            </div>

            {/* Row 3: Client Cards */}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-white rounded-3xl border border-gray-100 h-24 shadow-sm" />
                    ))
                ) : displayGroups.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-12 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No clients or users found</p>
                    </div>
                ) : displayGroups.map(group => {
                    const groupUsers = groupedUsers.get(group.id) ?? [];
                    const activeCount = groupUsers.filter(u => u.isActive).length;
                    const isExpanded = expandedTenantIds.has(group.id);
                    const tenant = group.tenant;

                    // Determine card accent color from brandColor or defaults
                    const brandColor = tenant?.brandColor;

                    return (
                        <div
                            key={group.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
                        >
                            {/* Card Header — clickable */}
                            <button
                                onClick={() => toggleExpand(group.id)}
                                className="w-full text-left px-8 py-5 flex items-center gap-5 hover:bg-gray-50/60 transition-colors group"
                            >
                                {/* Logo / Initials */}
                                {tenant?.logoUrl ? (
                                    <img
                                        src={tenant.logoUrl}
                                        alt={tenant.name}
                                        className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                                    />
                                ) : (
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-white font-black text-lg"
                                        style={{ backgroundColor: brandColor || (group.id === PLATFORM_TENANT_ID ? '#111827' : '#ef4444') }}
                                    >
                                        {group.id === PLATFORM_TENANT_ID
                                            ? <Globe className="w-6 h-6" />
                                            : group.name.slice(0, 2).toUpperCase()
                                        }
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{group.name}</p>
                                        {tenant?.prefix && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                {tenant.prefix}
                                            </span>
                                        )}
                                        {tenant?.industry && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                {tenant.industry}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                        {tenant?.contactEmail && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                <Mail className="w-3 h-3 text-red-400 flex-shrink-0" />
                                                {tenant.contactEmail}
                                            </span>
                                        )}
                                        {tenant?.address && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 truncate max-w-[200px]">
                                                <Briefcase className="w-3 h-3 flex-shrink-0" />
                                                {tenant.address}
                                            </span>
                                        )}
                                        {group.id === PLATFORM_TENANT_ID && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                <Shield className="w-3 h-3 text-red-400" />
                                                Global / Unassigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {/* Members count */}
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</p>
                                        <p className="text-2xl font-black text-gray-900">{groupUsers.length}</p>
                                    </div>

                                    {/* Active count */}
                                    <div className="text-right mr-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                                        <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
                                    </div>

                                    {/* Export button - Only for Admins */}
                                    {canManageUsers && group.id !== PLATFORM_TENANT_ID && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportClientUsers(group.id, group.name);
                                            }}
                                            disabled={exportingClientId === group.id}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-50"
                                            title={`Export ${group.name} users`}
                                        >
                                            {exportingClientId === group.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Download className="w-3.5 h-3.5" />
                                            )}
                                            {exportingClientId === group.id ? 'Exporting...' : 'Export'}
                                        </button>
                                    )}

                                    {/* Provision User button — Only for Admins */}
                                    {canManageUsers && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(undefined, group.id);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Provision User
                                        </button>
                                    )}

                                    {/* Expand chevron */}
                                    <div className={clsx(
                                        "w-9 h-9 flex items-center justify-center rounded-xl border flex-shrink-0 transition-all duration-300",
                                        isExpanded ? "bg-gray-900 border-gray-900" : "bg-white border-gray-200"
                                    )}>
                                        <ChevronDown className={clsx(
                                            "w-4 h-4 transition-transform duration-300",
                                            isExpanded ? "rotate-180 text-white" : "text-gray-400"
                                        )} />
                                    </div>
                                </div>
                            </button>

                            {/* Expandable User List */}
                            <div className={clsx(
                                "overflow-hidden transition-all duration-300",
                                isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                            )}>
                                <div className="border-t border-gray-50">
                                    {groupUsers.length === 0 ? (
                                        <div className="px-8 py-8 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No members in this client</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/70">
                                                        <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest min-w-[260px]">Member</th>
                                                        <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                        <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                        {canManageUsers && (
                                                            <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {groupUsers.map(u => (
                                                        <tr key={u.id} className="hover:bg-gray-50/40 transition-colors group/row">
                                                            {/* Identity */}
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs group-hover/row:scale-110 transition-transform shadow-md flex-shrink-0 overflow-hidden">
                                                                        {u.profileImageUrl
                                                                            ? <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                                                            : `${u.firstName[0]}${u.lastName[0]}`}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{u.firstName} {u.lastName}</p>
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                                            <Mail className="w-3 h-3 text-red-400 flex-shrink-0" />
                                                                            <span className="truncate">{u.email}</span>
                                                                            {u.phoneNumber && (
                                                                                <>
                                                                                    <span className="text-gray-200">|</span>
                                                                                    <Phone className="w-3 h-3 text-red-400 flex-shrink-0" />
                                                                                    <span>{u.phoneNumber}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {u.linkedEmployeeName && (
                                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                                <Link className="w-2.5 h-2.5 text-blue-400" />
                                                                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{u.linkedEmployeeName}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {/* Role */}
                                                            <td className="px-8 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={clsx(
                                                                        "px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest inline-block whitespace-nowrap",
                                                                        ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600 border-gray-200'
                                                                    )}>
                                                                        {u.role}
                                                                    </span>
                                                                    {u.customRoleName && (
                                                                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest inline-block whitespace-nowrap bg-violet-50 text-violet-600 border-violet-100">
                                                                            {u.customRoleName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {/* Status */}
                                                            <td className="px-8 py-4">
                                                                {u.isActive ? (
                                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        Active
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                        Suspended
                                                                    </div>
                                                                )}
                                                            </td>
                                                            {/* Actions - Only for Admins */}
                                                            {canManageUsers && (
                                                                <td className="px-8 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        <button
                                                                            onClick={() => handleToggleActivation(u)}
                                                                            className={`p-2 rounded-xl transition-all border border-transparent hover:border-gray-100 ${u.isActive
                                                                                ? 'text-emerald-500 hover:bg-emerald-50'
                                                                                : 'text-gray-400 hover:bg-gray-50'
                                                                                }`}
                                                                            title={u.isActive ? 'Deactivate User' : 'Activate User'}
                                                                        >
                                                                            <Power className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleOpenModal(u)}
                                                                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100"
                                                                            title="Edit User"
                                                                        >
                                                                            <Edit className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(u.id)}
                                                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100"
                                                                            title="Delete User"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                {selectedUser ? 'Edit' : 'Invite'} <span className="text-red-600">User</span>
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure security and profile details</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-x-8 gap-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                                <input
                                    type="text" required
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                                <input
                                    type="text" required
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input
                                    type="email" required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                    {selectedUser ? 'Reset Password (Optional)' : 'Initial Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!selectedUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                    placeholder={selectedUser ? "Leave blank to keep current" : "Set password"}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Access Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                >
                                    {Object.keys(ROLE_COLORS).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Custom Role <span className="text-gray-300">(Optional)</span></label>
                                <select
                                    value={formData.customRoleId || ''}
                                    onChange={e => setFormData({ ...formData, customRoleId: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-violet-500/20 outline-none"
                                >
                                    <option value="">None (use system role)</option>
                                    {customRoles.map(r => (
                                        <option key={r.id} value={r.id}>{r.displayName || r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {isSuperAdmin && (
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tenant Organization</label>
                                    <select
                                        value={formData.tenantId}
                                        onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                    >
                                        <option value="">Platform Level (Global)</option>
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.prefix})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="col-span-2 flex items-center justify-between pt-6 mt-2 border-t border-gray-50 bg-white sticky bottom-0">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-6 h-6 rounded-lg text-red-600 focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Active Access</span>
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-12 py-3.5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 active:scale-95 transition-all"
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};
