import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import {
    Search, Plus, Filter, Edit, Trash2,
    Mail, Phone, Building2, Briefcase, Calendar,
    Download, Link, Users
} from 'lucide-react';
import { EmptyState } from '@/common/components/EmptyState';
import clsx from 'clsx';
import { Employee, EmployeeRequest } from '../types/employee.types';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { employeeApi } from '../api/employeeApi';

export const EmployeeListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { employees, loading } = useSelector((state: RootState) => state.employees);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const hasFetched = useRef(false);
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            dispatch(fetchEmployees());
        }
    }, [dispatch]);

    const handleOpenAddModal = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: EmployeeRequest) => {
        try {
            if (selectedEmployee) {
                await employeeApi.update(selectedEmployee.id, data);
                toast.success('Employee updated successfully');
            } else {
                await employeeApi.create(data);
                toast.success('Employee created successfully');
            }
            dispatch(fetchEmployees());
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || 'Failed to save employee');
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this personnel?')) return;
        try {
            await employeeApi.delete(id);
            toast.success('Employee removed successfully');
            dispatch(fetchEmployees());
        } catch {
            toast.error('Failed to remove employee');
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || emp.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'INACTIVE': return 'bg-gray-50 text-gray-600 border-gray-100';
            case 'TERMINATED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'ON_LEAVE': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Employee <span className="text-red-600">Force</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and monitor organizational workforce.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-400/30 text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Personnel
                    </button>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="TERMINATED">Terminated</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold transition-all hover:bg-gray-100 text-xs uppercase tracking-widest">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                                                    {emp.firstName[0]}{emp.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 group-hover:text-red-600 transition-colors">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.employeeId}</p>
                                                    {emp.linkedUserName && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Link className="w-2.5 h-2.5 text-blue-400" />
                                                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{emp.linkedUserName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {emp.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {emp.phoneNumber || '--'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-900 font-bold">
                                                    <Building2 className="w-3.5 h-3.5 text-red-500" />
                                                    {emp.tenantName || emp.department}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {emp.department} | {emp.designation}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {emp.dateOfJoining
                                                    ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest",
                                                getStatusStyles(emp.status)
                                            )}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(emp)}
                                                    className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 text-gray-400 hover:text-red-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={Users} title="No employees found" description="Add your first employee to get started" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EmployeeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedEmployee}
            />
        </div>
    );
};
