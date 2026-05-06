import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Briefcase, Calendar, DollarSign, CheckCircle, Link } from 'lucide-react';
import { Employee, EmployeeRequest, EmploymentStatus } from '../types/employee.types';
import { userApi } from '@/features/org/api/userApi';
import { departmentApi } from '@/features/org/api/departmentApi';
import { User as UserType } from '@/features/org/types/user.types';
import { Department } from '@/features/org/types/department.types';
import clsx from 'clsx';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeRequest) => Promise<void>;
    initialData?: Employee | null;
}

export const EmployeeFormModal = ({ isOpen, onClose, onSubmit, initialData }: EmployeeFormModalProps) => {
    const [formData, setFormData] = useState<EmployeeRequest>({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        departmentId: undefined,
        designation: '',
        dateOfJoining: '',
        salary: 0,
        status: 'ACTIVE',
        linkedUserId: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
    const [availableDepts, setAvailableDepts] = useState<Department[]>([]);

    useEffect(() => {
        if (isOpen) {
            userApi.getAll().then(setAvailableUsers).catch(() => setAvailableUsers([]));
            departmentApi.getAll().then(setAvailableDepts).catch(() => setAvailableDepts([]));
        }
    }, [isOpen]);

    const handleUserLink = (userId: string) => {
        if (!userId) {
            setFormData(prev => ({ ...prev, linkedUserId: null }));
            return;
        }
        const user = availableUsers.find(u => u.id === userId);
        if (!user) return;
        setFormData(prev => ({
            ...prev,
            linkedUserId: userId,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            email: user.email || prev.email,
            phoneNumber: user.phoneNumber || prev.phoneNumber,
        }));
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                employeeId: initialData.employeeId,
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                email: initialData.email,
                phoneNumber: initialData.phoneNumber,
                departmentId: initialData.departmentId,
                designation: initialData.designation,
                dateOfJoining: initialData.dateOfJoining ?? '',
                salary: initialData.salary,
                status: initialData.status,
                linkedUserId: initialData.linkedUserId ?? null,
            });
        } else {
            setFormData({
                employeeId: '',
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                departmentId: undefined,
                designation: '',
                dateOfJoining: '',
                salary: 0,
                status: 'ACTIVE',
                linkedUserId: null,
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-red-500/20 focus:bg-white focus:border-red-500/50 transition-all font-medium outline-none";
    const labelClasses = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            {initialData ? 'Update' : 'Register'} <span className="text-red-600">Personnel</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">Enter detailed workforce information below.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Link to User Account — shown first so auto-fill happens before manual entry */}
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Link className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Link to User Account</span>
                        </div>
                        <select
                            value={formData.linkedUserId ?? ''}
                            onChange={e => handleUserLink(e.target.value)}
                            className="w-full bg-white border border-blue-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium outline-none"
                        >
                            <option value="">No linked account — fill fields manually</option>
                            {availableUsers.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName} — {u.email} ({u.customRoleName ? `${u.role} / ${u.customRoleName}` : u.role})
                                </option>
                            ))}
                        </select>
                        {formData.linkedUserId && (
                            <p className="text-[10px] text-blue-500 font-bold mt-1.5 pl-1">
                                Fields auto-filled from user account. You can still edit them below.
                            </p>
                        )}
                        {!formData.linkedUserId && (
                            <p className="text-[10px] text-gray-400 font-medium mt-1.5 pl-1">
                                Select a user to auto-fill name, email, phone, department and designation.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Employee ID Suffix</label>
                                <div className="relative flex items-center gap-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-2.5 rounded-xl whitespace-nowrap">
                                        {initialData ? initialData.employeeId.split('-')[0] + '-' : 'PREFIX-'}
                                    </span>
                                    <input
                                        type="text"
                                        disabled={!!initialData}
                                        value={initialData ? initialData.employeeId.split('-').slice(1).join('-') : (formData.employeeId || '')}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                        className={clsx(inputClasses, !!initialData && "opacity-50 cursor-not-allowed")}
                                        placeholder="0001 (auto if blank)"
                                    />
                                </div>
                                {!initialData && (
                                    <p className="text-[10px] text-gray-400 font-medium mt-1 pl-1">Leave blank to auto-generate from org prefix</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className={inputClasses}
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className={inputClasses}
                                    placeholder="john.doe@lishr.com"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className={inputClasses}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Department</label>
                                <select
                                    required
                                    value={formData.departmentId ?? ''}
                                    onChange={e => setFormData({ ...formData, departmentId: e.target.value || undefined })}
                                    className={inputClasses}
                                >
                                    <option value="">Select Department</option>
                                    {availableDepts.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {availableDepts.length === 0 && (
                                    <p className="text-[10px] text-amber-500 font-bold mt-1 pl-1">No departments found — create them in Roles &amp; Departments first</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClasses}>Designation</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Monthly Salary ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.salary}
                                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                                    className={inputClasses}
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Date of Joining</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dateOfJoining}
                                    onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Employment Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as EmploymentStatus })}
                                    className={inputClasses}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="ON_LEAVE">On Leave</option>
                                    <option value="TERMINATED">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-400/30 text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            {initialData ? 'Save Changes' : 'Confirm Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
