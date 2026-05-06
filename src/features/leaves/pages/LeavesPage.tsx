import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaves, applyLeave, updateLeaveStatus } from '../store/leaveSlice';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import {
    Calendar, Plus, Clock,
    CheckCircle2, XCircle, AlertCircle,
    Filter, Search, MoreVertical,
    FileText, User, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { LeaveType, LeaveStatus, LeaveTypeConfig } from '../types/leave.types';
import { leaveApi } from '../api/leaveApi';

export const LeavesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { leaves, loading } = useSelector((state: RootState) => state.leaves);
    const { employees } = useSelector((state: RootState) => state.employees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        startDate: '',
        endDate: '',
        leaveTypeConfigId: '',
        reason: ''
    });

    useEffect(() => {
        dispatch(fetchLeaves());
        dispatch(fetchEmployees());
        leaveApi.getActiveLeaveTypes().then(setLeaveTypes).catch(console.error);
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(applyLeave({ ...formData } as any)).unwrap();
            setIsModalOpen(false);
            setFormData({ employeeId: '', startDate: '', endDate: '', leaveTypeConfigId: '', reason: '' });
        } catch (error: any) {
            alert(error.message || 'Failed to apply leave');
        }
    };

    const handleStatusUpdate = async (id: string, status: LeaveStatus) => {
        const comments = prompt('Enter comments (optional):') || '';
        try {
            await dispatch(updateLeaveStatus({ id, status, comments })).unwrap();
        } catch (error: any) {
            alert(error.message || 'Failed to update status');
        }
    };

    const getStatusStyle = (status: LeaveStatus) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const filteredLeaves = leaves.filter(l =>
        l.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Leave <span className="text-red-600">Management</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Personnel Absence Tracking</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Request Leave
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Approval', count: leaves.filter(l => l.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Approved Requests', count: leaves.filter(l => l.status === 'APPROVED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Recently Rejected', count: leaves.filter(l => l.status === 'REJECTED').length, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' }
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
                            placeholder="Search by personnel..."
                            className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20 bg-gray-50/10" />
                                ))
                            ) : filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                            <FileText className="w-16 h-16 text-gray-900" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Leave Applications Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((l) => (
                                    <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                                                    {l.employeeName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{l.employeeName}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Applied on {new Date(l.appliedDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-gray-700">
                                                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                                                    {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 3600 * 24)) + 1} Days
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-gray-500 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {l.leaveTypeName}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest",
                                                getStatusStyle(l.status)
                                            )}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {l.status === 'PENDING' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(l.id, 'APPROVED')}
                                                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(l.id, 'REJECTED')}
                                                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="p-2.5 bg-gray-50 text-gray-300 rounded-xl cursor-not-allowed">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Request <span className="text-red-600">Personnel Absence</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Leave Application</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <XCircle className="w-5 h-5" />
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
                                        <option value="">Search employee...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Leave Type</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none"
                                        value={formData.leaveTypeConfigId}
                                        onChange={e => setFormData({ ...formData, leaveTypeConfigId: e.target.value })}
                                    >
                                        <option value="">Select Leave Type...</option>
                                        {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Reason</label>
                                    <textarea
                                        required
                                        placeholder="Explain the necessity for this absence..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none h-32 resize-none"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4"
                                >
                                    Transmit Application
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
