import { useState, useEffect } from 'react';
import {
    Plus,
    Shield,
    Clock,
    UserCheck,
    ArrowRight,
    Settings2,
    X,
    Trash2,
    ChevronRight,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { approvalApi } from '../api/approvalApi';
import { WorkflowDefinition, WorkflowStep } from '../types/approval.types';
import clsx from 'clsx';

export default function ApprovalConfigPage() {
    const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { loadDefinitions(); }, []);

    const loadDefinitions = async () => {
        try {
            setLoading(true);
            const data = await approvalApi.getDefinitions();
            setDefinitions(data);
        } catch (error) {
            toast.error('Failed to load workflow definitions');
        } finally {
            setLoading(false);
        }
    };

    const filteredDefinitions = definitions.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.targetType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Approval <span className="text-red-600">Workflows</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Hierarchical Authorization Framework</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-400/30 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Define Protocol
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Protocols', count: definitions.filter(d => d.active).length, icon: Shield, color: 'text-gray-900', bg: 'bg-gray-50' },
                    { label: 'Target Modules', count: new Set(definitions.map(d => d.targetType)).size, icon: Settings2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Avg Steps', count: definitions.length > 0 ? (definitions.reduce((acc, d) => acc + d.steps.length, 0) / definitions.length).toFixed(1) : 0, icon: Clock, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.count}</p>
                        </div>
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={clsx("w-6 h-6", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search protocols by module or name..."
                        className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Workflows List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />)}
                </div>
            ) : filteredDefinitions.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-gray-100 p-32 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                        <Shield className="w-16 h-16 text-gray-900" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Authorization Protocols Found</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredDefinitions.map((def) => (
                        <div key={def.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-100 opacity-0 transition-opacity" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-red-600 transition-colors">{def.name}</h3>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">{def.targetType}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{def.description}</p>
                                    </div>
                                    <div className={clsx(
                                        "px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest",
                                        def.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                    )}>
                                        {def.active ? 'Operational' : 'Paused'}
                                    </div>
                                </div>

                                {/* Steps Visualization */}
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest underline decoration-red-500 decoration-2 underline-offset-4">Sequence of Command</p>
                                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                                        {def.steps.map((step, idx) => (
                                            <div key={step.id} className="flex items-center gap-4 shrink-0">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-100 transition-all">
                                                        <span className="text-sm font-black text-gray-900 group-hover:text-red-600 font-mono">0{step.stepOrder}</span>
                                                    </div>
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter text-center max-w-[80px] leading-tight">{step.name}</p>
                                                    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{step.approverRole.replace('ROLE_', '')}</span>
                                                </div>
                                                {idx < def.steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-200 mt-[-20px]" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-8 mt-4 border-t border-gray-50">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
                                        <Settings2 size={14} />
                                        Modify Pattern
                                    </button>
                                    <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mock Modal for defining protocol */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Define <span className="text-red-600">Protocol</span></h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Construct Authorization Sequence</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Simpler form for seeding/demo purposes */}
                        <div className="space-y-6">
                            <p className="text-xs text-gray-500 font-medium bg-red-50 p-4 rounded-2xl border border-red-100">
                                <span className="font-bold text-red-600 uppercase tracking-widest block mb-1">Notice:</span>
                                Authorization patterns define the chain of command for critical operations like Leave Approval and Expense Reimbursement.
                            </p>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Name</label>
                                <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none" placeholder="e.g., Executive Leave Verification" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Module</label>
                                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none">
                                    <option>LEAVE</option>
                                    <option>EXPENSE</option>
                                    <option>PAYROLL</option>
                                </select>
                            </div>
                            <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-4">
                                Initiate Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
