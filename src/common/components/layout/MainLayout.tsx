import { useState } from 'react';
import { Sidebar } from './Sidebar/Sidebar';
import { TopBar } from './TopBar/TopBar';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
