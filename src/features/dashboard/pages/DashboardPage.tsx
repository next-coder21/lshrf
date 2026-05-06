import {
    Users,
    TrendingUp,
    Calendar,
    DollarSign,
    Activity,
    ArrowUp,
    ArrowDown,
    Clock,
    Plus,
    Filter,
    Search,
    ChevronRight,
    Star,
    Award,
    Building2,
    PieChart,
    Gift
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import axiosInstance from '@/lib/api/axiosInstance';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { fetchAttendance, checkIn, checkOut } from '@/features/attendance/store/attendanceSlice';
import toast from 'react-hot-toast';

interface DashboardData {
    totalEmployees: number;
    onLeaveToday: number;
    monthlyPayroll: number;
    attendanceRate: number;
    departmentStats: Array<{
        name: string;
        count: number;
        percentage: number;
        color: string;
    }>;
    recentActivities: Array<{
        user: string;
        action: string;
        time: string;
        type: string;
        avatar: string;
    }>;
}

export const DashboardPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { logs: attendanceLogs } = useSelector((state: RootState) => state.attendance);
    const { employees } = useSelector((state: RootState) => state.employees);
    
    const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 days');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Find current employee matching the logged-in user
    const currentEmployee = employees.find(e => e.email === user?.email);
    
    // Find today's attendance record for the current employee
    const dateObj = new Date();
    const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const todaysAttendance = attendanceLogs.find(
        log => log.employeeId === currentEmployee?.id && log.date === today
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('/dashboard/stats');
                setDashboardData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        dispatch(fetchEmployees());
        dispatch(fetchAttendance());
    }, [dispatch]);

    const handleShiftAction = async () => {
        if (!currentEmployee) {
            toast.error('Employee profile not found for current user');
            return;
        }

        setActionLoading(true);
        try {
            if (!todaysAttendance || todaysAttendance.status === 'ABSENT') {
                await dispatch(checkIn({
                    employeeId: currentEmployee.id,
                    notes: 'Dashboard quick check-in',
                    location: 'Office (Dashboard)'
                })).unwrap();
                toast.success('Shift started successfully!');
            } else if (!todaysAttendance.checkOut) {
                await dispatch(checkOut({
                    employeeId: currentEmployee.id,
                    notes: 'Dashboard quick check-out',
                    location: 'Office (Dashboard)'
                })).unwrap();
                toast.success('Shift ended successfully!');
            } else {
                toast.error('You have already completed your shift today');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to process shift action');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const upcomingEvents = [
        { title: 'Team Sync Meeting', date: 'Today, 2:00 PM', attendees: 12, color: 'blue' },
        { title: 'Q1 Performance Review', date: 'Tomorrow, 10:00 AM', attendees: 5, color: 'purple' },
        { title: 'Security Training', date: 'Jan 28, 3:00 PM', attendees: 25, color: 'rose' },
    ];

    const stats = user?.role === 'SUPER_ADMIN' ? [
        {
            title: 'Total Tenants',
            value: '24', // Mock for now
            change: '+12%',
            trend: 'up',
            icon: Building2,
            color: 'from-blue-600 to-indigo-600',
            label: 'Active Organizations'
        },
        {
            title: 'System Health',
            value: '99.9%',
            change: 'Stable',
            trend: 'up',
            icon: Activity,
            color: 'from-emerald-600 to-teal-600',
            label: 'All Services Online'
        },
        {
            title: 'Revenue',
            value: '$124K',
            change: '+15.2%',
            trend: 'up',
            icon: DollarSign,
            color: 'from-amber-600 to-orange-600',
            label: 'Monthly Recurring'
        },
        {
            title: 'Support',
            value: '12',
            change: '-4',
            trend: 'down',
            icon: TrendingUp,
            color: 'from-rose-600 to-pink-600',
            label: 'Open Tickets'
        }
    ] : user?.role === 'USER' ? [
        {
            title: 'Leave Balance',
            value: '12',
            change: 'Days',
            trend: 'up',
            icon: Calendar,
            color: 'from-blue-600 to-indigo-600',
            label: 'Annual Leave Remaining'
        },
        {
            title: 'On-Time Rate',
            value: '98%',
            change: '+2%',
            trend: 'up',
            icon: Activity,
            color: 'from-emerald-600 to-teal-600',
            label: 'Personal Attendance'
        },
        {
            title: 'Next Payday',
            value: '7',
            change: 'Days',
            trend: 'up',
            icon: DollarSign,
            color: 'from-amber-600 to-orange-600',
            label: 'Estimated Salary'
        },
        {
            title: 'My Tasks',
            value: '5',
            change: 'Active',
            trend: 'up',
            icon: TrendingUp,
            color: 'from-purple-600 to-pink-600',
            label: 'Pending Reviews'
        }
    ] : [
        {
            title: 'Total Force',
            value: dashboardData?.totalEmployees?.toLocaleString() || '0',
            change: '+2.5%',
            trend: 'up',
            icon: Users,
            color: 'from-blue-600 to-indigo-600',
            label: 'Employees Active'
        },
        {
            title: 'On Leave',
            value: dashboardData?.onLeaveToday?.toString() || '0',
            change: '-1.2%',
            trend: 'down',
            icon: Calendar,
            color: 'from-rose-600 to-pink-600',
            label: 'OutOfOffice Today'
        },
        {
            title: 'Budget',
            value: `$${((dashboardData?.monthlyPayroll || 0) / 1000).toFixed(1)}K`,
            change: '+4.1%',
            trend: 'up',
            icon: DollarSign,
            color: 'from-emerald-600 to-teal-600',
            label: 'Monthly Payroll'
        },
        {
            title: 'Efficiency',
            value: `${(dashboardData?.attendanceRate || 0).toFixed(1)}%`,
            change: '+1.3%',
            trend: 'up',
            icon: Activity,
            color: 'from-amber-500 to-orange-600',
            label: 'Attendance Rate'
        },
    ];

    const recentActivities = dashboardData?.recentActivities || [];
    const departments = dashboardData?.departmentStats || [];

    const anniversaries = [
        { name: 'Alex Rivera', role: 'Sr. Engineer', years: 5, avatar: 'AR' },
        { name: 'Mila Kunis', role: 'Support Lead', years: 2, avatar: 'MK' },
    ];

    const quickActions = user?.role === 'SUPER_ADMIN' ? [
        { name: 'Onboard Client', icon: Building2, color: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white', path: '/onboarding' },
        { name: 'Manage Tenants', icon: Plus, color: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white', path: '/tenants' },
        { name: 'System Logs', icon: Clock, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white', path: '/logs' },
    ] : user?.role === 'USER' ? [
        { name: 'Request Leave', icon: Calendar, color: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white', path: '/leaves' },
        { name: 'My Profile', icon: Users, color: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white', path: '/profile' },
        { name: 'Shift Clock', icon: Clock, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white', path: '/' },
    ] : [
        { name: 'Add Employee', icon: Plus, color: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white', path: '/employees' },
        { name: 'Request Leave', icon: Calendar, color: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white', path: '/leaves' },
        { name: 'Manage Shifts', icon: Clock, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white', path: '/shifts' },
        { name: 'Performance', icon: TrendingUp, color: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white', path: '/performance' },
    ];

    return (
        <div className="min-h-full bg-[#f8fafc] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest">
                        <Star className="w-3 h-3 fill-current" />
                        <span>System Intelligence</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">{user?.firstName || 'Admin'}</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {user?.role === 'SUPER_ADMIN' ? 'Platform overview and system health monitoring.' : 
                         user?.role === 'USER' ? 'Your personal workspace and activity summary.' :
                         'Organization performance snapshot for today.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                        {['Day', 'Week', 'Month'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedTimeframe(period)}
                                className={clsx(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                    selectedTimeframe === period
                                        ? "bg-gray-900 text-white shadow-md active:scale-95"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <button className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Stats with Glassmorphism / Modern Card Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-100 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/5 cursor-pointer overflow-hidden active:scale-98"
                    >
                        {/* Decorative Background Element */}
                        <div className={clsx(
                            "absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 bg-gradient-to-br",
                            stat.color
                        )}></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className={clsx(
                                    "p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:-translate-y-1",
                                    stat.color
                                )}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={clsx(
                                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                    stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-red-600 transition-colors uppercase">
                                    {stat.value}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                                    {stat.title}
                                </p>
                                <p className="text-[10px] font-medium text-gray-500">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bento Grid Content - Auto-Arranging Fluid Layout */}
            <div className={clsx(
                "grid grid-cols-1 gap-8",
                user?.role === 'SUPER_ADMIN' ? "lg:grid-cols-2" : "lg:grid-cols-12"
            )}>
                {/* Main Content Stream */}
                <div className={clsx(
                    "space-y-8",
                    user?.role === 'SUPER_ADMIN' ? "lg:col-span-1" : "lg:col-span-8"
                )}>
                    {/* Performance Insight Card - Only for Org Admins */}
                    {(user?.role === 'ADMIN' || user?.role === 'CLIENT_ADMIN') && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award className="w-24 h-24 text-red-600" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 space-y-3">
                                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        Performance Insight
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                        Your team is performing <span className="text-red-500 underline decoration-red-200 underline-offset-4">12% better</span>
                                    </h2>
                                    <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
                                        Employee satisfaction and productivity scores have reached a record high this period.
                                    </p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <button className="px-4 py-2 text-sm bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2 group/btn">
                                            Full Report <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Visual Progress Mockup */}
                                <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-white shadow-inner flex items-center justify-center relative">
                                    <svg className="w-24 h-24 -rotate-90">
                                        <circle cx="48" cy="48" r="42" className="stroke-gray-100 fill-none" strokeWidth="8" />
                                        <circle cx="48" cy="48" r="42" className="stroke-red-500 fill-none" strokeWidth="8" strokeDasharray="263.89" strokeDashoffset="52.78" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-gray-900">82%</span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity Timeline */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg h-full max-h-[600px] flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Activity Analytics</h2>
                            </div>
                            <button className="text-xs font-bold text-red-600 hover:underline">Full Feed</button>
                        </div>
                        <div className="divide-y divide-gray-50 overflow-y-auto">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-all flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">{activity.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors uppercase">{activity.user}</h4>
                                            <span className="text-[10px] font-medium text-gray-400">{activity.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium truncate">{activity.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Distribution (NEW) - Only for Org Admins */}
                    {(user?.role === 'ADMIN' || user?.role === 'CLIENT_ADMIN') && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Department Force</h2>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Units</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {departments.map((dept, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <div className={clsx("w-1.5 h-4 rounded-full", dept.color)}></div>
                                                <span className="text-sm font-bold text-gray-700">{dept.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-900">{dept.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={clsx("h-full rounded-full transition-all duration-1000", dept.color)} style={{ width: `${dept.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column / Sidebar - Auto Rearranges */}
                <div className={clsx(
                    "space-y-8",
                    user?.role === 'SUPER_ADMIN' ? "lg:col-span-1" : "lg:col-span-4"
                )}>
                    {user?.role !== 'SUPER_ADMIN' && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                    <PieChart className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Live Snapshot</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">On Time</p>
                                    <p className="text-lg font-black text-emerald-600">92%</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Late Entry</p>
                                    <p className="text-lg font-black text-amber-500">5%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions Panel */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-1 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/20 blur-3xl rounded-full"></div>
                        <h2 className="text-base font-bold mb-4 relative z-10 uppercase tracking-widest">Command Center</h2>
                        
                        <div className="mb-3 relative z-10">
                            <button
                                onClick={handleShiftAction}
                                disabled={actionLoading || (todaysAttendance ? todaysAttendance.checkOut != null : false)}
                                className={clsx(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all border shadow-lg",
                                    (!todaysAttendance || todaysAttendance.status === 'ABSENT')
                                        ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400"
                                        : (!todaysAttendance.checkOut)
                                            ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400"
                                            : "bg-gray-500/10 border-gray-500/20 text-gray-400 cursor-not-allowed",
                                    actionLoading && "opacity-50 cursor-wait"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-white">
                                            {(!todaysAttendance || todaysAttendance.status === 'ABSENT') ? 'Start Shift'
                                                : (!todaysAttendance.checkOut) ? 'End Shift' : 'Shift Completed'}
                                        </p>
                                        <p className="text-[10px] font-medium opacity-70">
                                            {todaysAttendance?.checkIn ? `Started at ${todaysAttendance.checkIn.substring(0,5)}` : 'Ready to clock in'}
                                        </p>
                                    </div>
                                </div>
                                <div className={clsx("w-2 h-2 rounded-full", (!todaysAttendance || todaysAttendance.status === 'ABSENT') ? "bg-emerald-500 animate-pulse" : (!todaysAttendance.checkOut) ? "bg-rose-500 animate-pulse" : "bg-gray-500")}></div>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            {quickActions.map((action, index) => (
                                <button key={index} onClick={() => action.path && navigate(action.path)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all h-24 gap-2 active:scale-95">
                                    <action.icon className="w-6 h-6" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-center">{action.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming & Events */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900 uppercase">Schedule</h2>
                            <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors font-bold">+</button>
                        </div>
                        <div className="space-y-3">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="group p-4 rounded-xl border border-gray-50 hover:border-red-100 hover:bg-red-50/10 transition-all cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className={clsx("w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold", event.color === 'blue' ? "bg-blue-50 text-blue-600" : event.color === 'purple' ? "bg-purple-50 text-purple-600" : "bg-rose-50 text-rose-600")}>
                                            <span className="text-[8px] uppercase">Jan</span>
                                            <span className="text-base">{index + 24}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-900 truncate mb-0.5">{event.title}</h4>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500"><Clock className="w-3 h-3" /><span>{event.date.split(',')[1]}</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Milestones & Celebrations */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600"><Gift className="w-4 h-4" /></div>
                            <h2 className="text-base font-bold text-gray-900 uppercase">Milestones</h2>
                        </div>
                        <div className="space-y-3">
                            {anniversaries.map((person, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-lg shadow-red-500/20">{person.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{person.name}</p>
                                        <p className="text-[10px] text-gray-500">{person.years} Year Milestone</p>
                                    </div>
                                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Integrated Search Callout */}
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
                        <h3 className="text-sm font-bold mb-3 uppercase tracking-widest">Intelligent Search</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input type="text" placeholder="Global records..." className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all font-medium" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: 110.58;
                    }
                }
                .animate-dash {
                    animation: dash 2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
