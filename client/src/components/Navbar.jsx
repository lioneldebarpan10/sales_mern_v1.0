import React, { useEffect, useState } from 'react';
import { Menu, X, TrendingUp, Moon, Sun } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen, theme, toggleTheme }) => {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const [isMobileScreen, setIsMobileScreen] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 1023px)');
        setIsMobileScreen(mediaQuery.matches);

        const handleResize = (event) => setIsMobileScreen(event.matches);
        mediaQuery.addEventListener('change', handleResize);

        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

    const handleSidebarToggle = () => {
        if (isMobileScreen) {
            setIsMobileMenuOpen(prev => !prev);
        } else {
            toggleSidebar();
        }
    };

    const sidebarIcon = isMobileScreen
        ? (isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />)
        : (isSidebarOpen ? <X size={20} /> : <Menu size={20} />);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300"
            style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSidebarToggle}
                    className="p-2.5 rounded-xl transition-all cursor-pointer"
                    style={{ background: 'var(--primary-gradient)', color: '#fff' }}
                    aria-label="Toggle Sidebar"
                >
                    {sidebarIcon}
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-gradient)' }}>
                        <TrendingUp size={16} color="#fff" />
                    </div>
                    <span className="text-lg font-bold tracking-tight hidden sm:inline" style={{ background: 'var(--primary-text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SalesiFy
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl transition-all cursor-pointer"
                    style={{ background: 'var(--surface-alt)', color: 'var(--text)' }}
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
