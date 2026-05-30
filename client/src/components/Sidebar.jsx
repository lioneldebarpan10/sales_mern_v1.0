import React, { useState } from 'react';
import { LayoutDashboard, UserPlus, Users, CreditCard, FileText, Menu, X, LogOut, ChevronLeft, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const [activeRoute, setActiveRoute] = React.useState("Dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    React.useEffect(() => {
        const path = location.pathname;
        const activeItem = menuItems.find(item => item.path === path);
        if (activeItem) {
            setActiveRoute(activeItem.name);
        } else if (path === '/') {
            setActiveRoute('Dashboard');
        }
    }, [location]);

    const menuItems = [
        { name: "Dashboard",       icon: <LayoutDashboard size={18} />, id: "dashboard",        path: "/" },
        { name: "Add Substockist", icon: <UserPlus size={18} />,        id: "add-substockist",  path: "/add-substockist" },
        { name: "View Substockist",icon: <Users size={18} />,           id: "view-substockist", path: "/view-substockist" },
        { name: "Generate Payment",icon: <CreditCard size={18} />,      id: "generate-payment", path: "/generate-payment" },
        { name: "Payment History", icon: <TrendingUp size={18} />,      id: "payment-history",  path: "/payment-history" },
    ];

    const handleNavigation = (path, name) => {
        setActiveRoute(name);
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Desktop open-button shown when sidebar is collapsed */}
            {!isSidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex fixed top-5 left-5 z-50 p-2.5 rounded-xl shadow-lg transition-all items-center justify-center cursor-pointer"
                    style={{ 
                        background: '#1e293b', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        color: '#f1f5f9', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.background = '#273549'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#1e293b'; }}
                    aria-label="Open Sidebar"
                >
                    <Menu size={18} />
                </button>
            )}

            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2.5 rounded-xl shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' }}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-screen w-72 flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
                `}
                style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Logo area */}
                <div className="flex items-center justify-between px-6 h-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                            <TrendingUp size={16} color="#fff" />
                        </div>
                        <span className="text-xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            SalesiFy
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: '#64748b' }}
                        onMouseEnter={e => e.currentTarget.style.color='#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.color='#64748b'}
                        aria-label="Collapse Sidebar"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                {/* Section label */}
                <div className="px-6 pt-6 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#334155' }}>Main Menu</p>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-0 py-2 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = activeRoute === item.name;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleNavigation(item.path, item.name)}
                                className="sidebar-link"
                                style={isActive ? {
                                    background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(124,58,237,0.18))',
                                    color: '#e0e7ff',
                                    fontWeight: 600,
                                } : {}}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r-full"
                                        style={{ background: 'linear-gradient(180deg,#818cf8,#a78bfa)' }}
                                    />
                                )}

                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200"
                                    style={isActive
                                        ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }
                                        : { background: 'rgba(255,255,255,0.05)', color: '#64748b' }
                                    }
                                >
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.35)' }}
                    >
                        <FileText size={16} />
                        Generate Report
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.12)'; e.currentTarget.style.color='#fda4af'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#94a3b8'; }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
