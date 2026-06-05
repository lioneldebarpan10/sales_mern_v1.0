import React from 'react';
import { LayoutDashboard, UserPlus, Users, CreditCard, FileText, LogOut, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, onOpenReportModal }) => {
    const [activeRoute, setActiveRoute] = React.useState("Dashboard");
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { isSidebarOpen } = useSidebar();

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
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden pt-16"
                    style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-16 left-0 h-[calc(100vh-64px)] w-72 flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
                `}
                style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
            >
                {/* Section label */}
                <div className="px-6 pt-6 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Main Menu</p>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-0 py-2 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = activeRoute === item.name;
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleNavigation(item.path, item.name)}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            {/* Active left bar */}
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r-full"
                                    style={{ background: 'var(--primary-gradient)' }}
                                />
                            )}

                            <span
                                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200"
                                style={isActive
                                    ? { background: 'var(--primary-gradient)', color: '#fff', boxShadow: '0 4px 12px var(--primary-light)' }
                                    : { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }
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
            <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                    onClick={onOpenReportModal}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{ background: 'var(--primary-gradient)', color: '#fff', boxShadow: '0 4px 16px var(--primary-light)' }}
                >
                    <FileText size={16} />
                    Generate Report
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{ background: 'var(--surface-alt)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.12)'; e.currentTarget.style.color='#fda4af'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--surface-alt)'; e.currentTarget.style.color='var(--muted)'; }}
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
