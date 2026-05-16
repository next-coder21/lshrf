import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendance, checkIn, checkOut } from '../store/attendanceSlice';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import toast from 'react-hot-toast';
import {
    Clock, LogIn, LogOut, Search,
    Calendar as CalendarIcon,
    Download, MapPin, Gauge,
    CheckCircle2, AlertTriangle, Coffee,
    ChevronDown, History, Users, ClipboardEdit, X,
    ThumbsUp, ThumbsDown
} from 'lucide-react';
import clsx from 'clsx';
import { EmptyState } from '@/common/components/EmptyState';
import { Attendance, RegularizationResponse } from '../types/attendance.types';
import { attendanceApi } from '../api/attendanceApi';
import axiosInstance from '@/lib/api/axiosInstance';

export const AttendancePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { logs, loading } = useSelector((state: RootState) => state.attendance);
    const { employees } = useSelector((state: RootState) => state.employees);
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [todaySession, setTodaySession] = useState<Attendance | null>(null);
    const [todayLoading, setTodayLoading] = useState(true);
    const [sessionActionLoading, setSessionActionLoading] = useState(false);
    const [teamLogs, setTeamLogs] = useState<Attendance[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);

    const isManager = user?.role === 'MANAGER' || user?.role === 'CLIENT_ADMIN';
    const today = new Date().toISOString().split('T')[0];
    const currentEmployee = employees.find(e => e.email === user?.email);

    // Regularization modal state
    const [showRegModal, setShowRegModal] = useState(false);
    const [regDate, setRegDate] = useState('');
    const [regCheckIn, setRegCheckIn] = useState('');
    const [regCheckOut, setRegCheckOut] = useState('');
    const [regReason, setRegReason] = useState('');
    const [regSubmitting, setRegSubmitting] = useState(false);

    // Pending regularizations for managers
    const [pendingRegs, setPendingRegs] = useState<RegularizationResponse[]>([]);
    const [pendingRegsLoading, setPendingRegsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'team' | 'regularizations'>('all');

    useEffect(() => {
        dispatch(fetchAttendance());
        dispatch(fetchEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (isManager && activeTab === 'team') {
            setTeamLoading(true);
            axiosInstance.get<Attendance[]>('/attendance/team')
                .then(r => setTeamLogs(r.data))
                .catch(() => toast.error('Failed to load team attendance'))
                .finally(() => setTeamLoading(false));
        }
        if (isManager && activeTab === 'regularizations') {
            setPendingRegsLoading(true);
            attendanceApi.getPendingRegularizations()
                .then(data => setPendingRegs(data))
                .catch(() => toast.error('Failed to load regularization requests'))
                .finally(() => setPendingRegsLoading(false));
        }
    }, [isManager, activeTab]);

    useEffect(() => {
        if (!currentEmployee) {
            setTodayLoading(false);
            return;
        }
        axiosInstance.get<Attendance[]>(`/attendance/employee/${currentEmployee.id}`)
            .then(r => {
                const todayRecord = r.data.find((a: Attendance) => a.date === today) || null;
                setTodaySession(todayRecord);
            })
            .catch(() => setTodaySession(null))
            .finally(() => setTodayLoading(false));
    }, [currentEmployee, today]);

    const handleTodayClockIn = async () => {
        if (!currentEmployee) { toast.error('Employee profile not found'); return; }
        setSessionActionLoading(true);
        try {
            await dispatch(checkIn({
                employeeId: currentEmployee.id,
                notes: 'Attendance page clock-in',
                location: 'Office'
            })).unwrap();
            // Refresh today record
            const r = await axiosInstance.get<Attendance[]>(`/attendance/employee/${currentEmployee.id}`);
            setTodaySession(r.data.find((a: Attendance) => a.date === today) || null);
            toast.success('Clocked in successfully!');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Clock-in failed');
        } finally {
            setSessionActionLoading(false);
        }
    };

    const handleTodayClockOut = async () => {
        if (!currentEmployee) { toast.error('Employee profile not found'); return; }
        setSessionActionLoading(true);
        try {
            await dispatch(checkOut({
                employeeId: currentEmployee.id,
                notes: 'Attendance page clock-out',
                location: 'Office'
            })).unwrap();
            const r = await axiosInstance.get<Attendance[]>(`/attendance/employee/${currentEmployee.id}`);
            setTodaySession(r.data.find((a: Attendance) => a.date === today) || null);
            toast.success('Clocked out successfully!');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Clock-out failed');
        } finally {
            setSessionActionLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedEmployeeId) { toast.error('Please select an employee'); return; }
        try {
            await dispatch(checkIn({
                employeeId: selectedEmployeeId,
                notes,
                location: 'Main Office, Block A',
                latitude: 40.7128,
                longitude: -74.0060
            })).unwrap();
            setNotes('');
            toast.success('Clock-in recorded');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        if (!selectedEmployeeId) { toast.error('Please select an employee'); return; }
        try {
            await dispatch(checkOut({
                employeeId: selectedEmployeeId,
                notes,
                location: 'Main Office, Block A'
            })).unwrap();
            setNotes('');
            toast.success('Clock-out recorded');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Check-out failed');
        }
    };

    const handleRegularizationSubmit = async () => {
        if (!regDate || !regCheckIn || !regCheckOut || !regReason.trim()) {
            toast.error('All fields are required');
            return;
        }
        setRegSubmitting(true);
        try {
            await attendanceApi.submitRegularization({
                date: regDate,
                requestedCheckIn: regCheckIn,
                requestedCheckOut: regCheckOut,
                reason: regReason.trim(),
            });
            toast.success('Correction request submitted successfully');
            setShowRegModal(false);
            setRegDate('');
            setRegCheckIn('');
            setRegCheckOut('');
            setRegReason('');
        } catch {
            toast.error('Failed to submit correction request');
        } finally {
            setRegSubmitting(false);
        }
    };

    const handleReviewRegularization = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await attendanceApi.reviewRegularization(id, status);
            toast.success(`Request ${status.toLowerCase()} successfully`);
            setPendingRegs(prev => prev.filter(r => r.id !== id));
        } catch {
            toast.error('Failed to review request');
        }
    };

    const exportToCSV = () => {
        const headers = ["Employee", "Date", "Check In", "Check Out", "Status", "Duration (Min)", "Notes"];
        const rows = filteredLogs.map(log => [
            log.employeeName,
            log.date,
            log.checkIn || '',
            log.checkOut || '',
            log.status,
            log.workDurationMinutes?.toString() || '0',
            log.notes || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${dateFilter}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'LATE': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'HALF_DAY': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ABSENT': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesDate = log.date === dateFilter;
        const matchesSearch = log.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesSearch;
    });

    const stats = {
        total: filteredLogs.length,
        onTime: filteredLogs.filter(l => l.status === 'PRESENT').length,
        late: filteredLogs.filter(l => l.status === 'LATE').length,
        avgHours: filteredLogs.length > 0
            ? (filteredLogs.reduce((acc, curr) => acc + (curr.workDurationMinutes || 0), 0) / filteredLogs.length / 60).toFixed(1)
            : '0'
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-gray-50/30 min-h-screen">
            {/* Header & Global Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                        Precision <span className="text-red-600">Attendance</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Monitoring Active</p>
                    </div>
                    {isManager && (
                        <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={clsx("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", activeTab === 'all' ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700")}
                            >
                                <History className="w-3 h-3" /> All Records
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={clsx("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", activeTab === 'team' ? "bg-red-600 text-white" : "text-gray-400 hover:text-gray-700")}
                            >
                                <Users className="w-3 h-3" /> My Team
                            </button>
                            <button
                                onClick={() => setActiveTab('regularizations')}
                                className={clsx("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", activeTab === 'regularizations' ? "bg-amber-500 text-white" : "text-gray-400 hover:text-gray-700")}
                            >
                                <ClipboardEdit className="w-3 h-3" /> Regularizations
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                        <button
                            onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                            className={clsx(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                dateFilter === new Date().toISOString().split('T')[0] ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900"
                            )}
                        >
                            Today
                        </button>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-transparent border-none text-xs font-black uppercase p-2 focus:ring-0 cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={() => setShowRegModal(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm active:scale-95"
                    >
                        <ClipboardEdit className="w-4 h-4" />
                        Request Correction
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4 text-red-600" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Today's Session Widget */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Session</p>
                        <p className="text-sm font-black text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {todayLoading ? (
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Loading...</p>
                        ) : todaySession?.checkIn ? (
                            <div className="flex items-center gap-4 mt-1">
                                <div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In</span>
                                    <p className="text-lg font-black text-emerald-600">{todaySession.checkIn.substring(0, 5)}</p>
                                </div>
                                {todaySession.checkOut && (
                                    <div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Out</span>
                                        <p className="text-lg font-black text-red-600">{todaySession.checkOut.substring(0, 5)}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Not clocked in</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {!todaySession?.checkIn && (
                            <button
                                onClick={handleTodayClockIn}
                                disabled={sessionActionLoading}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20",
                                    sessionActionLoading && "opacity-50 cursor-wait"
                                )}
                            >
                                <LogIn className="w-4 h-4" />
                                Clock In
                            </button>
                        )}
                        {todaySession?.checkIn && !todaySession?.checkOut && (
                            <button
                                onClick={handleTodayClockOut}
                                disabled={sessionActionLoading}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/20",
                                    sessionActionLoading && "opacity-50 cursor-wait"
                                )}
                            >
                                <LogOut className="w-4 h-4" />
                                Clock Out
                            </button>
                        )}
                        {todaySession?.checkIn && todaySession?.checkOut && (
                            <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Shift Complete
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Force', value: stats.total, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Arrival Lates', value: stats.late, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Avg Stay Time', value: `${stats.avgHours}h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'On Schedule', value: `${stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}%`, icon: Gauge, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                        </div>
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={clsx("w-6 h-6", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Center */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <Coffee className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Access Point</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identify & Confirm Session</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Personnel Lookup</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} [{emp.employeeId}]</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session Context</label>
                                    <textarea
                                        placeholder="Add operational notes..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none h-28"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={handleCheckIn}
                                        className="relative overflow-hidden group/btn flex flex-col items-center gap-3 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-500 active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                        <LogIn className="w-8 h-8 relative z-10 group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Clock In</span>
                                    </button>
                                    <button
                                        onClick={handleCheckOut}
                                        className="relative overflow-hidden group/btn flex flex-col items-center gap-3 p-8 bg-red-50 rounded-[2.5rem] border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-500 active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                        <LogOut className="w-8 h-8 relative z-10 group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Clock Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Live Security</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed">
                            All sessions are timestamped and geo-tagged to the Main Office gateway.
                            Unauthorized check-ins from external IPs will be flagged.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current Gateway:</span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Block-A_WIFI_5G</span>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {activeTab === 'team' ? <>My Team <span className="text-red-600">Activity</span></> : <>Force <span className="text-red-600">Activity Log</span></>}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    {activeTab === 'team' ? 'Department-scoped attendance records' : 'Real-time Session Monitoring'}
                                </p>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold w-full md:w-64 focus:ring-2 focus:ring-red-500/20 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Session Timeline</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Metrics</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Auth Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Context</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(activeTab === 'team' ? teamLoading : loading) ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="animate-pulse h-20 bg-gray-50/10" tabIndex={-1}><td colSpan={5}></td></tr>
                                        ))
                                    ) : (activeTab === 'team' ? teamLogs : filteredLogs).length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyState icon={Clock} title="No attendance records" description="Check in to start tracking your day" />
                                            </td>
                                        </tr>
                                    ) : (activeTab === 'team' ? teamLogs : filteredLogs).map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                                                        {log.employeeName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{log.employeeName}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {log.employeeId.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-emerald-600 mb-0.5">{log.checkIn?.substring(0, 5) || '--'}</p>
                                                        <div className="w-8 h-1 bg-emerald-100 rounded-full mx-auto" />
                                                    </div>
                                                    <div className="w-12 h-px bg-gray-100 relative">
                                                        <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-gray-200" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-red-600 mb-0.5">{log.checkOut?.substring(0, 5) || '--'}</p>
                                                        <div className="w-8 h-1 bg-red-100 rounded-full mx-auto" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-900">
                                                        {log.workDurationMinutes ? (log.workDurationMinutes / 60).toFixed(1) : '0.0'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hrs Logged</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest inline-flex items-center gap-1.5",
                                                    getStatusStyle(log.status)
                                                )}>
                                                    <span className={clsx("w-1.5 h-1.5 rounded-full",
                                                        log.status === 'PRESENT' ? 'bg-emerald-500' :
                                                            log.status === 'LATE' ? 'bg-amber-500' : 'bg-gray-500'
                                                    )} />
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    title={log.notes || 'No notes available'}
                                                    className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors uppercase text-[9px] font-black tracking-widest flex items-center gap-2 ml-auto"
                                                >
                                                    <MapPin className="w-3 h-3" />
                                                    View Trace
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regularizations Panel — manager only */}
            {isManager && activeTab === 'regularizations' && (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            Pending <span className="text-amber-500">Regularizations</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Review and action employee correction requests
                        </p>
                    </div>
                    {pendingRegsLoading ? (
                        <div className="p-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading...</div>
                    ) : pendingRegs.length === 0 ? (
                        <div className="p-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending requests</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested Times</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pendingRegs.map(reg => (
                                        <tr key={reg.id} className="hover:bg-gray-50/80 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{reg.employeeName}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{reg.employeeId.substring(0, 8)}...</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900">{reg.date}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-emerald-600">{reg.requestedCheckIn.substring(0, 5)}</span>
                                                    <span className="text-gray-300">—</span>
                                                    <span className="text-[10px] font-black text-red-600">{reg.requestedCheckOut.substring(0, 5)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-gray-600 max-w-xs truncate" title={reg.reason}>{reg.reason}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleReviewRegularization(reg.id, 'APPROVED')}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <ThumbsUp className="w-3 h-3" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewRegularization(reg.id, 'REJECTED')}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <ThumbsDown className="w-3 h-3" /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Request Correction Modal */}
            {showRegModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md mx-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Request Correction</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Submit attendance regularization</p>
                            </div>
                            <button
                                onClick={() => setShowRegModal(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date</label>
                                <input
                                    type="date"
                                    value={regDate}
                                    onChange={e => setRegDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Check-In Time</label>
                                    <input
                                        type="time"
                                        value={regCheckIn}
                                        onChange={e => setRegCheckIn(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Check-Out Time</label>
                                    <input
                                        type="time"
                                        value={regCheckOut}
                                        onChange={e => setRegCheckOut(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Reason</label>
                                <textarea
                                    placeholder="Explain why you need this correction..."
                                    value={regReason}
                                    onChange={e => setRegReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-amber-400/30 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowRegModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRegularizationSubmit}
                                disabled={regSubmitting}
                                className={clsx(
                                    "flex-1 py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95",
                                    regSubmitting && "opacity-50 cursor-wait"
                                )}
                            >
                                {regSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
