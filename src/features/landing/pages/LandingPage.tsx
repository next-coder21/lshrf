import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, Clock, DollarSign, BarChart2, Shield,
    Calendar, ChevronRight, CheckCircle2, ArrowRight, Menu, X,
    Building2, FileText, Star, Zap, Globe, Lock, TrendingUp,
    UserCheck, ClipboardList, Award, Bell, Settings, ChevronDown
} from 'lucide-react';

const NAV_LINKS = ['Features', 'Modules', 'Pricing', 'About'];

const STATS = [
    { value: '10,000+', label: 'Employees Managed' },
    { value: '500+', label: 'Companies Onboarded' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '30+', label: 'HR Modules' },
];

const FEATURES = [
    {
        icon: Briefcase,
        title: 'Recruitment Pipeline',
        description: 'End-to-end ATS with Kanban board. Track candidates from Application to Hire across 6 stages with PDF offer letters.',
        color: 'bg-violet-50 text-violet-600',
        badge: 'Most Popular',
    },
    {
        icon: Users,
        title: 'Employee Management',
        description: 'Complete employee lifecycle management. Profiles, departments, designations, and seamless onboarding workflows.',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: Clock,
        title: 'Attendance Tracking',
        description: 'Clock-in/out records, late arrival detection, monthly summaries, and automated absence reporting.',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon: Calendar,
        title: 'Leave Management',
        description: 'Multi-type leave requests with manager approval workflows, balance tracking, and calendar integration.',
        color: 'bg-orange-50 text-orange-600',
    },
    {
        icon: DollarSign,
        title: 'Payroll Processing',
        description: 'Automated payroll runs with gross/net calculations, deductions, and downloadable payslips.',
        color: 'bg-green-50 text-green-600',
    },
    {
        icon: BarChart2,
        title: 'Performance Reviews',
        description: 'Review cycles, self-assessments, manager ratings, and goal tracking with completion analytics.',
        color: 'bg-pink-50 text-pink-600',
    },
    {
        icon: ClipboardList,
        title: 'Shift Management',
        description: 'Define shift templates, assign to employees with effective date ranges, and view weekly schedules.',
        color: 'bg-indigo-50 text-indigo-600',
    },
    {
        icon: Shield,
        title: 'Role-Based Access',
        description: '30+ granular permissions. Custom roles override system defaults — engineers see only what they need.',
        color: 'bg-red-50 text-red-600',
    },
    {
        icon: FileText,
        title: 'Reports & Exports',
        description: 'PDF pipeline reports, candidate profiles, offer letters, and Excel exports with branded styling.',
        color: 'bg-yellow-50 text-yellow-600',
    },
];

