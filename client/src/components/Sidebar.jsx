import React, { useState } from 'react';
import { LayoutDashboard, UserPlus, Users, CreditCard, Home, Mail, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const [activeRoute, setActiveRoute] = React.useState("Dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sync active route with location on load/change
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
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, id: "dashboard", path: "/" },
        { name: "Add Substockist", icon: <UserPlus size={20} />, id: "add-substockist", path: "/add-substockist" },
        { name: "View Substockist", icon: <Users size={20} />, id: "view-substockist", path: "/view-substockist" },
        { name: "Generate Payment", icon: <CreditCard size={20} />, id: "generate-payment", path: "/generate-payment" },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigation = (path, name) => {
        setActiveRoute(name);
        navigate(path);
        setIsMobileMenuOpen(false); // Close menu on selection for mobile
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-indigo-500 text-white rounded-lg shadow-lg hover:bg-indigo-600 transition-colors"
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed lg:sticky top-0 h-screen w-72 bg-white flex flex-col font-sans border-r border-gray-100 flex-shrink-0 z-50 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-center h-24 border-b border-gray-100/50">
                    <h1 className="text-2xl font-bold uppercase text-gray-700">
                        SalesiFy
                    </h1>
                </div>

                <hr className='border-gray-400' />

                {/* Menu Items */}
                <div className="flex flex-col py-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = activeRoute === item.name;

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleNavigation(item.path, item.name)}
                                className={`relative flex items-center py-3 px-8 cursor-pointer group transition-all duration-200
                                    ${isActive ? 'bg-indigo-50/50' : 'hover:bg-indigo-50/30'}`} // Added hover background
                            >
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-1 bg-indigo-500 rounded-l-lg" />
                                )}

                                {/* Icon */}
                                <span
                                    className={`mr-4 transition-colors duration-200 ${isActive
                                        ? 'text-indigo-500'
                                        : 'text-indigo-300 group-hover:text-indigo-400'
                                        }`}
                                >
                                    {item.icon}
                                </span>

                                {/* Text */}
                                <span
                                    className={`text-sm font-medium transition-colors duration-200 ${isActive
                                        ? 'text-navy-700 font-bold text-gray-800'
                                        : 'text-gray-600 group-hover:text-gray-900'
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Generate Report Button */}
                <div className="mx-auto mb-6 mt-auto">
                    <button
                        className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Mail size={20} />
                        <span className="font-medium text-sm cursor-pointer">Generate Report</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
