import { useState, useEffect } from 'react';
import { Plus, Briefcase, MapPin, Users, Calendar, Edit, Trash2, X, CheckCircle2, XCircle, Search, DollarSign, Clock, Power, LayoutGrid, List, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchJobs, createJob, updateJob, deleteJob, toggleJobStatus } from '../store/recruitmentSlice';
import { JobPostingRequest, JobPosting, JobStatus, JobType } from '../types/recruitment.types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { recruitmentApi } from '../api/recruitmentApi';
import { downloadPdf } from '../utils/downloadPdf';
import { tenantApi } from '@/features/org/api/tenantApi';
import { Tenant } from '@/features/org/types/tenant.types';

const STATUS_COLORS: Record<string, string> = {
    OPEN: '#10B981',
    CLOSED: '#EF4444',
    DRAFT: '#6B7280',
    PAUSED: '#F59E0B',
};

const TYPE_LABELS: Record<string, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    REMOTE: 'Remote',
};

const EMPTY_FORM: JobPostingRequest = {
    title: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    status: 'DRAFT',
    salaryRange: '',
    description: '',
    requirements: '',
    closingDate: '',
    openingsCount: 1,
};

const JobBoardPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { jobs, loading } = useSelector((state: RootState) => state.recruitment);
    const { user } = useSelector((state: RootState) => state.auth);

    const isAdminOrManager = user?.role === 'SUPER_ADMIN' || user?.role === 'CLIENT_ADMIN' || user?.role === 'MANAGER';
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CLIENT_ADMIN';

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<JobPostingRequest>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        dispatch(fetchJobs());
        if (isAdmin) {
            tenantApi.getAll().then(data => setTenants(data)).catch(() => {});
        }
    }, [dispatch]);

    const handleOpenModal = (job?: JobPosting) => {
        setError('');
        setFieldErrors({});
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                department: job.department,
                location: job.location,
                type: job.type,
                status: job.status,
                salaryRange: job.salaryRange || '',
                description: job.description || '',
                requirements: job.requirements || '',
                closingDate: job.closingDate || '',
                openingsCount: job.openingsCount,
            });
        } else {
            setEditingJob(null);
            setFormData(EMPTY_FORM);
        }
        setIsModalOpen(true);
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!formData.title || formData.title.trim().length < 3) errs.title = 'At least 3 characters required.';
        if (!formData.department.trim()) errs.department = 'Required.';
        if (!formData.location.trim()) errs.location = 'Required.';
        if (!formData.openingsCount || formData.openingsCount < 1) errs.openingsCount = 'At least 1 opening required.';
        if (!formData.description || formData.description.trim().length < 20) errs.description = 'At least 20 characters required.';
        if (formData.closingDate) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (new Date(formData.closingDate) < today) errs.closingDate = 'Must be today or in the future.';
        }
        if (isAdmin && !editingJob && !formData.tenantId) errs.tenantId = 'Select a client organization.';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setError('');
        setSubmitting(true);
        try {
            if (editingJob) {
                await dispatch(updateJob({ id: editingJob.id, data: formData })).unwrap();
                toast.success('Job updated successfully!');
            } else {
                await dispatch(createJob(formData)).unwrap();
                toast.success('Job posted successfully!');
            }
            dispatch(fetchJobs());
            setIsModalOpen(false);
        } catch (err: any) {
            const msg = err?.message || (editingJob ? 'Failed to update job.' : 'Failed to post job. Check all fields.');
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the job posting.`)) {
            try {
                await dispatch(deleteJob(id)).unwrap();
                toast.success('Job deleted successfully');
                dispatch(fetchJobs());
            } catch {
                toast.error('Failed to delete job');
            }
        }
    };

    const handleToggle = async (id: string, status: string, title: string) => {
        const action = status === 'OPEN' ? 'close' : 'reopen';
        if (window.confirm(`Are you sure you want to ${action} "${title}"?`)) {
            try {
                await dispatch(toggleJobStatus(id)).unwrap();
                toast.success(`Job ${action === 'close' ? 'closed' : 'reopened'} successfully`);
                dispatch(fetchJobs());
            } catch {
                toast.error(`Failed to ${action} job`);
            }
        }
    };

    const handleExportPipeline = async (jobId: string, jobTitle: string) => {
        setExportingId(jobId);
        try {
            const data = await recruitmentApi.exportPipelineReport(jobId);
            const date = new Date().toISOString().split('T')[0];
            downloadPdf(data, `Pipeline_${jobTitle.replace(/\s+/g, '_')}_${date}.pdf`);
            toast.success('Pipeline report downloaded!');
        } catch {
            toast.error('Failed to export report.');
        } finally {
            setExportingId(null);
        }
    };

    const filteredJobs = jobs.filter(j => {
        if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
        if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase())
            && !j.department.toLowerCase().includes(searchTerm.toLowerCase())
            && !j.location.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none hover:bg-white transition-colors";
    const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block mb-1.5";

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Job <span className="text-red-600">Board</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Recruitment Management • {jobs.length} Postings
                    </p>
                </div>
                {isAdminOrManager && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/30 text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Post New Job
                    </button>
                )}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by title, department, or location..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 font-bold text-sm">✕</button>
                    )}
                </div>
                <div className="flex gap-2">
                    {(['ALL', 'OPEN', 'DRAFT', 'PAUSED', 'CLOSED'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${statusFilter === s
                                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-transparent shadow-lg shadow-red-500/20'
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && jobs.length === 0 ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-72 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl animate-pulse" />
                    ))
                ) : filteredJobs.length === 0 ? (
                    <div className="col-span-3 text-center py-20">
                        <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No job postings found</p>
                        <p className="text-gray-300 text-xs mt-2">Try changing your search or filter</p>
                    </div>
                ) : filteredJobs.map(job => {
                    const statusColor = STATUS_COLORS[job.status] || '#6B7280';
                    return (
                        <div
                            key={job.id}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between"
                            style={{ borderTopColor: statusColor, borderTopWidth: '4px' }}
                        >
                            {/* Decorative Circle */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform opacity-10"
                                style={{ backgroundColor: statusColor }}
                            />

                            <div className="relative space-y-4">
                                {/* Icon + Status Badge */}
                                <div className="flex items-start justify-between">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: statusColor }}
                                    >
                                        <Briefcase className="w-7 h-7" />
                                    </div>
                                    <span
                                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                                        style={{
                                            backgroundColor: `${statusColor}15`,
                                            color: statusColor,
                                            borderColor: `${statusColor}30`,
                                        }}
                                    >
                                        {job.status}
                                    </span>
                                </div>

                                {/* Title & Tags */}
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2 leading-tight">
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            {job.department}
                                        </span>
                                        <span className="px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100">
                                            {TYPE_LABELS[job.type]}
                                        </span>
                                        {job.salaryRange && (
                                            <span className="px-2 py-0.5 bg-emerald-50 rounded text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                                <DollarSign className="w-2.5 h-2.5" />
                                                {job.salaryRange}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-[11px] font-medium text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor }} />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor }} />
                                        <span>{job.openingsCount} Opening{job.openingsCount !== 1 ? 's' : ''} · {job.candidateCount} Candidate{job.candidateCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    {job.closingDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor }} />
                                            <span>Closes {job.closingDate}</span>
                                        </div>
                                    )}
                                    {job.postedByName && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusColor }} />
                                            <span>Posted by {job.postedByName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="relative pt-4 border-t border-gray-100 flex items-center justify-between mt-4 gap-2">
                                <Link
                                    to={`/recruitment/candidates?jobId=${job.id}`}
                                    className="flex-1 text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all shadow-sm hover:shadow-md"
                                >
                                    Pipeline →
                                </Link>
                                <button
                                    onClick={() => handleExportPipeline(job.id, job.title)}
                                    disabled={exportingId === job.id}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all shadow-sm hover:shadow-md text-[10px] font-black uppercase tracking-widest"
                                    title="Export pipeline report"
                                >
                                    {exportingId === job.id ? (
                                        <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-3.5 h-3.5" />
                                    )}
                                    Export
                                </button>
                                <div className="flex gap-2">
                                    {isAdminOrManager && (
                                        <>
                                            <button
                                                onClick={() => handleOpenModal(job)}
                                                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm hover:shadow-md"
                                                title="Edit job"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(job.id, job.status, job.title)}
                                                className={`p-2.5 bg-gray-50 rounded-xl transition-all shadow-sm hover:shadow-md ${job.status === 'OPEN'
                                                        ? 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                                title={job.status === 'OPEN' ? 'Close job' : 'Reopen job'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(job.id, job.title)}
                                            className="p-2.5 bg-gray-50 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 transition-all shadow-sm hover:shadow-md"
                                            title="Delete job"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

                    <div className="relative bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-20 p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/95 to-white/95 backdrop-blur-lg flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                    {editingJob ? '🔧 Edit' : '✨ Post'} <span className="text-red-600">Job</span>
                                </h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
                                    {editingJob ? `Updating: ${editingJob.title}` : 'Fill in the job posting details below'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Error */}
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex items-start gap-3 animate-in slide-in-from-top">
                                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div><div className="font-bold">Error</div><div>{error}</div></div>
                                </div>
                            )}

                            {/* SECTION 1: Basic Info */}
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Briefcase className="w-5 h-5 text-red-600" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Title */}
                                    <div className="col-span-2 space-y-1">
                                        <label className={labelClass}>Job Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g., Senior Software Engineer"
                                        />
                                        {fieldErrors.title && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.title}</p>}
                                    </div>

                                    {/* Department */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Department *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.department}
                                            onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g., Engineering"
                                        />
                                        {fieldErrors.department && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.department}</p>}
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g., London, UK (Remote)"
                                        />
                                        {fieldErrors.location && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.location}</p>}
                                    </div>

                                    {/* Type */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Employment Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData(p => ({ ...p, type: e.target.value as JobType }))}
                                            className={inputClass}
                                        >
                                            <option value="FULL_TIME">Full Time</option>
                                            <option value="PART_TIME">Part Time</option>
                                            <option value="CONTRACT">Contract</option>
                                            <option value="INTERNSHIP">Internship</option>
                                            <option value="REMOTE">Remote</option>
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Status *</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData(p => ({ ...p, status: e.target.value as JobStatus }))}
                                            className={inputClass}
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="OPEN">Open</option>
                                            <option value="PAUSED">Paused</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>

                                    {/* Salary Range */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Salary Range</label>
                                        <input
                                            type="text"
                                            value={formData.salaryRange}
                                            onChange={e => setFormData(p => ({ ...p, salaryRange: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g., $50,000 – $80,000"
                                        />
                                    </div>

                                    {/* Openings */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>No. of Openings *</label>
                                        <input
                                            type="number"
                                            min={1}
                                            required
                                            value={formData.openingsCount}
                                            onChange={e => setFormData(p => ({ ...p, openingsCount: parseInt(e.target.value) || 1 }))}
                                            className={inputClass}
                                        />
                                        {fieldErrors.openingsCount && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.openingsCount}</p>}
                                    </div>

                                    {/* Closing Date */}
                                    <div className="col-span-2 space-y-1">
                                        <label className={labelClass}>Closing Date</label>
                                        <input
                                            type="date"
                                            value={formData.closingDate || ''}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setFormData(p => ({ ...p, closingDate: e.target.value }))}
                                            className={inputClass}
                                        />
                                        {fieldErrors.closingDate && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.closingDate}</p>}
                                    </div>

                                    {/* Tenant selector — SUPER_ADMIN only, create mode only */}
                                    {isAdmin && !editingJob && tenants.length > 0 && (
                                        <div className="col-span-2 space-y-1">
                                            <label className={labelClass}>Client Organization *</label>
                                            <select
                                                required
                                                value={formData.tenantId || ''}
                                                onChange={e => setFormData(p => ({ ...p, tenantId: e.target.value }))}
                                                className={inputClass}
                                            >
                                                <option value="">— Select Client —</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} ({t.prefix})</option>
                                                ))}
                                            </select>
                                            {fieldErrors.tenantId && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.tenantId}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: Job Details */}
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <List className="w-5 h-5 text-red-600" />
                                    Job Details
                                </h3>
                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Description * (min 20 characters)</label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={formData.description}
                                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                            className={`${inputClass} resize-none`}
                                            placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                        />
                                        {fieldErrors.description && <p className="text-red-500 text-xs font-bold pl-1">{fieldErrors.description}</p>}
                                    </div>

                                    {/* Requirements */}
                                    <div className="space-y-1">
                                        <label className={labelClass}>Requirements</label>
                                        <textarea
                                            rows={5}
                                            value={formData.requirements}
                                            onChange={e => setFormData(p => ({ ...p, requirements: e.target.value }))}
                                            className={`${inputClass} resize-none`}
                                            placeholder="List required skills, qualifications, years of experience..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-12 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        editingJob ? '💾 Update Job' : '✨ Post Job'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBoardPage;
