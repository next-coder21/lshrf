import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Clock,
    Shield,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { leaveApi } from '../api/leaveApi';
import { LeaveTypeConfig, CreateLeaveTypeRequest } from '../types/leave.types';
import clsx from 'clsx';

export function LeaveTypeConfigPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<LeaveTypeConfig | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [formData, setFormData] = useState<CreateLeaveTypeRequest>({
        name: '',
        code: '',
        description: '',
        daysCredited: 0,
        creditFrequency: 'YEARLY',
        isPaid: true,
        isActive: true
    });

    useEffect(() => { loadLeaveTypes(); }, []);

    const loadLeaveTypes = async () => {
        try {
            setLoading(true);
            const data = await leaveApi.getLeaveTypes();
            setLeaveTypes(data);
        } catch (error) {
            toast.error('Failed to load leave types');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await leaveApi.updateLeaveType(editingType.id, formData);
                toast.success('Leave type updated successfully');
            } else {
                await leaveApi.createLeaveType(formData);
                toast.success('Leave type created successfully');
            }
            setShowModal(false);
            resetForm();
            loadLeaveTypes();
        } catch (error) {
            toast.error(editingType ? 'Failed to update leave type' : 'Failed to create leave type');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this leave type?')) return;
        try {
            await leaveApi.deleteLeaveType(id);
            toast.success('Leave type deleted successfully');
            loadLeaveTypes();
        } catch (error) {
            toast.error('Failed to delete leave type');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            daysCredited: 0,
            creditFrequency: 'YEARLY',
            isPaid: true,
            isActive: true
        });
        setEditingType(null);
    };

    const openEditModal = (type: LeaveTypeConfig) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            code: type.code,
            description: type.description,
            daysCredited: type.daysCredited || 0,
            creditFrequency: type.creditFrequency || 'YEARLY',
            isPaid: type.isPaid,
            isActive: type.isActive
        });
        setShowModal(true);
    };

    const filteredTypes = filterStatus === 'ALL'
        ? leaveTypes
        : filterStatus === 'ACTIVE'
            ? leaveTypes.filter(t => t.isActive)
            : leaveTypes.filter(t => !t.isActive);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Leave <span className="text-red-600">Type Configuration</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Policy Framework Management</p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create Policy
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Policies', count: leaveTypes.length, icon: Shield, color: 'text-gray-900', bg: 'bg-gray-50' },
                    { label: 'Active Policies', count: leaveTypes.filter(t => t.isActive).length, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Paid Leave Types', count: leaveTypes.filter(t => t.isPaid).length, icon: FileText, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.count}</p>
                        </div>
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={clsx("w-6 h-6", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
                {['ALL', 'ACTIVE', 'INACTIVE'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setFilterStatus(filter)}
                        className={clsx(
                            "px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            filterStatus === filter
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Leave Types Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-8 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            ) : filteredTypes.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-32 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                        <Shield className="w-16 h-16 text-gray-900" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Leave Policies Found</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTypes.map((type) => (
                        <div
                            key={type.id}
                            className={clsx(
                                "bg-white rounded-[2rem] border p-8 hover:shadow-xl transition-all group",
                                type.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60 grayscale'
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">{type.name}</h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {type.code}
                                        </span>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            type.isPaid
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                        )}>
                                            {type.isPaid ? 'PAID' : 'UNPAID'}
                                        </span>
                                    </div>
                                </div>
                                {!type.isActive && (
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">INACTIVE</span>
                                )}
                            </div>

                            {/* Description */}
                            {type.description && (
                                <p className="text-xs text-gray-600 mb-6 line-clamp-2 font-medium">{type.description}</p>
                            )}

                            {/* Days Info */}
                            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <Clock className="text-red-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{(type.creditFrequency || 'YEARLY').replace('_', ' ')} Allowance</p>
                                    <p className="text-lg font-black text-gray-900">{type.daysCredited || 0} <span className="text-xs font-bold text-gray-400">days</span></p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => openEditModal(type)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(type.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm(); }} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                        {editingType ? 'Edit' : 'Create'} <span className="text-red-600">Leave Policy</span>
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {editingType ? 'Update Policy Details' : 'Define New Leave Type'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                        Policy Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        placeholder="e.g. Annual Vacation Leave"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Code
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none uppercase"
                                            placeholder="AVL"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Days Credited
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.5"
                                            value={formData.daysCredited}
                                            onChange={(e) => setFormData({ ...formData, daysCredited: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            placeholder="21"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Frequency
                                        </label>
                                        <select
                                            required
                                            value={formData.creditFrequency}
                                            onChange={(e) => setFormData({ ...formData, creditFrequency: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none appearance-none"
                                        >
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="YEARLY">Yearly</option>
                                            <option value="ONE_TIME">One Time</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                        placeholder="Describe eligibility and usage guidelines..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Paid Leave</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all flex items-center px-0.5",
                                                formData.isPaid ? 'bg-gray-900' : 'bg-gray-300'
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-5 h-5 bg-white rounded-full shadow transition-transform",
                                                formData.isPaid ? 'translate-x-6' : 'translate-x-0'
                                            )} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Active</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all flex items-center px-0.5",
                                                formData.isActive ? 'bg-gray-900' : 'bg-gray-300'
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-5 h-5 bg-white rounded-full shadow transition-transform",
                                                formData.isActive ? 'translate-x-6' : 'translate-x-0'
                                            )} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    {editingType ? 'Update Policy' : 'Create Policy'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}