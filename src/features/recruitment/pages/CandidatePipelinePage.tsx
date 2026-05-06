import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store/store';
import {
    fetchCandidates, fetchCandidatesByJob, createCandidate, updateCandidate,
    updateCandidateStage, deleteCandidate, fetchJobs, fetchPipelineSummary,
    fetchInterviewsByCandidate, scheduleInterview, updateInterviewResult, deleteInterview
} from '../store/recruitmentSlice';
import {
    CandidateRequest, CandidateStage, InterviewRequest,
    InterviewResultRequest, InterviewStatus, InterviewType
} from '../types/recruitment.types';
import {
    Users, Plus, Search, Trash2, X, XCircle, Calendar, Clock,
    Video, Phone, UserCheck, CheckCircle2, LayoutGrid, List,
    FileText, ClipboardList, Award, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recruitmentApi } from '../api/recruitmentApi';
import { downloadPdf } from '../utils/downloadPdf';
import { userApi } from '@/features/org/api/userApi';
import { User } from '@/features/org/types/user.types';

const STAGES: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

const STAGE_COLORS: Record<CandidateStage, string> = {
    APPLIED: '#6366F1',
    SCREENING: '#F59E0B',
    INTERVIEW: '#3B82F6',
    OFFER: '#8B5CF6',
    HIRED: '#10B981',
    REJECTED: '#EF4444',
};

const INTERVIEW_TYPE_ICONS: Record<string, any> = {
    VIDEO: Video,
    PHONE: Phone,
    IN_PERSON: UserCheck,
};

const CandidatePipelinePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();
    const { jobs, candidates, interviews, pipeline, loading } = useSelector((state: RootState) => state.recruitment);
    const { user } = useSelector((state: RootState) => state.auth);

    const isAdminOrManager = user?.role === 'SUPER_ADMIN' || user?.role === 'CLIENT_ADMIN' || user?.role === 'MANAGER';
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CLIENT_ADMIN';

    const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
    const [selectedJobId, setSelectedJobId] = useState<string>(searchParams.get('jobId') || 'ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Add Candidate Modal
    const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
    const [candidateForm, setCandidateForm] = useState<CandidateRequest>({
        fullName: '', email: '', phoneNumber: '', jobPostingId: '', notes: '',
        resumeUrl: '', linkedInUrl: '', portfolioUrl: '', source: ''
    });
    const [candidateSubmitting, setCandidateSubmitting] = useState(false);
    const [candidateError, setCandidateError] = useState('');

    // Interview Panel
    const [isInterviewPanelOpen, setIsInterviewPanelOpen] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [selectedCandidateName, setSelectedCandidateName] = useState('');
    const [interviewSubmitting, setInterviewSubmitting] = useState(false);
    const [interviewError, setInterviewError] = useState('');

    const [interviewForm, setInterviewForm] = useState<InterviewRequest>({
        candidateId: '', scheduledAt: '', durationMinutes: 60, interviewType: 'VIDEO', interviewerId: user?.id || '', notes: ''
    });

    const [resultFormOpenFor, setResultFormOpenFor] = useState<string | null>(null);
    const [resultForm, setResultForm] = useState<InterviewResultRequest>({ feedback: '', rating: 3, status: 'COMPLETED' });

    const [exportingId, setExportingId] = useState<string | null>(null);
    const [offerGeneratingId, setOfferGeneratingId] = useState<string | null>(null);

    // Available interviewers (users in the org)
    const [availableInterviewers, setAvailableInterviewers] = useState<User[]>([]);

    // Edit Candidate Modal
    const [isEditCandidateOpen, setIsEditCandidateOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<typeof candidates[0] | null>(null);
    const [editCandidateForm, setEditCandidateForm] = useState<CandidateRequest>({
        fullName: '', email: '', phoneNumber: '', jobPostingId: '', notes: '',
        resumeUrl: '', linkedInUrl: '', portfolioUrl: '', source: ''
    });
    const [editCandidateSubmitting, setEditCandidateSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchJobs());
        userApi.getAll().then(users => setAvailableInterviewers(users)).catch(() => {});
    }, [dispatch]);

    useEffect(() => {
        if (selectedJobId === 'ALL') {
            dispatch(fetchCandidates());
            setCandidateForm(prev => ({ ...prev, jobPostingId: '' }));
        } else {
            dispatch(fetchCandidatesByJob(selectedJobId));
            dispatch(fetchPipelineSummary(selectedJobId));
            setCandidateForm(prev => ({ ...prev, jobPostingId: selectedJobId }));
        }
    }, [dispatch, selectedJobId]);

    const filteredCandidates = candidates.filter(c => {
        if (!searchTerm) return true;
        return c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCandidateError('');
        setCandidateSubmitting(true);
        try {
            await dispatch(createCandidate(candidateForm)).unwrap();
            toast.success(`${candidateForm.fullName} added to pipeline!`);
            setIsAddCandidateOpen(false);
            setCandidateForm({ fullName: '', email: '', phoneNumber: '', jobPostingId: selectedJobId !== 'ALL' ? selectedJobId : '', notes: '', resumeUrl: '', linkedInUrl: '', portfolioUrl: '', source: '' });
            if (selectedJobId !== 'ALL') dispatch(fetchPipelineSummary(selectedJobId));
        } catch (err: any) {
            const msg = err?.message || 'Failed to add candidate.';
            setCandidateError(msg);
        } finally {
            setCandidateSubmitting(false);
        }
    };

    const handleStageChange = async (candidateId: string, newStage: CandidateStage) => {
        try {
            await dispatch(updateCandidateStage({ id: candidateId, data: { currentStage: newStage } })).unwrap();
            toast.success(`Moved to ${newStage}`);
        } catch {
            toast.error('Failed to update stage');
        }
    };

    const handleDeleteCandidate = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove "${name}" from the pipeline?\n\nThis action cannot be undone.`)) {
            try {
                await dispatch(deleteCandidate(id)).unwrap();
                toast.success('Candidate removed');
            } catch {
                toast.error('Failed to remove candidate');
            }
        }
    };

    const handleOpenEditCandidate = (c: typeof candidates[0]) => {
        setEditingCandidate(c);
        setEditCandidateForm({
            fullName: c.fullName,
            email: c.email,
            phoneNumber: c.phoneNumber || '',
            jobPostingId: c.jobPostingId,
            notes: c.notes || '',
            resumeUrl: c.resumeUrl || '',
            linkedInUrl: c.linkedInUrl || '',
            portfolioUrl: c.portfolioUrl || '',
            source: c.source || '',
        });
        setIsEditCandidateOpen(true);
    };

    const handleEditCandidateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCandidate) return;
        setEditCandidateSubmitting(true);
        try {
            await dispatch(updateCandidate({ id: editingCandidate.id, data: editCandidateForm })).unwrap();
            toast.success(`${editCandidateForm.fullName} updated`);
            setIsEditCandidateOpen(false);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update candidate');
        } finally {
            setEditCandidateSubmitting(false);
        }
    };

    const openInterviewPanel = (candidateId: string, name: string) => {
        setSelectedCandidateId(candidateId);
        setSelectedCandidateName(name);
        dispatch(fetchInterviewsByCandidate(candidateId));
        setInterviewForm(prev => ({ ...prev, candidateId, interviewerId: user?.id || '' }));
        setResultFormOpenFor(null);
        setIsInterviewPanelOpen(true);
    };

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        setInterviewError('');
        setInterviewSubmitting(true);
        try {
            await dispatch(scheduleInterview(interviewForm)).unwrap();
            toast.success('Interview scheduled!');
            setInterviewForm(prev => ({ ...prev, scheduledAt: '', notes: '' }));
        } catch (err: any) {
            const msg = err?.message || 'Failed to schedule interview.';
            setInterviewError(msg);
            toast.error(msg);
        } finally {
            setInterviewSubmitting(false);
        }
    };

    const handleUpdateResult = async (interviewId: string) => {
        try {
            await dispatch(updateInterviewResult({ id: interviewId, data: resultForm })).unwrap();
            toast.success('Interview result updated');
            setResultFormOpenFor(null);
        } catch {
            toast.error('Failed to update result');
        }
    };

    const handleDeleteInterview = async (id: string) => {
        if (window.confirm('Delete this interview?')) {
            try {
                await dispatch(deleteInterview(id)).unwrap();
                toast.success('Interview deleted');
            } catch {
                toast.error('Failed to delete interview');
            }
        }
    };

    const handleExportCandidate = async (candidateId: string, name: string) => {
        setExportingId(candidateId);
        try {
            const data = await recruitmentApi.exportCandidateReport(candidateId);
            downloadPdf(data, `Report_${name.replace(/\s+/g, '_')}.pdf`);
            toast.success('Profile report downloaded!');
        } catch {
            toast.error('Failed to export report.');
        } finally {
            setExportingId(null);
        }
    };

    const handleExportInterviews = async (candidateId: string, name: string) => {
        setExportingId(candidateId);
        try {
            const data = await recruitmentApi.exportInterviewReport(candidateId);
            downloadPdf(data, `Interviews_${name.replace(/\s+/g, '_')}.pdf`);
            toast.success('Interview history downloaded!');
        } catch {
            toast.error('Failed to export history.');
        } finally {
            setExportingId(null);
        }
    };

    const handleOfferLetter = async (candidateId: string, name: string) => {
        setOfferGeneratingId(candidateId);
        try {
            const data = await recruitmentApi.generateOfferLetter(candidateId);
            downloadPdf(data, `Offer_Letter_${name.replace(/\s+/g, '_')}.pdf`);
            toast.success('Offer letter generated!');
        } catch (err: any) {
            const msg = err?.response?.status === 400 ? 'Only HIRED candidates can get an offer letter.' : 'Failed to generate offer letter.';
            toast.error(msg);
        } finally {
            setOfferGeneratingId(null);
        }
    };

    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none hover:bg-white transition-colors";
    const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block mb-1.5";

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Candidate <span className="text-red-600">Pipeline</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Recruitment Tracker • {candidates.length} Candidates
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white border-2 border-gray-200 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'KANBAN' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-500/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'TABLE' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-500/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                            Table
                        </button>
                    </div>
                    {isAdminOrManager && (
                        <button
                            onClick={() => setIsAddCandidateOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-500/30 text-xs uppercase tracking-widest active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add Candidate
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center flex-shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by candidate name or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 font-bold text-sm">✕</button>
                    )}
                </div>
                <select
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="py-3.5 px-5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all min-w-[220px]"
                >
                    <option value="ALL">All Job Postings</option>
                    {jobs.filter(j => j.status === 'OPEN').map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                </select>
            </div>

            {/* Pipeline Stats (when job selected) */}
            {selectedJobId !== 'ALL' && pipeline && (
                <div className="grid grid-cols-6 gap-4 flex-shrink-0">
                    {STAGES.map(stage => {
                        const count = pipeline.countPerStage[stage] || 0;
                        const color = STAGE_COLORS[stage];
                        return (
                            <div
                                key={stage}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-1"
                                style={{ borderTopColor: color, borderTopWidth: '3px' }}
                            >
                                <span className="text-2xl font-black" style={{ color }}>{count}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stage}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {loading && candidates.length === 0 ? (
                    <div className="grid grid-cols-6 gap-4 h-full">
                        {STAGES.map(s => (
                            <div key={s} className="bg-gray-50 rounded-3xl animate-pulse h-full" />
                        ))}
                    </div>
                ) : viewMode === 'KANBAN' ? (
                    /* ─── KANBAN VIEW ─── */
                    <div className="flex gap-5 h-full overflow-x-auto pb-4">
                        {STAGES.map(stage => {
                            const color = STAGE_COLORS[stage];
                            const stageCandidates = filteredCandidates.filter(c => c.currentStage === stage);
                            return (
                                <div key={stage} className="flex-none w-72 flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-lg overflow-hidden">
                                    {/* Column Header */}
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between" style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                                        <div>
                                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">{stage}</h3>
                                        </div>
                                        <span
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                                            style={{ backgroundColor: color }}
                                        >
                                            {stageCandidates.length}
                                        </span>
                                    </div>

                                    {/* Cards */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                        {stageCandidates.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Empty</p>
                                            </div>
                                        ) : stageCandidates.map(c => (
                                            <div
                                                key={c.id}
                                                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-2 gap-2">
                                                    <div
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {c.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteCandidate(c.id, c.fullName)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="font-black text-gray-900 text-sm uppercase tracking-tight leading-tight mb-1">{c.fullName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold truncate mb-3">{c.jobPostingTitle}</p>

                                                {isAdminOrManager && (
                                                    <select
                                                        value={c.currentStage}
                                                        onChange={e => handleStageChange(c.id, e.target.value as CandidateStage)}
                                                        className="w-full text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-2"
                                                    >
                                                        {STAGES.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100">
                                                    {/* Action Row 1: Interview + Edit */}
                                                    {isAdminOrManager && (
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={() => openInterviewPanel(c.id, c.fullName)}
                                                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-600 transition-all border border-blue-100"
                                                                title="Schedule / View Interviews"
                                                            >
                                                                <Calendar className="w-3 h-3" />
                                                                Interview {c.interviewCount > 0 ? `(${c.interviewCount})` : ''}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEditCandidate(c)}
                                                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-all border border-gray-200"
                                                                title="Edit Candidate"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Action Row 2: Reports */}
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        <button
                                                            onClick={() => handleExportCandidate(c.id, c.fullName)}
                                                            disabled={exportingId === c.id}
                                                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-indigo-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-100"
                                                            title="Candidate Profile report"
                                                        >
                                                            {exportingId === c.id ? <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /> : <FileText className="w-3 h-3" />}
                                                            Profile
                                                        </button>
                                                        {c.interviewCount > 0 && (
                                                            <button
                                                                onClick={() => handleExportInterviews(c.id, c.fullName)}
                                                                disabled={exportingId === c.id}
                                                                className="flex-1 min-w-[80px] flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-amber-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-all border border-gray-200 hover:border-amber-100"
                                                                title="Interview History"
                                                            >
                                                                {exportingId === c.id ? <div className="w-3 h-3 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" /> : <ClipboardList className="w-3 h-3" />}
                                                                History
                                                            </button>
                                                        )}
                                                    </div>

                                                    {(c.currentStage === 'HIRED' || c.currentStage === 'OFFER') && isAdmin && (
                                                        <button
                                                            onClick={() => handleOfferLetter(c.id, c.fullName)}
                                                            disabled={offerGeneratingId === c.id}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-red-500/20 hover:from-red-700 hover:to-orange-700 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {offerGeneratingId === c.id ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                                                            {c.currentStage === 'HIRED' ? 'Offer Letter' : 'Prepare Offer'}
                                                        </button>
                                                    )}

                                                    {c.currentStage === 'HIRED' && (
                                                        <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Hired
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ─── TABLE VIEW ─── */
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Posting</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCandidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16">
                                                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No candidates found</p>
                                            </td>
                                        </tr>
                                    ) : filteredCandidates.map(c => {
                                        const color = STAGE_COLORS[c.currentStage];
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            {c.fullName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{c.fullName}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold">{c.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-700">{c.jobPostingTitle}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isAdminOrManager ? (
                                                        <select
                                                            value={c.currentStage}
                                                            onChange={e => handleStageChange(c.id, e.target.value as CandidateStage)}
                                                            className="text-[10px] font-black uppercase tracking-widest border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                                                            style={{ borderColor: `${color}40`, color }}
                                                        >
                                                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                                                            style={{ backgroundColor: `${color}15`, color, borderColor: `${color}30` }}
                                                        >
                                                            {c.currentStage}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-400">{new Date(c.appliedAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => openInterviewPanel(c.id, c.fullName)}
                                                                className="p-2 bg-gray-50 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all shadow-sm"
                                                                title={`Schedule Interview${c.interviewCount > 0 ? ` (${c.interviewCount})` : ''}`}
                                                            >
                                                                <Calendar className="w-3.5 h-3.5" />
                                                            </button>
                                                            {isAdminOrManager && (
                                                                <button
                                                                    onClick={() => handleOpenEditCandidate(c)}
                                                                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                                                                    title="Edit Candidate"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleExportCandidate(c.id, c.fullName)}
                                                                disabled={exportingId === c.id}
                                                                className="p-2 bg-gray-50 hover:bg-indigo-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
                                                                title="Download Profile"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </button>
                                                            {isAdmin && (c.currentStage === 'HIRED' || c.currentStage === 'OFFER') && (
                                                                <button
                                                                    onClick={() => handleOfferLetter(c.id, c.fullName)}
                                                                    disabled={offerGeneratingId === c.id}
                                                                    className="p-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-md shadow-red-500/20 hover:from-red-700 hover:to-orange-700 transition-all active:scale-95 disabled:opacity-50"
                                                                    title="Generate Offer Letter"
                                                                >
                                                                    <Award className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDeleteCandidate(c.id, c.fullName)}
                                                                    className="p-2 bg-gray-50 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 transition-all shadow-sm"
                                                                    title="Remove Candidate"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── ADD CANDIDATE MODAL ─── */}
            {isAddCandidateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsAddCandidateOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/95 to-white/95 flex items-start justify-between rounded-t-[3rem]">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    ✨ Add <span className="text-red-600">Candidate</span>
                                </h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Submit a new applicant to the pipeline</p>
                            </div>
                            <button onClick={() => setIsAddCandidateOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCandidate} className="p-8 space-y-5">
                            {candidateError && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex items-start gap-3">
                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="font-bold">{candidateError}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className={labelClass}>Full Name *</label>
                                <input required type="text" className={inputClass} value={candidateForm.fullName} onChange={e => setCandidateForm(p => ({ ...p, fullName: e.target.value }))} placeholder="e.g., Jane Doe" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Email *</label>
                                    <input required type="email" className={inputClass} value={candidateForm.email} onChange={e => setCandidateForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Phone</label>
                                    <input type="tel" className={inputClass} value={candidateForm.phoneNumber} onChange={e => setCandidateForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+1-555-0100" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Job Posting *</label>
                                <select required className={inputClass} value={candidateForm.jobPostingId} onChange={e => setCandidateForm(p => ({ ...p, jobPostingId: e.target.value }))}>
                                    <option value="">— Select a Job Posting —</option>
                                    {jobs.filter(j => j.status === 'OPEN').map(j => (
                                        <option key={j.id} value={j.id}>{j.title} — {j.department}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Source</label>
                                    <select className={inputClass} value={candidateForm.source || ''} onChange={e => setCandidateForm(p => ({ ...p, source: e.target.value }))}>
                                        <option value="">— Source —</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Indeed">Indeed</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Direct">Direct Application</option>
                                        <option value="Agency">Agency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>LinkedIn URL</label>
                                    <input type="url" className={inputClass} value={candidateForm.linkedInUrl || ''} onChange={e => setCandidateForm(p => ({ ...p, linkedInUrl: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Resume / CV URL</label>
                                <input type="url" className={inputClass} value={candidateForm.resumeUrl || ''} onChange={e => setCandidateForm(p => ({ ...p, resumeUrl: e.target.value }))} placeholder="https://drive.google.com/..." />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Notes</label>
                                <textarea rows={2} className={`${inputClass} resize-none`} value={candidateForm.notes} onChange={e => setCandidateForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes about the candidate..." />
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsAddCandidateOpen(false)} className="px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={candidateSubmitting} className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50">
                                    {candidateSubmitting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
                                    ) : '✨ Add Candidate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── INTERVIEW SLIDE-OVER PANEL ─── */}
            {isInterviewPanelOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsInterviewPanelOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
                        {/* Panel Header */}
                        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-start justify-between flex-shrink-0">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Panel</p>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mt-1">
                                    {selectedCandidateName}
                                </h2>
                            </div>
                            <button onClick={() => setIsInterviewPanelOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Schedule Form */}
                            <div className="bg-gray-50 p-5 rounded-[1.5rem] border border-gray-100">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-red-600" />
                                    Schedule New Interview
                                </h3>

                                {interviewError && (
                                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex gap-2">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        {interviewError}
                                    </div>
                                )}

                                <form onSubmit={handleScheduleInterview} className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date & Time *</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-colors"
                                            value={interviewForm.scheduledAt}
                                            onChange={e => setInterviewForm(p => ({ ...p, scheduledAt: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Format *</label>
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-colors"
                                                value={interviewForm.interviewType}
                                                onChange={e => setInterviewForm(p => ({ ...p, interviewType: e.target.value as InterviewType }))}
                                            >
                                                <option value="VIDEO">Video Call</option>
                                                <option value="PHONE">Phone</option>
                                                <option value="IN_PERSON">In Person</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Duration (mins)</label>
                                            <input
                                                type="number"
                                                min={15}
                                                step={15}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-colors"
                                                value={interviewForm.durationMinutes}
                                                onChange={e => setInterviewForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Interviewer *</label>
                                        <select
                                            required
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-colors"
                                            value={interviewForm.interviewerId}
                                            onChange={e => setInterviewForm(p => ({ ...p, interviewerId: e.target.value }))}
                                        >
                                            <option value="">— Select Interviewer —</option>
                                            {availableInterviewers.map(u => (
                                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Notes / Meeting Link</label>
                                        <textarea
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-colors resize-none"
                                            value={interviewForm.notes}
                                            onChange={e => setInterviewForm(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Meeting link, instructions..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={interviewSubmitting}
                                        className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {interviewSubmitting ? (
                                            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scheduling...</>
                                        ) : (
                                            <><Calendar className="w-3.5 h-3.5" /> Schedule Interview</>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Interviews List */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Past & Upcoming Interviews</h3>

                                {interviews.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                        <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No interviews yet</p>
                                    </div>
                                ) : interviews.map(inv => {
                                    const IntIcon = INTERVIEW_TYPE_ICONS[inv.interviewType] || Calendar;
                                    const isScheduled = inv.status === 'SCHEDULED';
                                    const statusColors: Record<string, string> = {
                                        SCHEDULED: '#3B82F6', COMPLETED: '#10B981', CANCELLED: '#9CA3AF', NO_SHOW: '#EF4444'
                                    };
                                    const statusColor = statusColors[inv.status] || '#9CA3AF';

                                    return (
                                        <div key={inv.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: statusColor }}>
                                                        <IntIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{inv.interviewType.replace('_', ' ')}</p>
                                                        <span
                                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                                            style={{ backgroundColor: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}30` }}
                                                        >
                                                            {inv.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteInterview(inv.id)}
                                                        className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-1 mb-3">
                                                <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(inv.scheduledAt).toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" />
                                                    {inv.durationMinutes} minutes
                                                </p>
                                                {inv.interviewerName && (
                                                    <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5">
                                                        <Users className="w-3 h-3" />
                                                        {inv.interviewerName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Feedback */}
                                            {resultFormOpenFor === inv.id ? (
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                                                    <select
                                                        className="w-full text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                        value={resultForm.status}
                                                        onChange={e => setResultForm(p => ({ ...p, status: e.target.value as InterviewStatus }))}
                                                    >
                                                        <option value="SCHEDULED">Scheduled</option>
                                                        <option value="COMPLETED">Completed</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                        <option value="NO_SHOW">No Show</option>
                                                    </select>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Interviewer feedback..."
                                                        className="w-full text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
                                                        value={resultForm.feedback || ''}
                                                        onChange={e => setResultForm(p => ({ ...p, feedback: e.target.value }))}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number" min={1} max={5}
                                                            placeholder="Rating (1-5)"
                                                            className="flex-1 text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                                                            value={resultForm.rating || ''}
                                                            onChange={e => setResultForm(p => ({ ...p, rating: Number(e.target.value) }))}
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateResult(inv.id)}
                                                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setResultFormOpenFor(null)}
                                                            className="px-3 py-2 text-gray-500 hover:text-gray-900 text-[10px] font-black uppercase tracking-widest transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {inv.feedback && (
                                                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] font-medium text-gray-600 italic mb-2">
                                                            "{inv.feedback}"
                                                            {inv.rating && <span className="ml-2 not-italic font-black text-amber-500">{'★'.repeat(inv.rating)}</span>}
                                                        </div>
                                                    )}
                                                    {isAdminOrManager && (
                                                        <button
                                                            onClick={() => {
                                                                setResultFormOpenFor(inv.id);
                                                                setResultForm({ feedback: inv.feedback || '', rating: inv.rating || 3, status: inv.status });
                                                            }}
                                                            className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                                                        >
                                                            {isScheduled ? '+ Add Result' : '✏ Edit Result'} →
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ─── EDIT CANDIDATE MODAL ─── */}
            {isEditCandidateOpen && editingCandidate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsEditCandidateOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/95 to-white/95 flex items-start justify-between rounded-t-[3rem]">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    Edit <span className="text-red-600">Candidate</span>
                                </h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{editingCandidate.jobPostingTitle}</p>
                            </div>
                            <button onClick={() => setIsEditCandidateOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditCandidateSubmit} className="p-8 space-y-4 max-h-[65vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Full Name *</label>
                                    <input required type="text" className={inputClass} value={editCandidateForm.fullName} onChange={e => setEditCandidateForm(p => ({ ...p, fullName: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Email *</label>
                                    <input required type="email" className={inputClass} value={editCandidateForm.email} onChange={e => setEditCandidateForm(p => ({ ...p, email: e.target.value }))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Phone</label>
                                    <input type="tel" className={inputClass} value={editCandidateForm.phoneNumber || ''} onChange={e => setEditCandidateForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Source</label>
                                    <select className={inputClass} value={editCandidateForm.source || ''} onChange={e => setEditCandidateForm(p => ({ ...p, source: e.target.value }))}>
                                        <option value="">— Source —</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Indeed">Indeed</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Direct">Direct Application</option>
                                        <option value="Agency">Agency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>LinkedIn URL</label>
                                <input type="url" className={inputClass} value={editCandidateForm.linkedInUrl || ''} onChange={e => setEditCandidateForm(p => ({ ...p, linkedInUrl: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Resume / CV URL</label>
                                <input type="url" className={inputClass} value={editCandidateForm.resumeUrl || ''} onChange={e => setEditCandidateForm(p => ({ ...p, resumeUrl: e.target.value }))} placeholder="https://drive.google.com/..." />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Portfolio URL</label>
                                <input type="url" className={inputClass} value={editCandidateForm.portfolioUrl || ''} onChange={e => setEditCandidateForm(p => ({ ...p, portfolioUrl: e.target.value }))} placeholder="https://portfolio.example.com" />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Notes</label>
                                <textarea rows={2} className={`${inputClass} resize-none`} value={editCandidateForm.notes || ''} onChange={e => setEditCandidateForm(p => ({ ...p, notes: e.target.value }))} />
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditCandidateOpen(false)} className="px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editCandidateSubmitting} className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:from-red-700 hover:to-orange-700 active:scale-95 transition-all disabled:opacity-50">
                                    {editCandidateSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidatePipelinePage;
