import { Inbox } from 'lucide-react';
import type { ElementType } from 'react';

interface EmptyStateProps {
    icon?: ElementType;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState = ({
    icon: Icon = Inbox,
    title,
    description,
    action,
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-5 py-20 px-8">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                <Icon className="w-7 h-7 text-gray-300" />
            </div>
            <div className="text-center space-y-1.5">
                <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.18em]">{title}</p>
                {description && (
                    <p className="text-[10px] font-medium text-gray-400 max-w-xs leading-relaxed">{description}</p>
                )}
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-red-700 hover:to-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
