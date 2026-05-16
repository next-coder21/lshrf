import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, createReview } from '../store/performanceSlice';
import { fetchEmployees } from '@/features/employees/store/employeeSlice';
import { RootState, AppDispatch } from '@/store/store';
import toast from 'react-hot-toast';
import {
    Trophy, Star,
    TrendingUp, Search,
    Award, Zap, FileText,
    XCircle, BarChart3
} from 'lucide-react';
import { EmptyState } from '@/common/components/EmptyState';
import clsx from 'clsx';

export const PerformancePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { reviews, loading } = useSelector((state: RootState) => state.performance);
    const { employees } = useSelector((state: RootState) => state.employees);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const canWriteReview = currentUser != null && (
        ['MANAGER', 'CLIENT_ADMIN', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role) ||
        currentUser.permissions.includes('PERFORMANCE_CREATE')
    );

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        reviewerId: '',
        rating: 5,
        feedback: '',
        strengths: '',
        areasOfImprovement: '',
        reviewPeriod: 'Annual 2026',
        reviewDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        dispatch(fetchReviews());
        dispatch(fetchEmployees());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(createReview(formData)).unwrap();
            toast.success('Performance review submitted');
            setIsModalOpen(false);
            setFormData({
                employeeId: '', reviewerId: '', rating: 5,
                feedback: '', strengths: '', areasOfImprovement: '',
                reviewPeriod: 'Annual 2026',
                reviewDate: new Date().toISOString().split('T')[0],
            });
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit review');
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (rating >= 3) return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-rose-500 bg-rose-50 border-rose-100';
    };

    const filteredReviews = reviews.filter(r =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        avgRating: reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : '0',
        topPerformers: reviews.filter(r => r.rating >= 4).length,
        pendingFeedback: reviews.filter(r => r.status === 'SUBMITTED').length
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-gray-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                        Elite <span className="text-red-600">Performance</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-red-600" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth & Talent Optimization</p>
                    </div>
                </div>

                {canWriteReview && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                    >
                        <Star className="w-4 h-4 fill-white" />
                        Write Review
                    </button>
                )}
            </div>

            {/* Performance Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-emerald-50 w-fit rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Force Rating</p>
                            <div className="flex items-end gap-2 mt-1">
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.avgRating}</p>
                                <div className="flex mb-1.5 overflow-hidden">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={clsx("w-3 h-3", i <= Math.round(parseFloat(stats.avgRating)) ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-red-50 w-fit rounded-2xl">
                            <Award className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Potential Force</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">{stats.topPerformers}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating 4.0 or Higher</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative space-y-4">
                        <div className="p-3 bg-blue-50 w-fit rounded-2xl">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Cycle Health</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">92%</p>
                        </div>
                        <div className="w-full bg-blue-50 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full w-[92%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find personnel history..."
                            className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-500/10 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-xl">All Reviews</button>
                        <button className="px-4 py-2 hover:text-gray-900 transition-colors">By Rating</button>
                        <button className="px-4 py-2 hover:text-gray-900 transition-colors">By Dept</button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel profile</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Cycle</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Appraisal Data</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse h-24 bg-gray-50/10" />)
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={BarChart3} title="No performance reviews" description="Write a review to get started" />
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
                                                    {r.employeeName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-gray-900 uppercase tracking-tight">{r.employeeName}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Appraiser: {r.reviewerName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className={clsx(
                                                "px-3 py-1.5 rounded-xl border text-xs font-black w-fit flex items-center gap-1.5",
                                                getRatingColor(r.rating)
                                            )}>
                                                <Star className="w-3 h-3 fill-current" />
                                                {r.rating.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-gray-700 uppercase">{r.reviewPeriod}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(r.reviewDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-black uppercase tracking-widest">
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 max-w-xs">
                                            <p className="text-[10px] font-bold text-gray-500 italic truncate" title={r.feedback}>
                                                "{r.feedback}"
                                            </p>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Appraisal Modal — only rendered for roles with write access */}
            {isModalOpen && canWriteReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-12 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Personnel <span className="text-red-600">Appraisal</span></h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Professional Merit Evaluation</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Subject Personnel</label>
                                        <select
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20"
                                            value={formData.employeeId}
                                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                        >
                                            <option value="">Identify profile...</option>
                                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} [{e.employeeId}]</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Merit Rating (1-5)</label>
                                        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className={clsx(
                                                        "flex-1 py-2 rounded-xl transition-all",
                                                        formData.rating >= star ? "bg-amber-400 text-white shadow-lg shadow-amber-200" : "bg-white text-gray-300"
                                                    )}
                                                >
                                                    <Star className={clsx("w-4 h-4 mx-auto", formData.rating >= star ? "fill-white" : "")} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Review Period</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20"
                                            placeholder="e.g. Annual 2026"
                                            value={formData.reviewPeriod}
                                            onChange={e => setFormData({ ...formData, reviewPeriod: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Review Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20"
                                            value={formData.reviewDate}
                                            onChange={e => setFormData({ ...formData, reviewDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Performance Narrative</label>
                                    <textarea
                                        required
                                        placeholder="Detailed evaluation of professional performance during this cycle..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-4 px-6 text-sm font-bold min-h-[120px] resize-none"
                                        value={formData.feedback}
                                        onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pl-2">Core Strengths</label>
                                        <textarea
                                            className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl py-4 px-6 text-xs font-bold h-24 resize-none"
                                            placeholder="Identify key domains of excellence..."
                                            value={formData.strengths}
                                            onChange={e => setFormData({ ...formData, strengths: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-600 uppercase tracking-widest pl-2">Growth Thresholds</label>
                                        <textarea
                                            className="w-full bg-red-50/30 border border-red-100 rounded-2xl py-4 px-6 text-xs font-bold h-24 resize-none"
                                            placeholder="Identify domain for optimization..."
                                            value={formData.areasOfImprovement}
                                            onChange={e => setFormData({ ...formData, areasOfImprovement: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98]"
                                >
                                    Finalize Appraisal
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