const PIPELINE_STAGES = [
    { stage: 'Applied', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
    { stage: 'Screening', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    { stage: 'Interview', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
    { stage: 'Offer', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    { stage: 'Hired', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    { stage: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
];

const PLANS = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for small teams getting started.',
        features: ['Up to 10 employees', 'Basic attendance', 'Leave management', 'Email support'],
        cta: 'Get Started Free',
        highlight: false,
    },
    {
        name: 'Basic',
        price: '$29',
        period: 'per month',
        description: 'For growing teams that need more power.',
        features: ['Up to 50 employees', 'Payroll processing', 'Recruitment pipeline', 'PDF reports', 'Priority support'],
        cta: 'Start Basic',
        highlight: false,
    },
    {
        name: 'Premium',
        price: '$79',
        period: 'per month',
        description: 'Full suite for established organizations.',
        features: ['Up to 200 employees', 'All modules included', 'Custom roles & permissions', 'Excel exports', 'Performance reviews', 'Dedicated support'],
        cta: 'Start Premium',
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        description: 'Tailored for large multi-site organizations.',
        features: ['Unlimited employees', 'Multi-tenant management', 'Custom integrations', 'SLA guarantee', 'Onboarding assistance', 'Account manager'],
        cta: 'Contact Sales',
        highlight: false,
    },
];

const TESTIMONIALS = [
    {
        name: 'Sarah Chen',
        role: 'HR Director, TechCorp',
        text: 'LijiHR transformed how we manage our 300-person team. The recruitment pipeline alone saved us 15 hours a week.',
        rating: 5,
    },
    {
        name: 'Michael Torres',
        role: 'CEO, Startup Ventures',
        text: 'The custom role system is brilliant. Our finance team only sees payroll, and recruiters only see candidates. Clean and secure.',
        rating: 5,
    },
    {
        name: 'Amara Osei',
        role: 'Operations Manager, RetailGroup',
        text: 'Shift management and attendance tracking in one place. Our operations team onboarded in a single afternoon.',
        rating: 5,
    },
];

export const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    const FAQS = [
        { q: 'Is LijiHR multi-tenant?', a: 'Yes. Each client organization has a completely isolated data environment. A Super Admin manages all tenants from a single dashboard.' },
        { q: 'Can I define custom roles?', a: 'Absolutely. Create roles with any combination of 30+ granular permissions. Custom roles override system role defaults.' },
        { q: 'Are PDF reports included?', a: 'Yes. Pipeline reports, candidate profiles, interview summaries, payslips, and offer letters are all generated as PDFs.' },
        { q: 'What happens when I exceed my plan limits?', a: 'You\'ll receive a notification and can upgrade at any time. We never cut off access mid-cycle.' },
        { q: 'Is there an API?', a: 'Yes. LijiHR ships with a fully documented REST API (Swagger UI) so you can integrate with your existing tools.' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

            {/* ── NAVBAR ─────────────────────────────────────────────────── */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo('hero')}>
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">L</span>
                        </div>
                        <span className="font-black text-lg tracking-tight">
                            Liji<span className="text-red-600">HR</span>
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map(link => (
                            <button
                                key={link}
                                onClick={() => scrollTo(link.toLowerCase())}
                                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {link}
                            </button>
                        ))}
                    </nav>

                    {/* CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden p-2" onClick={() => setMobileOpen(v => !v)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
                        {NAV_LINKS.map(link => (
                            <button key={link} onClick={() => scrollTo(link.toLowerCase())}
                                className="block w-full text-left text-sm font-semibold text-gray-700 py-2">
                                {link}
                            </button>
                        ))}
                        <button onClick={() => navigate('/login')}
                            className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl mt-2">
                            Get Started
                        </button>
                    </div>
                )}
            </header>

            {/* ── HERO ───────────────────────────────────────────────────── */}
            <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gray-950">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full">
                            <Zap className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">A Liji Groups Product</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                            HR That
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                                Works For
                            </span>
                            <br />
                            Your Team.
                        </h1>

                        <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                            LijiHR is the all-in-one HR platform built for modern organizations. Recruitment, payroll, attendance, leave, performance — unified in one powerful dashboard.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-600/30 text-sm"
                            >
                                Start Free Today
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollTo('features')}
                                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10 text-sm"
                            >
                                Explore Features
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex -space-x-2">
                                {['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#10b981'].map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: c }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400">
                                <span className="text-white font-bold">500+</span> companies trust LijiHR
                            </p>
                        </div>
                    </div>

                    {/* Right — Dashboard mockup */}
                    <div className="hidden lg:block relative">
                        <div className="bg-gray-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Window bar */}
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <div className="ml-4 flex-1 h-6 bg-white/5 rounded-lg" />
                            </div>

                            {/* Mock sidebar + content */}
                            <div className="flex h-[380px]">
                                {/* Sidebar */}
                                <div className="w-14 bg-gray-950 flex flex-col items-center py-4 gap-3 border-r border-white/5">
                                    {[Users, Briefcase, Clock, Calendar, DollarSign, BarChart2].map((Icon, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${i === 1 ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    ))}
                                </div>

                                {/* Content area */}
                                <div className="flex-1 p-5 space-y-4 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recruitment</p>
                                            <p className="text-sm font-black text-white">Candidate Pipeline</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {['bg-gray-700', 'bg-red-600'].map((c, i) => (
                                                <div key={i} className={`w-16 h-6 ${c} rounded-lg`} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Kanban columns */}
                                    <div className="flex gap-2 overflow-hidden">
                                        {PIPELINE_STAGES.slice(0, 4).map((s, i) => (
                                            <div key={i} className="flex-1 bg-white/5 rounded-xl p-2 space-y-2 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                    <p className="text-[8px] font-black text-gray-400 uppercase truncate">{s.stage}</p>
                                                </div>
                                                {[1, 2].slice(0, i === 0 ? 2 : i === 1 ? 2 : i === 2 ? 1 : 1).map((_, j) => (
                                                    <div key={j} className="bg-white/5 rounded-lg p-2 space-y-1">
                                                        <div className="h-2 bg-white/20 rounded w-3/4" />
                                                        <div className="h-1.5 bg-white/10 rounded w-1/2" />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Open Jobs', val: '12', c: 'text-emerald-400' },
                                            { label: 'Candidates', val: '84', c: 'text-blue-400' },
                                            { label: 'Interviews', val: '23', c: 'text-violet-400' },
                                        ].map((s, i) => (
                                            <div key={i} className="bg-white/5 rounded-xl p-2.5">
                                                <p className={`text-base font-black ${s.c}`}>{s.val}</p>
                                                <p className="text-[8px] text-gray-500 font-bold uppercase">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating cards */}
                        <div className="absolute -top-6 -right-6 bg-emerald-500 text-white rounded-2xl px-4 py-2.5 shadow-xl">
                            <p className="text-[10px] font-black uppercase">New Hire</p>
                            <p className="text-xs font-bold">Sarah joined Engineering</p>
                        </div>
                        <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] font-black text-gray-700 uppercase">99.9% Uptime</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
                    <ChevronDown className="w-5 h-5 animate-bounce" />
                </div>
            </section>

            {/* ── STATS ──────────────────────────────────────────────────── */}
            <section className="bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => (
                        <div key={i} className="text-center space-y-1">
                            <p className="text-4xl font-black text-gray-900">{s.value}</p>
                            <p className="text-sm font-semibold text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────────────── */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
                        <Zap className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Everything You Need</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                        One Platform.<br />
                        <span className="text-red-600">Every HR Function.</span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        From the moment someone applies to the day they retire — LijiHR handles the entire employee journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="group bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-xl hover:border-gray-200 transition-all duration-300 relative overflow-hidden">
                            {f.badge && (
                                <div className="absolute top-5 right-5 px-2.5 py-1 bg-violet-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                                    {f.badge}
                                </div>
                            )}
                            <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                <f.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── RECRUITMENT PIPELINE SPOTLIGHT ─────────────────────────── */}
            <section id="modules" className="bg-gray-950 py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-600/10 border border-violet-600/20 rounded-full">
                                <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Recruitment ATS</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                                Hire Faster.<br />
                                <span className="text-violet-400">Hire Smarter.</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                A complete Applicant Tracking System with visual Kanban pipeline, interview scheduling, result tracking, and one-click PDF offer letters.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Job board with multi-type postings',
                                    'Kanban pipeline with 6 stages',
                                    'Interviewer assignment & scheduling',
                                    'Rating and feedback per interview',
                                    'PDF offer letters with watermarks',
                                    'Export full pipeline reports',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pipeline visual */}
                        <div className="space-y-3">
                            {PIPELINE_STAGES.map((s, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${s.color} bg-opacity-10`} style={{ opacity: 1 - i * 0.08 }}>
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-black uppercase tracking-widest">{s.stage}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.max(1, 5 - i) }).map((_, j) => (
                                            <div key={j} className="w-7 h-7 rounded-full bg-white/20 border border-current flex items-center justify-center text-[9px] font-black">
                                                {String.fromCharCode(65 + j + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-40 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECURITY & ACCESS CONTROL ──────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Permission grid visual */}
                    <div className="bg-gray-50 rounded-3xl p-8 space-y-3 border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Permission Matrix</p>
                        {[
                            { role: 'Super Admin', color: 'bg-red-100 text-red-700', perms: [1,1,1,1,1,1] },
                            { role: 'Client Admin', color: 'bg-orange-100 text-orange-700', perms: [1,1,1,1,0,1] },
                            { role: 'Manager', color: 'bg-emerald-100 text-emerald-700', perms: [1,1,1,0,0,0] },
                            { role: 'Custom Role', color: 'bg-violet-100 text-violet-700', perms: [1,0,1,0,0,0] },
                            { role: 'Employee', color: 'bg-blue-100 text-blue-700', perms: [1,0,0,0,0,0] },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest w-24 text-center flex-shrink-0 ${row.color}`}>
                                    {row.role}
                                </span>
                                <div className="flex gap-1.5 flex-1">
                                    {['Recruit', 'Payroll', 'Leave', 'Users', 'Billing', 'Tenants'].map((perm, j) => (
                                        <div key={j} className="flex-1 text-center">
                                            {j === 0 && <p className="text-[7px] font-bold text-gray-400 uppercase mb-1 truncate">{perm}</p>}
                                            {j > 0 && <p className="text-[7px] font-bold text-gray-400 uppercase mb-1 truncate">{perm}</p>}
                                            <div className={`h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${row.perms[j] ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}>
                                                {row.perms[j] ? '✓' : '–'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
                            <Shield className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Enterprise Security</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                            Permissions That<br />
                            <span className="text-red-600">Make Sense.</span>
                        </h2>
                        <p className="text-gray-500 leading-relaxed">
                            Stop giving everyone admin access. LijiHR's 30+ granular permissions let you define exactly what each person can see and do — at the user level.
                        </p>
                        <ul className="space-y-3">
                            {[
                                '4 system roles out of the box',
                                'Unlimited custom roles per organization',
                                'Custom roles override system defaults',
                                'Multi-tenant isolation — zero data leakage',
                                'JWT-based stateless authentication',
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                    <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-3 h-3 text-red-600" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
            <section className="bg-gray-50 border-y border-gray-100 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl lg:text-4xl font-black">Loved by HR Teams</h2>
                        <p className="text-gray-500 mt-2">Here's what our customers have to say.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-4">
                                <div className="flex gap-1">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{t.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ────────────────────────────────────────────────── */}
            <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                        Simple, Transparent
                        <br />
                        <span className="text-red-600">Pricing</span>
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Start free and scale as you grow. No hidden fees, no surprise charges.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((plan, i) => (
                        <div
                            key={i}
                            className={`rounded-3xl p-7 space-y-6 transition-all relative ${
                                plan.highlight
                                    ? 'bg-gray-900 text-white shadow-2xl scale-105 border border-gray-700'
                                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                            }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div>
                                <p className={`text-xs font-black uppercase tracking-widest mb-3 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {plan.name}
                                </p>
                                <div className="flex items-end gap-1">
                                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>/{plan.period}</span>
                                </div>
                                <p className={`text-xs mt-2 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                            </div>

                            <ul className="space-y-2.5">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2.5 text-xs">
                                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-red-400' : 'text-emerald-500'}`} />
                                        <span className={plan.highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/login')}
                                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                                    plan.highlight
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT / WHY LIJI GROUPS ────────────────────────────────── */}
            <section id="about" className="bg-gray-950 py-24">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">A Liji Groups Company</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
                        Built by a Team That Understands HR.
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        LijiHR is developed under Liji Groups — a technology company dedicated to building tools that make complex operations simple. We built the product we always wished existed.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                        {[
                            { icon: TrendingUp, label: 'Built for Scale', desc: 'Multi-tenant from day one' },
                            { icon: Lock, label: 'Secure by Design', desc: 'JWT, RBAC, tenant isolation' },
                            { icon: Award, label: 'Production Ready', desc: 'Spring Boot 3 + React 19' },
                            { icon: Bell, label: 'Always Improving', desc: 'New features every sprint' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center space-y-2">
                                <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center mx-auto">
                                    <item.icon className="w-5 h-5 text-red-400" />
                                </div>
                                <p className="text-sm font-black text-white">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ────────────────────────────────────────────────────── */}
            <section className="max-w-3xl mx-auto px-6 py-24 space-y-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-black">Frequently Asked</h2>
                    <p className="text-gray-500 mt-2">Everything you want to know before getting started.</p>
                </div>
                {FAQS.map((faq, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <button
                            className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        >
                            {faq.q}
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        {activeFaq === i && (
                            <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {/* ── CTA BANNER ─────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <div className="bg-gray-900 rounded-[2.5rem] p-14 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                            Ready to Transform<br />Your HR?
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Join hundreds of companies already using LijiHR. Get started in minutes, no credit card required.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center pt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-600/30 text-sm"
                            >
                                Start Free Today
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollTo('pricing')}
                                className="flex items-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/10 transition-all text-sm"
                            >
                                View Pricing
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="bg-gray-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-sm">L</span>
                            </div>
                            <span className="font-black text-lg text-white tracking-tight">
                                Liji<span className="text-red-500">HR</span>
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            The complete HR platform for modern organizations. Built with care by Liji Groups.
                        </p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            A Liji Groups Product
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Product</p>
                        {['Features', 'Modules', 'Pricing', 'Changelog', 'Roadmap'].map(link => (
                            <p key={link} className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{link}</p>
                        ))}
                    </div>

                    {/* Modules */}
                    <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Modules</p>
                        {['Recruitment', 'Payroll', 'Attendance', 'Leave', 'Performance', 'Shifts'].map(link => (
                            <p key={link} className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{link}</p>
                        ))}
                    </div>

                    {/* Company */}
                    <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Company</p>
                        {['About Liji Groups', 'Contact', 'Privacy Policy', 'Terms of Service', 'Security'].map(link => (
                            <p key={link} className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{link}</p>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/5 max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-600">
                        Copyright &copy; {new Date().getFullYear()} Liji Groups. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600">
                        A part of <span className="text-gray-400 font-bold">LIJI GROUPS</span> project
                    </p>
                </div>
            </footer>
        </div>
    );
};
