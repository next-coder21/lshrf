import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { RoleGuard } from '@/common/components/RoleGuard';

// Lazy page imports
const LoginPage               = React.lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage      = React.lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage       = React.lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const LandingPage             = React.lazy(() => import('@/features/landing/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const MainLayout              = React.lazy(() => import('@/common/components/layout/MainLayout').then(m => ({ default: m.MainLayout })));
const DashboardPage           = React.lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EmployeeListPage        = React.lazy(() => import('@/features/employees/pages/EmployeeListPage').then(m => ({ default: m.EmployeeListPage })));
const ClientListPage          = React.lazy(() => import('@/features/org/pages/ClientListPage').then(m => ({ default: m.ClientListPage })));
const UserListPage            = React.lazy(() => import('@/features/org/pages/UserListPage').then(m => ({ default: m.UserListPage })));
const RoleListPage            = React.lazy(() => import('@/features/org/pages/RoleListPage').then(m => ({ default: m.RoleListPage })));
const AttendancePage          = React.lazy(() => import('@/features/attendance/pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const LeavesPage              = React.lazy(() => import('@/features/leaves/pages/LeavesPage').then(m => ({ default: m.LeavesPage })));
const PayrollPage             = React.lazy(() => import('@/features/payroll/pages/PayrollPage').then(m => ({ default: m.PayrollPage })));
const PerformancePage         = React.lazy(() => import('@/features/performance/pages/PerformancePage').then(m => ({ default: m.PerformancePage })));
const SettingsPage            = React.lazy(() => import('@/features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage             = React.lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const JobBoardPage            = React.lazy(() => import('@/features/recruitment/pages/JobBoardPage'));
const CandidatePipelinePage   = React.lazy(() => import('@/features/recruitment/pages/CandidatePipelinePage'));
const PlanAllocationPage      = React.lazy(() => import('@/features/plans/pages/PlanAllocationPage').then(m => ({ default: m.PlanAllocationPage })));
const ResourceLimitsPage      = React.lazy(() => import('@/features/plans/pages/ResourceLimitsPage').then(m => ({ default: m.ResourceLimitsPage })));
const BillingSubscriptionsPage = React.lazy(() => import('@/features/plans/pages/BillingSubscriptionsPage').then(m => ({ default: m.BillingSubscriptionsPage })));
const LsPayPage               = React.lazy(() => import('@/features/plans/pages/LsPayPage').then(m => ({ default: m.LsPayPage })));
const ShiftListPage           = React.lazy(() => import('@/features/shifts/pages/ShiftListPage').then(m => ({ default: m.ShiftListPage })));
const ShiftAssignmentPage     = React.lazy(() => import('@/features/shifts/pages/ShiftAssignmentPage').then(m => ({ default: m.ShiftAssignmentPage })));
const LeaveTypeConfigPage     = React.lazy(() => import('@/features/leaves/pages/LeaveTypeConfigPage').then(m => ({ default: m.LeaveTypeConfigPage })));
const ApprovalConfigPage      = React.lazy(() => import('@/features/approvals/pages/ApprovalConfigPage'));
const PendingApprovalsPage    = React.lazy(() => import('@/features/approvals/pages/PendingApprovalsPage'));

// Simple centered spinner used as Suspense fallback
export const PageSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const withSuspense = (element: React.ReactNode) => (
    <Suspense fallback={<PageSpinner />}>{element}</Suspense>
);

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
    {
        path: '/landing',
        element: withSuspense(<LandingPage />),
    },
    {
        path: '/login',
        element: withSuspense(<LoginPage />),
    },
    {
        path: '/forgot-password',
        element: withSuspense(<ForgotPasswordPage />),
    },
    {
        path: '/reset-password',
        element: withSuspense(<ResetPasswordPage />),
    },
    {
        path: '/',
        element: (
            <PrivateRoute>
                {withSuspense(<MainLayout />) as React.ReactElement}
            </PrivateRoute>
        ),
        children: [
            { path: '/',                     element: withSuspense(<DashboardPage />) },
            { path: '/employees',            element: withSuspense(<EmployeeListPage />) },
            { path: '/org/clients',          element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><ClientListPage /></RoleGuard>) },
            { path: '/org/users',            element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><UserListPage /></RoleGuard>) },
            { path: '/org/roles',            element: withSuspense(<RoleGuard roles={['SUPER_ADMIN', 'CLIENT_ADMIN']}><RoleListPage /></RoleGuard>) },
            { path: '/attendance',           element: withSuspense(<AttendancePage />) },
            { path: '/leaves',               element: withSuspense(<LeavesPage />) },
            { path: '/leaves/types',         element: withSuspense(<LeaveTypeConfigPage />) },
            { path: '/payroll',              element: withSuspense(<PayrollPage />) },
            { path: '/performance',          element: withSuspense(<PerformancePage />) },
            { path: '/settings',             element: withSuspense(<SettingsPage />) },
            { path: '/profile',              element: withSuspense(<ProfilePage />) },
            { path: '/recruitment/jobs',     element: withSuspense(<JobBoardPage />) },
            { path: '/recruitment/candidates', element: withSuspense(<CandidatePipelinePage />) },
            { path: '/plans/allocation',     element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><PlanAllocationPage /></RoleGuard>) },
            { path: '/plans/subscriptions',  element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><BillingSubscriptionsPage /></RoleGuard>) },
            { path: '/plans/limits',         element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><ResourceLimitsPage /></RoleGuard>) },
            { path: '/plans/pay',            element: withSuspense(<RoleGuard roles={['SUPER_ADMIN']}><LsPayPage /></RoleGuard>) },
            { path: '/shifts',               element: withSuspense(<ShiftListPage />) },
            { path: '/shifts/assignments',   element: withSuspense(<ShiftAssignmentPage />) },
            { path: '/approvals/config',     element: withSuspense(<ApprovalConfigPage />) },
            { path: '/approvals/pending',    element: withSuspense(<PendingApprovalsPage />) },
        ],
    },
]);
