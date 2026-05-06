import { useState, useEffect } from 'react';
import { Plus, Clock, Coffee, Trash2, Edit2, AlertCircle, X, Shield, Timer } from 'lucide-react';
import { shiftApi } from '../api/shiftApi';
import type { Shift, CreateShiftRequest } from '../types/shift.types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SHIFT_TYPES = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'GENERAL'];

const SHIFT_TYPE_COLORS: Record<string, string> = {
    MORNING: 'bg-amber-50 text-amber-600',
    AFTERNOON: 'bg-orange-50 text-orange-600',
    EVENING: 'bg-indigo-50 text-indigo-600',
    NIGHT: 'bg-purple-50 text-purple-600',
    GENERAL: 'bg-gray-50 text-gray-600',
};

const formatTime = (time: string) => (time ? time.substring(0, 5) : '');

const formatWorkingHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export function ShiftListPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [isActiveEdit, setIsActiveEdit] = useState(true);

    const [formData, setFormData] = useState<CreateShiftRequest>({
        name: '',
        startTime: '',
        endTime: '',
        breakDurationMinutes: 0,
        description: '',
        shiftType: 'GENERAL',
    });

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            setLoading(true);
            const data = await shiftApi.getAllShifts();
            setShifts(data);
        } catch (error) {
            toast.error('Failed to load shifts');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await shiftApi.updateShift(editingShift.id, { ...formData, isActive: isActiveEdit });
                toast.success('Shift updated successfully');
            } else {
                await shiftApi.createShift(formData);
                toast.success('Shift created successfully');
            }
            setShowModal(false);
            resetForm();
            loadShifts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save shift');
        }
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        setIsActiveEdit(shift.isActive);
        setFormData({
            name: shift.name,
            startTime: formatTime(shift.startTime),
            endTime: formatTime(shift.endTime),
            breakDurationMinutes: shift.breakDurationMinutes || 0,
            description: shift.description || '',
            shiftType: shift.shiftType,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;
        try {
            await shiftApi.deleteShift(id);
            toast.success('Shift deleted successfully');
            loadShifts();
        } catch (error) {
            toast.error('Failed to delete shift');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            startTime: '',
            endTime: '',
            breakDurationMinutes: 0,
            description: '',
            shiftType: 'GENERAL',
        });
        setEditingShift(null);
        setIsActiveEdit(true);
    };

    const filteredShifts = filterType === 'ALL'
        ? shifts
        : shifts.filter(s => s.shiftType === filterType);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Shift <span className="text-red-600">Management</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Work Schedule Configuration</p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create Shift
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Shifts', count: shifts.length, icon: Shield, color: 'text-gray-900', bg: 'bg-gray-50' },
                    { label: 'Active Shifts', count: shifts.filter(s => s.isActive).length, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Shift Types', count: new Set(shifts.map(s => s.shiftType)).size, icon: Coffee, color: 'text-red-500', bg: 'bg-red-50' }
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
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterType('ALL')}
                    className={clsx(
                        "px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                        filterType === 'ALL'
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                    )}
                >
                    All
                </button>
                {SHIFT_TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={clsx(
                            "px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            filterType === type
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Shifts Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-8 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredShifts.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-32 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                        <AlertCircle className="w-16 h-16 text-gray-900" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Shifts Found</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShifts.map((shift) => (
                        <div
                            key={shift.id}
                            className={clsx(
                                "bg-white rounded-[2rem] border p-8 hover:shadow-xl transition-all group",
                                shift.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60 grayscale'
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">{shift.name}</h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            SHIFT_TYPE_COLORS[shift.shiftType]
                                        )}>
                                            {shift.shiftType}
                                        </span>
                                    </div>
                                </div>
                                {!shift.isActive && (
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">INACTIVE</span>
                                )}
                            </div>

                            {/* Time Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                        <Clock className="text-red-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Working Hours</p>
                                        <p className="text-sm font-black text-gray-900">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</p>
                                    </div>
                                </div>
                                {shift.workingHoursInMinutes > 0 && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <Timer className="text-blue-500 w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Net Work Time</p>
                                            <p className="text-sm font-black text-gray-900">{formatWorkingHours(shift.workingHoursInMinutes)}</p>
                                        </div>
                                    </div>
                                )}
                                {(shift.breakDurationMinutes || 0) > 0 && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                            <Coffee className="text-amber-500 w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Break Duration</p>
                                            <p className="text-sm font-black text-gray-900">{shift.breakDurationMinutes} <span className="text-xs font-bold text-gray-400">minutes</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {shift.description && (
                                <p className="text-xs text-gray-600 mb-6 line-clamp-2 font-medium">{shift.description}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(shift)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(shift.id)}
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
                                        {editingShift ? 'Edit' : 'Create'} <span className="text-red-600">Shift</span>
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {editingShift ? 'Update Shift Details' : 'Define New Work Schedule'}
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
                                        Shift Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        placeholder="e.g. Morning Shift"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Shift Type
                                        </label>
                                        <select
                                            value={formData.shiftType}
                                            onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        >
                                            {SHIFT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                            Break (mins)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.breakDurationMinutes}
                                            onChange={(e) => setFormData({ ...formData, breakDurationMinutes: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            placeholder="60"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                        placeholder="Brief description of the shift..."
                                    />
                                </div>

                                {editingShift && (
                                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Status</p>
                                            <p className={clsx("text-sm font-black mt-0.5", isActiveEdit ? 'text-emerald-600' : 'text-gray-400')}>
                                                {isActiveEdit ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsActiveEdit(!isActiveEdit)}
                                            className={clsx(
                                                "relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none",
                                                isActiveEdit ? 'bg-emerald-500' : 'bg-gray-300'
                                            )}
                                        >
                                            <span className={clsx(
                                                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                                                isActiveEdit ? 'translate-x-6' : 'translate-x-0.5'
                                            )} />
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    {editingShift ? 'Update Shift' : 'Create Shift'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
