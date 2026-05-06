import { useState, useEffect } from 'react';
import { UserPlus, Calendar, Clock, X, Search, FileText, User, Edit2 } from 'lucide-react';
import { shiftApi } from '../api/shiftApi';
import { employeeApi } from '@/features/employees/api/employeeApi';
import type { Shift, ShiftAssignment, AssignShiftRequest, UpdateAssignmentRequest } from '../types/shift.types';
import type { Employee } from '@/features/employees/types/employee.types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const formatTime = (time: string) => (time ? time.substring(0, 5) : '');

export function ShiftAssignmentPage() {
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<AssignShiftRequest>({
        employeeId: '',
        shiftId: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        notes: '',
    });

    const [editFormData, setEditFormData] = useState<UpdateAssignmentRequest>({
        effectiveFrom: '',
        effectiveTo: '',
        notes: '',
        status: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [assignmentsData, shiftsData, employeesData] = await Promise.all([
                shiftApi.getAllActiveAssignments(),
                shiftApi.getActiveShifts(),
                employeeApi.getAll(),
            ]);
            setAssignments(assignmentsData);
            setShifts(shiftsData);
            setEmployees(employeesData);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employeeId || !formData.shiftId) {
            toast.error('Please select both employee and shift');
            return;
        }

        try {
            const submitData = {
                ...formData,
                effectiveTo: formData.effectiveTo || undefined
            };
            await shiftApi.assignShift(submitData);
            toast.success('Shift assigned successfully');
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign shift');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this assignment?')) return;
        try {
            await shiftApi.cancelAssignment(id);
            toast.success('Assignment cancelled');
            loadData();
        } catch (error) {
            toast.error('Failed to cancel assignment');
        }
    };

    const handleEditClick = (assignment: ShiftAssignment) => {
        setEditingAssignment(assignment);
        setEditFormData({
            effectiveFrom: assignment.effectiveFrom,
            effectiveTo: assignment.effectiveTo || '',
            notes: assignment.notes || '',
            status: assignment.status,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssignment) return;
        try {
            const submitData = {
                ...editFormData,
                effectiveTo: editFormData.effectiveTo || undefined,
            };
            await shiftApi.updateAssignment(editingAssignment.id, submitData);
            toast.success('Assignment updated successfully');
            setShowEditModal(false);
            setEditingAssignment(null);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update assignment');
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            shiftId: '',
            effectiveFrom: new Date().toISOString().split('T')[0],
            effectiveTo: '',
            notes: '',
        });
    };

    const filteredAssignments = assignments.filter(a =>
        a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.employeeId_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.shiftName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'COMPLETED':
                return 'bg-gray-50 text-gray-500 border-gray-100';
            default:
                return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Shift <span className="text-red-600">Assignments</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Resource Schedule Allocation</p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Assign Shift
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Assignments', count: assignments.length, icon: User, color: 'text-gray-900', bg: 'bg-gray-50' },
                    { label: 'Active Shifts', count: shifts.length, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Active Employees', count: employees.length, icon: UserPlus, color: 'text-red-500', bg: 'bg-red-50' }
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

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by personnel or shift..."
                            className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20 bg-gray-50/10 transition-all border-b border-gray-50 overflow-hidden" />
                                ))
                            ) : filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <FileText className="w-16 h-16 text-gray-900" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Assignments Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md uppercase">
                                                    {assignment.employeeName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{assignment.employeeName}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{assignment.employeeId_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{assignment.shiftName}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Clock className="w-3.5 h-3.5 text-red-500" />
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {formatTime(assignment.shiftStartTime)} - {formatTime(assignment.shiftEndTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-gray-700">
                                                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                                                    {assignment.effectiveFrom} {assignment.effectiveTo ? ` - ${assignment.effectiveTo}` : ''}
                                                </div>
                                                {assignment.isOngoing ? (
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ongoing Schedule</span>
                                                ) : (
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fixed Period Assignment</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest",
                                                getStatusStyle(assignment.status)
                                            )}>
                                                {assignment.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {assignment.status === 'ACTIVE' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(assignment)}
                                                        className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(assignment.id)}
                                                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm(); }} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Assign <span className="text-red-600">Personnel Shift</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Allocation Protocol</p>
                                </div>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Select Personnel</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                    >
                                        <option value="">Search personnel...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Target Shift</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        value={formData.shiftId}
                                        onChange={e => setFormData({ ...formData, shiftId: e.target.value })}
                                    >
                                        <option value="">Select shift schedule...</option>
                                        {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({formatTime(s.startTime)} - {formatTime(s.endTime)})</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Effective From</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={formData.effectiveFrom}
                                            onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Effective To</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={formData.effectiveTo}
                                            onChange={e => setFormData({ ...formData, effectiveTo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Allocation Notes</label>
                                    <textarea
                                        placeholder="Specific instructions or notes for this allocation..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none h-32 resize-none"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    Authorize Allocation
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Assignment Modal */}
            {showEditModal && editingAssignment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingAssignment(null); }} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Edit <span className="text-red-600">Assignment</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{editingAssignment.employeeName} — {editingAssignment.shiftName}</p>
                                </div>
                                <button onClick={() => { setShowEditModal(false); setEditingAssignment(null); }} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Effective From</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={editFormData.effectiveFrom}
                                            onChange={e => setEditFormData({ ...editFormData, effectiveFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Effective To</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={editFormData.effectiveTo}
                                            onChange={e => setEditFormData({ ...editFormData, effectiveTo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Status</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        value={editFormData.status}
                                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Notes</label>
                                    <textarea
                                        placeholder="Assignment notes..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none h-28 resize-none"
                                        value={editFormData.notes}
                                        onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
