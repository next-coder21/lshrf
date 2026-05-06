import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendance, checkIn, checkOut } from '../store/attendanceSlice';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import {
    Clock, LogIn, LogOut, Search,
    Filter, Calendar as CalendarIcon,
    Download, MapPin, Gauge,
    CheckCircle2, AlertTriangle, Coffee,
    ChevronDown, History
} from 'lucide-react';
import clsx from 'clsx';
import { Attendance } from '../types/attendance.types';

export const AttendancePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { logs, loading } = useSelector((state: RootState) => state.attendance);
    const { employees } = useSelector((state: RootState) => state.employees);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        dispatch(fetchAttendance());
        dispatch(fetchEmployees());
    }, [dispatch]);

    const handleCheckIn = async () => {
        if (!selectedEmployeeId) return alert('Please select an employee');
        try {
            await dispatch(checkIn({
                employeeId: selectedEmployeeId,
                notes,
                location: 'Main Office, Block A', // Mock location
                latitude: 40.7128,
                longitude: -74.0060
            })).unwrap();
            setNotes('');
            alert('Clock-in successful!');
        } catch (error: any) {
            alert(error.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        if (!selectedEmployeeId) return alert('Please select an employee');
        try {
            await dispatch(checkOut({
                employeeId: selectedEmployeeId,
                notes,
                location: 'Main Office, Block A' // Mock location
            })).unwrap();
            setNotes('');
            alert('Clock-out successful!');
        } catch (error: any) {
            alert(error.message || 'Check-out failed');
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
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                        Precision <span className="text-red-600">Attendance</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Monitoring Active</p>
                    </div>
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
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4 text-red-600" />
                        Export Data
                    </button>
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
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Force <span className="text-red-600">Activity Log</span></h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Session Monitoring</p>
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
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="animate-pulse h-20 bg-gray-50/10" tabIndex={-1}><td colSpan={5}></td></tr>
                                        ))
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                                                    <History className="w-16 h-16 text-gray-900" />
                                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">Silent Operations Day</p>
                                                    <p className="text-[10px] font-bold text-gray-500 max-w-xs leading-relaxed uppercase">No personnel activity detected for the selected parameters. Verify filters or check system gateways.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.map(log => (
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
        </div>
    );
};
