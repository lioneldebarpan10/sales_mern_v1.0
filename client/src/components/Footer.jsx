import React from 'react';

const Footer = () => {
    return (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-6 px-4 md:px-8 rounded-2xl mt-12 flex flex-col md:flex-row justify-between items-center text-sm shadow-xl shadow-indigo-200/20 transition-all hover:shadow-2xl">
            <div className="mb-4 md:mb-0 text-center md:text-left">
                <p className="text-gray-300 font-medium">
                    Copyright © 2026 <span className="font-bold text-indigo-400">SalesiFy</span>. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1 md:text-left text-center">
                    Made with ❤️ by Debarpan Deb
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-medium">
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 relative group">
                    Contact Us
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 relative group">
                    Privacy Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 relative group">
                    Trademark Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
                </a>
            </div>
        </div>
    );
};

export default Footer;
