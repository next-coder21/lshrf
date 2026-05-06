import { Home, Users, Calendar, FileText, DollarSign, TrendingUp, Settings, Building2, ChevronDown, LayoutGrid, Briefcase, List, Package, Layers, CreditCard, Activity, Shield, Clock, UserCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

export const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
    const [isOrgSetupOpen, setIsOrgSetupOpen] = useState(false);
    const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);
    const [isPlansOpen, setIsPlansOpen] = useState(false);
    const [isShiftsOpen, setIsShiftsOpen] = useState(false);
    const [isLeavesOpen, setIsLeavesOpen] = useState(false);
    const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN';
    const permissions = user?.permissions || [];

    const hasPermission = (perm?: string) => {
        if (!perm) return true;
        if (isSuperAdmin) return true;
        return permissions.includes(perm);
    };

    // Build navigation items based on role
    const navItems = useMemo(() => {
        const items: any[] = [
            { icon: Home, label: 'Dashboard', path: '/', color: 'from-red-500' },
        ];

        // ----- ORG SETUP: Only Super Admin sees this submenu -----
        if (isSuperAdmin) {
            items.push({
                label: 'Org Setup',
                icon: Building2,
                isSubmenu: true,
                isOpen: isOrgSetupOpen,
                toggle: () => setIsOrgSetupOpen(!isOrgSetupOpen),
                subItems: [
                    { label: 'Client', path: '/org/clients', icon: LayoutGrid },
                    { label: 'Users', path: '/org/users', icon: Users },
                    { label: 'Roles & Departments', path: '/org/roles', icon: Shield },
                ]
            });
        } else {
            // Non-super-admin: show Users & Roles as top-level items if they have permission
            if (hasPermission('USERS_VIEW')) {
                items.push({ icon: Users, label: 'Users', path: '/org/users', color: 'from-blue-500' });
            }
            if (hasPermission('ROLES_VIEW')) {
                items.push({ icon: Shield, label: 'Roles', path: '/org/roles', color: 'from-purple-500' });
            }
        }

        // ----- PLANS & LIMITS: Super Admin only -----
        if (isSuperAdmin) {
            items.push({
                label: 'Plans & Limits',
                icon: Package,
                isSubmenu: true,
                isOpen: isPlansOpen,
                toggle: () => setIsPlansOpen(!isPlansOpen),
                subItems: [
                    { label: 'Plan Allocation', path: '/plans/allocation', icon: Layers },
                    { label: 'Resource Limits', path: '/plans/limits', icon: Activity },
                    { label: 'Subscriptions', path: '/plans/subscriptions', icon: Package },
                    { label: 'Billing & Pay', path: '/plans/pay', icon: CreditCard },
                ]
            });
        }

        // ----- RECRUITMENT -----
        if (hasPermission('RECRUITMENT_VIEW')) {
            items.push({
                label: 'Recruitment',
                icon: Briefcase,
                isSubmenu: true,
                isOpen: isRecruitmentOpen,
                toggle: () => setIsRecruitmentOpen(!isRecruitmentOpen),
                subItems: [
                    { label: 'Job Board', path: '/recruitment/jobs', icon: List },
                    { label: 'Candidates', path: '/recruitment/candidates', icon: Users },
                ]
            });
        }

        // ----- EMPLOYEES -----
        if (hasPermission('EMPLOYEES_VIEW')) {
            items.push({ icon: Users, label: 'Employees', path: '/employees', color: 'from-orange-500' });
        }

        // ----- SHIFTS -----
        if (hasPermission('SHIFTS_VIEW') || hasPermission('ATTENDANCE_VIEW')) {
            items.push({
                label: 'Shifts',
                icon: Clock,
                isSubmenu: true,
                isOpen: isShiftsOpen,
                toggle: () => setIsShiftsOpen(!isShiftsOpen),
                subItems: [
                    { label: 'Shift Management', path: '/shifts', icon: Clock },
                    { label: 'Shift Assignments', path: '/shifts/assignments', icon: Users },
                ]
            });
        }

        // ----- ATTENDANCE -----
        if (hasPermission('ATTENDANCE_VIEW')) {
            items.push({ icon: Calendar, label: 'Attendance', path: '/attendance', color: 'from-amber-500' });
        }

        // ----- LEAVES -----
        if (hasPermission('LEAVES_VIEW')) {
            const leaveSubItems: any[] = [
                { label: 'Leave Records', path: '/leaves', icon: FileText },
            ];
            if (hasPermission('LEAVES_MANAGE')) {
                leaveSubItems.push({ label: 'Configure Types', path: '/leaves/types', icon: Settings });
            }
            items.push({
                label: 'Leaves',
                icon: FileText,
                isSubmenu: true,
                isOpen: isLeavesOpen,
                toggle: () => setIsLeavesOpen(!isLeavesOpen),
                subItems: leaveSubItems,
            });
        }

        // ----- APPROVALS -----
        if (hasPermission('APPROVALS_VIEW')) {
            const approvalSubItems: any[] = [
                { label: 'Pending Auth', path: '/approvals/pending', icon: UserCheck },
            ];
            if (hasPermission('APPROVALS_MANAGE')) {
                approvalSubItems.push({ label: 'Auth Protocols', path: '/approvals/config', icon: Shield });
            }
            items.push({
                label: 'Approvals',
                icon: Shield,
                isSubmenu: true,
                isOpen: isApprovalsOpen,
                toggle: () => setIsApprovalsOpen(!isApprovalsOpen),
                subItems: approvalSubItems,
            });
        }

        // ----- PAYROLL -----
        if (hasPermission('PAYROLL_VIEW')) {
            items.push({ icon: DollarSign, label: 'Payroll', path: '/payroll', color: 'from-orange-600' });
        }

        // ----- PERFORMANCE -----
        if (hasPermission('PERFORMANCE_VIEW')) {
            items.push({ icon: TrendingUp, label: 'Performance', path: '/performance', color: 'from-red-500' });
        }

        // ----- SETTINGS -----
        if (hasPermission('SETTINGS_VIEW')) {
            items.push({ icon: Settings, label: 'Settings', path: '/settings', color: 'from-gray-600' });
        }

        return items;
    }, [user, isSuperAdmin, permissions, isOrgSetupOpen, isPlansOpen, isRecruitmentOpen, isShiftsOpen, isLeavesOpen, isApprovalsOpen]);

    return (
        <aside
            className={clsx(
                "relative bg-white border-r border-gray-100 transition-all duration-300 ease-in-out h-full flex flex-col shadow-sm z-20",
                isOpen ? "w-64" : "w-20 overflow-x-hidden"
            )}
        >
            {/* Logo Section */}
            <div className="h-20 border-b border-gray-50 flex items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-black shadow-sm flex-shrink-0">
                        L
                    </div>
                    {isOpen && (
                        <span className="text-xl font-black text-gray-900 tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300">
                            L's<span className="text-red-600">HR</span>
                        </span>
                    )}
                </div>
            </div>


            {/* Navigation */}
            <nav className={clsx(
                "flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden",
                isOpen ? "px-3" : "px-2"
            )}>
                {navItems.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                        {item.isSubmenu ? (
                            <>
                                <button
                                    onClick={item.toggle}
                                    className={clsx(
                                        "relative group flex items-center rounded-xl transition-all duration-300 w-full text-left",
                                        isOpen ? "gap-3 px-4 py-3" : "justify-center p-2 mx-auto w-12 h-12",
                                        item.isOpen ? "bg-gray-50 text-gray-900" : "text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    <div className={clsx(
                                        "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                                        item.isOpen ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"
                                    )}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 font-bold transition-all text-[11px] uppercase tracking-widest text-gray-500">
                                                {item.label}
                                            </span>
                                            <ChevronDown className={clsx("w-3 h-3 transition-transform", item.isOpen && "rotate-180")} />
                                        </>
                                    )}
                                </button>
                                {isOpen && item.isOpen && (
                                    <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                        {item.subItems.map((sub: any, sIdx: number) => (
                                            <NavLink
                                                key={sIdx}
                                                to={sub.path}
                                                className={({ isActive }) =>
                                                    clsx(
                                                        "flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                                        isActive ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                                    )
                                                }
                                            >
                                                <sub.icon className="w-3.5 h-3.5" />
                                                {sub.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path || ''}
                                className={({ isActive }) =>
                                    clsx(
                                        "relative group flex items-center rounded-xl transition-all duration-300",
                                        isOpen ? "gap-3 px-4 py-3" : "justify-center p-2 mx-auto w-12 h-12",
                                        isActive
                                            ? "bg-red-50 text-red-600 shadow-sm border border-red-100/50"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full"></div>
                                        )}
                                        <div className={clsx(
                                            "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                                            isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-600"
                                        )}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        {isOpen && (
                                            <span className={clsx(
                                                "font-bold transition-all text-[11px] uppercase tracking-widest",
                                                isActive ? "text-red-600" : "text-gray-500"
                                            )}>
                                                {item.label}
                                            </span>
                                        )}
                                        {!isOpen && (
                                            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/10">
                                                {item.label}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

        </aside>
    );
};
