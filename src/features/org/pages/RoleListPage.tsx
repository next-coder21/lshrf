import { useState, useEffect, useMemo } from 'react';
import {
    Shield, Lock, Trash2, Plus, ChevronRight, CheckCircle2, ShieldAlert,
    Save, X, Activity, Filter, Building2, User, Mail, Edit, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, Role, Permission } from '../api/roleApi';
import { departmentApi } from '../api/departmentApi';
import { userApi } from '../api/userApi';
import { Department, DepartmentRequest } from '../types/department.types';
import { User as UserType } from '../types/user.types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { tenantApi } from '../api/tenantApi';

type Tab = 'roles' | 'departments';

export const RoleListPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isClientAdmin = user?.role === 'CLIENT_ADMIN';
    const canManage = isSuperAdmin || isClientAdmin || user?.role === 'ADMIN';

    const [activeTab, setActiveTab] = useState<Tab>('roles');

    // ─── Roles state ───────────────────────────────────────────────
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [rolesLoading, setRolesLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    // ─── Departments state ─────────────────────────────────────────
    const [departments, setDepartments] = useState<Department[]>([]);
    const [deptsLoading, setDeptsLoading] = useState(true);
    const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
    const [isCreatingDept, setIsCreatingDept] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [deptForm, setDeptForm] = useState<DepartmentRequest>({ name: '', description: '', headUserId: null });
    const [deptSaving, setDeptSaving] = useState(false);

    // ─── Load roles ────────────────────────────────────────────────
    useEffect(() => {
        if (isSuperAdmin) loadTenants();
        loadRoles();
    }, [selectedTenantId]);

    // ─── Load departments ──────────────────────────────────────────
    useEffect(() => {
        if (activeTab === 'departments') {
            loadDepartments();
            userApi.getAll().then(setAvailableUsers).catch(() => {});
        }
    }, [activeTab]);

    const loadTenants = async () => {
        try { setTenants(await tenantApi.getAll() || []); } catch {}
    };

    const loadRoles = async () => {
        try {
            setRolesLoading(true);
            const [rolesData, permsData] = await Promise.all([
                getRoles(selectedTenantId || undefined),
                getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
            if (rolesData.length > 0) handleSelectRole(rolesData[0]);
        } catch {
            toast.error('Failed to load roles');
        } finally {
            setRolesLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            setDeptsLoading(true);
            setDepartments(await departmentApi.getAll());
        } catch {
            toast.error('Failed to load departments');
        } finally {
            setDeptsLoading(false);
        }
    };

    // ─── Roles handlers ────────────────────────────────────────────
    const handleSelectRole = (role: Role) => {
        setIsCreatingRole(false);
        setSelectedRole(role);
        setFormName(role.name);
        setFormDesc(role.description || '');
        setSelectedPerms(new Set(role.permissions));
    };

    const handleStartCreateRole = () => {
        setIsCreatingRole(true);
        setSelectedRole(null);
        setFormName('');
        setFormDesc('');
        setSelectedPerms(new Set());
    };

    const togglePerm = (permName: string) => {
        if (selectedRole?.isSystem) return;
        const next = new Set(selectedPerms);
        next.has(permName) ? next.delete(permName) : next.add(permName);
        setSelectedPerms(next);
    };

    const handleSaveRole = async () => {
        if (!formName.trim()) { toast.error('Role name is required'); return; }
        setSaving(true);
        try {
            const payload = { name: formName.trim(), description: formDesc.trim(), permissions: Array.from(selectedPerms) as string[] };
            if (isCreatingRole) {
                await createRole(payload);
                toast.success('Role created');
            } else if (selectedRole?.id) {
                await updateRole(selectedRole.id, payload);
                toast.success('Role updated');
            }
            loadRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole?.id || selectedRole.isSystem) return;
        if (selectedRole.userCount > 0) { toast.error(`${selectedRole.userCount} users are using this role`); return; }
        if (!confirm(`Delete role "${selectedRole.displayName}"?`)) return;
        try {
            setSaving(true);
            await deleteRole(selectedRole.id);
            toast.success('Role deleted');
            loadRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete role');
        } finally {
            setSaving(false);
        }
    };

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach(p => { if (!groups[p.category]) groups[p.category] = []; groups[p.category].push(p); });
        return groups;
    }, [permissions]);

    const systemRoles = roles.filter(r => r.isSystem);
    const customRoles = roles.filter(r => !r.isSystem);

    // ─── Department handlers ───────────────────────────────────────
    const openCreateDept = () => {
        setEditingDept(null);
        setDeptForm({ name: '', description: '', headUserId: null });
        setIsCreatingDept(true);
    };

    const openEditDept = (dept: Department) => {
        setEditingDept(dept);
        setDeptForm({ name: dept.name, description: dept.description || '', headUserId: dept.headUserId || null });
        setIsCreatingDept(true);
    };

    const closeDeptForm = () => { setIsCreatingDept(false); setEditingDept(null); };

    const handleSaveDept = async () => {
        if (!deptForm.name.trim()) { toast.error('Department name is required'); return; }
        setDeptSaving(true);
        try {
            if (editingDept) {
                await departmentApi.update(editingDept.id, deptForm);
                toast.success('Department updated');
            } else {
                await departmentApi.create(deptForm);
                toast.success('Department created');
            }
            closeDeptForm();
            loadDepartments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save department');
        } finally {
            setDeptSaving(false);
        }
    };

    const handleDeleteDept = async (dept: Department) => {
        if (!confirm(`Delete department "${dept.name}"?`)) return;
        try {
            await departmentApi.delete(dept.id);
            toast.success('Department deleted');
            loadDepartments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete department');
        }
    };

    const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all";
    const labelCls = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block";

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Roles <span className="text-red-600">&</span> Departments
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Access Control · Organizational Structure
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'roles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <Shield className="w-3.5 h-3.5" />
                    Roles
                </button>
                <button
                    onClick={() => setActiveTab('departments')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'departments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    Departments
                </button>
            </div>

            {/* ─── ROLES TAB ──────────────────────────────────────────────── */}
            {activeTab === 'roles' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Roles list */}
                    <div className="lg:col-span-4 space-y-8">
                        {isSuperAdmin && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-2">
                                    <Filter className="w-3.5 h-3.5 text-red-600" />
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filter by Organization</h3>
                                </div>
                                <select
                                    value={selectedTenantId}
                                    onChange={e => setSelectedTenantId(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-red-500 transition-all"
                                >
                                    <option value="">All Organizations</option>
                                    {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System Roles</h3>
                                <Lock className="w-3 h-3 text-gray-300" />
                            </div>
                            <div className="space-y-2">
                                {rolesLoading ? [1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />) :
                                systemRoles.map(role => (
                                    <button key={role.name} onClick={() => handleSelectRole(role)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                            selectedRole?.name === role.name ? 'bg-gray-900 border-gray-900 shadow-xl' : 'bg-white border-gray-100 hover:border-red-100'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                selectedRole?.name === role.name ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50'
                                            }`}>
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedRole?.name === role.name ? 'text-white' : 'text-gray-900'}`}>{role.displayName}</p>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{role.userCount} Members</span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 ${selectedRole?.name === role.name ? 'text-red-500' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Custom Roles</h3>
                                {canManage && (
                                    <button onClick={handleStartCreateRole} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg active:scale-95">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {!rolesLoading && customRoles.length === 0 && !isCreatingRole && (
                                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No custom roles yet</p>
                                    </div>
                                )}
                                {customRoles.map(role => (
                                    <button key={role.id} onClick={() => handleSelectRole(role)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                            selectedRole?.id === role.id ? 'bg-gray-900 border-gray-900 shadow-xl' : 'bg-white border-gray-100 hover:border-red-100 shadow-sm'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                selectedRole?.id === role.id ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50'
                                            }`}>
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-900'}`}>{role.displayName}</p>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{role.userCount} Members</span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 ${selectedRole?.id === role.id ? 'text-red-500' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                                {isCreatingRole && (
                                    <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/20 ring-4 ring-red-500/5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">New Role</p>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase italic">Configuring...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Role editor */}
                    <div className="lg:col-span-8">
                        {(selectedRole || isCreatingRole) ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden animate-in slide-in-from-right-8">
                                <div className="p-8 border-b border-gray-100 flex items-start justify-between bg-gradient-to-br from-white to-gray-50/50">
                                    <div className="space-y-4 flex-1 pr-12">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
                                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                                {isCreatingRole ? 'New' : 'Edit'} <span className="text-red-600">Role</span>
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Role Name</label>
                                                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                                                    readOnly={selectedRole?.isSystem} placeholder="e.g. Finance Controller"
                                                    className={`w-full px-5 py-3 rounded-2xl text-xs font-bold transition-all outline-none ${selectedRole?.isSystem ? 'bg-gray-50 text-gray-500 border-transparent cursor-not-allowed' : 'bg-white border border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 shadow-sm'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                                                <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                                                    readOnly={selectedRole?.isSystem} placeholder="Describe this role's responsibilities..."
                                                    className={`w-full px-5 py-3 rounded-2xl text-xs font-bold transition-all outline-none ${selectedRole?.isSystem ? 'bg-gray-50 text-gray-400 border-transparent cursor-not-allowed italic font-medium' : 'bg-white border border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 shadow-sm'}`} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        {selectedRole?.isSystem ? (
                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl shadow-lg">
                                                <Lock className="w-3.5 h-3.5 text-red-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">System Role</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {selectedRole && (
                                                    <button onClick={handleDeleteRole} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl border border-gray-100 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={handleSaveRole} disabled={saving}
                                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                                                    <Save className="w-3.5 h-3.5" />
                                                    {saving ? 'Saving...' : (isCreatingRole ? 'Create Role' : 'Save Changes')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 max-h-[600px] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                                            <div key={category} className="space-y-4">
                                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">{category}</h5>
                                                    {!selectedRole?.isSystem && (
                                                        <button onClick={() => {
                                                            const all = (perms as Permission[]).map(p => p.name);
                                                            const cur = new Set(selectedPerms);
                                                            const hasAll = all.every(p => cur.has(p));
                                                            hasAll ? all.forEach(p => cur.delete(p)) : all.forEach(p => cur.add(p));
                                                            setSelectedPerms(cur);
                                                        }} className="text-[9px] font-black text-red-600 hover:underline uppercase">Toggle All</button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {(perms as Permission[]).map(p => {
                                                        const active = selectedPerms.has(p.name);
                                                        return (
                                                            <label key={p.name} className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${active ? 'bg-red-50/30 border-red-100' : 'bg-white border-transparent'} ${selectedRole?.isSystem ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'}`}>
                                                                <div className="relative flex items-center">
                                                                    <input type="checkbox" checked={active} onChange={() => togglePerm(p.name)}
                                                                        disabled={selectedRole?.isSystem} className="w-4 h-4 rounded-md accent-red-600 cursor-pointer disabled:opacity-30" />
                                                                    {active && <CheckCircle2 className="w-2.5 h-2.5 absolute left-[3px] top-[3px] text-white pointer-events-none" />}
                                                                </div>
                                                                <span className={`text-[11px] font-bold uppercase transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}>{p.displayName}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-2">
                                        <Lock className={`w-3 h-3 ${selectedRole?.isSystem ? 'text-red-500' : 'text-emerald-500'}`} />
                                        {selectedPerms.size} permissions selected
                                    </div>
                                    {isCreatingRole && (
                                        <button onClick={() => { setIsCreatingRole(false); if (roles.length > 0) handleSelectRole(roles[0]); }}
                                            className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                            <X className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[700px] border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-400 gap-6 group hover:border-red-100 transition-all">
                                <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                                    <Shield className="w-10 h-10 opacity-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select or create a role</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── DEPARTMENTS TAB ─────────────────────────────────────────── */}
            {activeTab === 'departments' && (
                <div className="space-y-6">

                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                                <p className="text-lg font-black text-gray-900">{departments.length} Departments</p>
                            </div>
                        </div>
                        {canManage && (
                            <button onClick={openCreateDept}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                <Plus className="w-4 h-4" /> New Department
                            </button>
                        )}
                    </div>

                    {/* Department grid */}
                    {deptsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-100 rounded-3xl p-16 text-center">
                            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No departments yet</p>
                            {canManage && (
                                <button onClick={openCreateDept} className="mt-4 text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">
                                    Create your first department
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {departments.map(dept => (
                                <div key={dept.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 space-y-4 group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-sm group-hover:bg-red-600 transition-colors">
                                                {dept.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{dept.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{dept.tenantName}</p>
                                            </div>
                                        </div>
                                        {canManage && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditDept(dept)}
                                                    className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteDept(dept)}
                                                    className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {dept.description && (
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{dept.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                            <Users className="w-3 h-3" />
                                            {dept.employeeCount} employees
                                        </div>
                                        {dept.headUserName ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                <User className="w-3 h-3 text-red-400" />
                                                {dept.headUserName}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300">
                                                <User className="w-3 h-3" />
                                                No head assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Department form modal */}
                    {isCreatingDept && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeDeptForm} />
                            <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                                            {editingDept ? 'Edit' : 'New'} <span className="text-red-600">Department</span>
                                        </h2>
                                        <p className="text-xs text-gray-400 font-medium">Define structure and assign a department head.</p>
                                    </div>
                                    <button onClick={closeDeptForm} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className={labelCls}>Department Name</label>
                                        <input type="text" required value={deptForm.name}
                                            onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                                            className={inputCls} placeholder="e.g. Engineering" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Description (Optional)</label>
                                        <textarea value={deptForm.description || ''}
                                            onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                                            className={inputCls + ' resize-none'} rows={2}
                                            placeholder="What does this department do?" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Department Head (Optional)</label>
                                        <select value={deptForm.headUserId || ''}
                                            onChange={e => setDeptForm({ ...deptForm, headUserId: e.target.value || null })}
                                            className={inputCls}>
                                            <option value="">No head assigned</option>
                                            {availableUsers.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.firstName} {u.lastName} — {u.email}
                                                </option>
                                            ))}
                                        </select>
                                        {deptForm.headUserId && (() => {
                                            const u = availableUsers.find(u => u.id === deptForm.headUserId);
                                            return u ? (
                                                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
                                                    <Mail className="w-3 h-3 text-blue-400" />
                                                    <span className="text-[10px] font-bold text-blue-600">{u.email}</span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-50 flex items-center justify-end gap-3">
                                    <button onClick={closeDeptForm} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveDept} disabled={deptSaving}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                        <Save className="w-3.5 h-3.5" />
                                        {deptSaving ? 'Saving...' : (editingDept ? 'Save Changes' : 'Create Department')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
