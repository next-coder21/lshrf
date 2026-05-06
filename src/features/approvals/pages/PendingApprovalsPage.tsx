import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    FileText,
    Search,
    ChevronRight,
    MessageSquare,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { approvalApi } from '../api/approvalApi';
import { WorkflowInstance } from '../types/approval.types';
import clsx from 'clsx';

export default function PendingApprovalsPage() {
    const [instances, setInstances] = useState<WorkflowInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => { loadPending(); }, []);

    const loadPending = async () => {
        try {
            setLoading(true);
            const data = await approvalApi.getMyPending('CURRENT_USER_ID'); // Replace with actual user ID
            setInstances(data);
        } catch (error) {
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedInstance) return;
        try {
            if (action === 'approve') {
                await approvalApi.approve(selectedInstance.id, comment, 'CURRENT_USER_ID');
                toast.success('Protocol Authorized');
            } else {
                await approvalApi.reject(selectedInstance.id, comment, 'CURRENT_USER_ID');
                toast.error('Protocol Denied');
            }
            setSelectedInstance(null);
            setComment('');
            loadPending();
        } catch (error) {
            toast.error('Failed to process authorization');
        }
    };

    const filtered = instances.filter(i =>
        i.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.targetEntityType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Pending <span className="text-red-600">Authorizations</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Personnel Decision Pipeline</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Awaiting Signature: {instances.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by request type or personnel..."
                                className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Step</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-20 bg-gray-50/10" />)
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-32 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest grayscale opacity-30">
                                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-900" />
                                                All Decisional Queues Cleared
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((inst) => (
                                            <tr key={inst.id}
                                                onClick={() => setSelectedInstance(inst)}
                                                className={clsx(
                                                    "hover:bg-gray-50/50 transition-colors cursor-pointer group",
                                                    selectedInstance?.id === inst.id && "bg-red-50/30"
                                                )}
                                            >
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">{inst.workflowName}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ref: {inst.targetEntityId.substring(0, 8)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-red-500" />
                                                        {inst.currentStep?.name}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-tighter">
                                                    {new Date(inst.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <ChevronRight className={clsx(
                                                        "w-5 h-5 ml-auto transition-transform",
                                                        selectedInstance?.id === inst.id ? "rotate-90 text-red-600" : "text-gray-200"
                                                    )} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-1">
                    {selectedInstance ? (
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-8 space-y-8 animate-in slide-in-from-right duration-500 sticky top-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Authorization <span className="text-red-600">Console</span></h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execute Decisional Protocol</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <FileText className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Target Entity</p>
                                            <p className="text-sm font-black text-gray-900 uppercase mt-1">{selectedInstance.targetEntityType} Request</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <User className="w-5 h-5 text-gray-900" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Initiator</p>
                                            <p className="text-sm font-black text-gray-900 uppercase mt-1">Employee System ID: {selectedInstance.targetEntityId.substring(0, 10)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-red-600" />
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorization Comments</label>
                                    </div>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none h-32 resize-none"
                                        placeholder="Provide justification for this decision..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('approve')}
                                        className="flex flex-col items-center gap-3 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 group/btn"
                                    >
                                        <CheckCircle2 className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Authorize</span>
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        className="flex flex-col items-center gap-3 p-6 bg-red-50 rounded-[2rem] border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 group/btn"
                                    >
                                        <XCircle className="w-8 h-8 group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Deny</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
                            <ShieldAlert className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[200px]">Select a protocol from the queue to initiate authorization</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
