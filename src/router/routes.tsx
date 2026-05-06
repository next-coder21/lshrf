import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { MainLayout } from '@/common/components/layout/MainLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage';
import { ClientListPage } from '@/features/org/pages/ClientListPage';
import { UserListPage } from '@/features/org/pages/UserListPage';
import { RoleListPage } from '@/features/org/pages/RoleListPage';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { LeavesPage } from '@/features/leaves/pages/LeavesPage';
import { PayrollPage } from '@/features/payroll/pages/PayrollPage';
import { PerformancePage } from '@/features/performance/pages/PerformancePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import JobBoardPage from '@/features/recruitment/pages/JobBoardPage';
import CandidatePipelinePage from '@/features/recruitment/pages/CandidatePipelinePage';
import { PlanAllocationPage } from '@/features/plans/pages/PlanAllocationPage';
import { ResourceLimitsPage } from '@/features/plans/pages/ResourceLimitsPage';
import { BillingSubscriptionsPage } from '@/features/plans/pages/BillingSubscriptionsPage';
import { LsPayPage } from '@/features/plans/pages/LsPayPage';
import { ShiftListPage } from '@/features/shifts/pages/ShiftListPage';
import { ShiftAssignmentPage } from '@/features/shifts/pages/ShiftAssignmentPage';
import { LeaveTypeConfigPage } from '@/features/leaves/pages/LeaveTypeConfigPage';
import ApprovalConfigPage from '@/features/approvals/pages/ApprovalConfigPage';
import PendingApprovalsPage from '@/features/approvals/pages/PendingApprovalsPage';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <PrivateRoute>
                <MainLayout />
            </PrivateRoute>
        ),
        children: [
            {
                path: '/',
                element: <DashboardPage />,
            },
            {
                path: '/employees',
                element: <EmployeeListPage />,
            },
            {
                path: '/org/clients',
                element: <ClientListPage />,
            },
            {
                path: '/org/users',
                element: <UserListPage />,
            },
            {
                path: '/org/roles',
                element: <RoleListPage />,
            },
            {
                path: '/attendance',
                element: <AttendancePage />,
            },
            {
                path: '/leaves',
                element: <LeavesPage />,
            },
            {
                path: '/leaves/types',
                element: <LeaveTypeConfigPage />,
            },
            {
                path: '/payroll',
                element: <PayrollPage />,
            },
            {
                path: '/performance',
                element: <PerformancePage />,
            },
            {
                path: '/settings',
                element: <SettingsPage />,
            },
            {
                path: '/profile',
                element: <ProfilePage />,
            },
            {
                path: '/recruitment/jobs',
                element: <JobBoardPage />,
            },
            {
                path: '/recruitment/candidates',
                element: <CandidatePipelinePage />,
            },
            {
                path: '/plans/allocation',
                element: <PlanAllocationPage />,
            },
            {
                path: '/plans/subscriptions',
                element: <BillingSubscriptionsPage />,
            },
            {
                path: '/plans/limits',
                element: <ResourceLimitsPage />,
            },
            {
                path: '/plans/pay',
                element: <LsPayPage />,
            },
            {
                path: '/shifts',
                element: <ShiftListPage />,
            },
            {
                path: '/shifts/assignments',
                element: <ShiftAssignmentPage />,
            },
            {
                path: '/approvals/config',
                element: <ApprovalConfigPage />,
            },
            {
                path: '/approvals/pending',
                element: <PendingApprovalsPage />,
            },
        ],
    },
]);
