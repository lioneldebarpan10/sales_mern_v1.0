import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Hash, User, Download, Eye, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import jsPDF from 'jspdf';

const Field = ({ label, icon, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
            {label}<span style={{ color: '#f43f5e' }}>*</span>
        </label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#64748b' }}>{icon}</span>
            {children}
        </div>
    </div>
);

const inputCls = 'w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-200 outline-none';
const inputBase = { border: '1.5px solid var(--input-border)', background: 'var(--surface-alt)', color: 'var(--text)', fontFamily: 'Inter,sans-serif' };
const focusOn = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; };
const focusOff = e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; };

const hideScrollbarStyle = `
    .modal-no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .modal-no-scrollbar::-webkit-scrollbar {
        display: none;
    }
`;

const GenerateReport = ({ isOpen, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const [substockistId, setSubstockistId] = useState('');
    const [substockistName, setSubstockistName] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [customDate, setCustomDate] = useState(today);
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [idFound, setIdFound] = useState(false);
    const dropdownRef = useRef(null);

    // Search substockists
    useEffect(() => {
        const timer = setTimeout(async () => {
            const searchTerm = substockistId.trim();
            if (!searchTerm) {
                setSearchResults([]);
                setShowDropdown(false);
                setIdFound(false);
                setSubstockistName('');
                return;
            }

            setSearchLoading(true);
            try {
                const res = await api.get('/api/substockist', { params: { search: searchTerm } });
                setSearchResults(res.data.data || []);
                setShowDropdown(true);
            } catch (err) {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [substockistId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectSubstockist = (substockist) => {
        const fullName = `${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`.trim();
        setSubstockistId(substockist.substockistId);
        setSubstockistName(fullName);
        setIdFound(true);
        setShowDropdown(false);
        setSearchResults([]);
    };

    const generateReport = async () => {
        if (!idFound) {
            toast.error('Please select a valid substockist');
            return;
        }

        setReportLoading(true);
        try {
            const now = new Date(customDate);
            let fromDate, toDate;

            switch (selectedPeriod) {
                case 'daily':
                    fromDate = new Date(now);
                    toDate = new Date(now);
                    toDate.setHours(23, 59, 59, 999);
                    break;
                case 'weekly':
                    const dayOfWeek = now.getDay();
                    fromDate = new Date(now);
                    fromDate.setDate(now.getDate() - dayOfWeek);
                    toDate = new Date(fromDate);
                    toDate.setDate(fromDate.getDate() + 6);
                    toDate.setHours(23, 59, 59, 999);
                    break;
                case 'monthly':
                    fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    toDate.setHours(23, 59, 59, 999);
                    break;
                case 'yearly':
                    fromDate = new Date(now.getFullYear(), 0, 1);
                    toDate = new Date(now.getFullYear(), 11, 31);
                    toDate.setHours(23, 59, 59, 999);
                    break;
                default:
                    return;
            }

            const res = await api.get(`/api/substockist/${substockistId}`, {
                params: {
                    from: fromDate.toISOString(),
                    to: toDate.toISOString(),
                    period: selectedPeriod
                }
            });

            setReportData(res.data);
            toast.success('Report generated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate report');
            setReportData(null);
        } finally {
            setReportLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!reportData) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
            let yPosition = 15;

            // ===== HEADER SECTION =====
            // Company name / Logo area
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text('SalesFy', margin, yPosition);
            yPosition += 10;

            // Decorative line
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;

            // Report title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text('PAYMENT HISTORY REPORT', margin, yPosition);
            yPosition += 8;

            // ===== INFO SECTION =====
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(80, 80, 80);
            
            const infoCol1 = margin;
            const infoCol2 = pageWidth / 2;
            
            doc.setFont(undefined, 'bold');
            doc.text('Substockist Details:', infoCol1, yPosition);
            doc.text('Report Information:', infoCol2, yPosition);
            yPosition += 6;

            doc.setFont(undefined, 'normal');
            doc.text(`Name: ${substockistName}`, infoCol1, yPosition);
            const reportDate = new Date().toLocaleDateString('en-IN');
            doc.text(`Generated: ${reportDate}`, infoCol2, yPosition);
            yPosition += 5;

            doc.text(`ID: ${substockistId}`, infoCol1, yPosition);
            doc.text(`Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`, infoCol2, yPosition);
            yPosition += 10;

            // ===== SUMMARY CARDS =====
            const cardWidth = (contentWidth - 6) / 3;
            const cardHeight = 18;
            const summary = reportData.summary || { total: 0, paid: 0, due: 0 };
            
            const cards = [
                { label: 'Total Amount', value: summary.total, bgColor: [59, 130, 246], position: 0 },
                { label: 'Paid Amount', value: summary.paid, bgColor: [34, 197, 94], position: 1 },
                { label: 'Due Amount', value: summary.due, bgColor: [239, 68, 68], position: 2 }
            ];

            cards.forEach(card => {
                const xPos = margin + card.position * (cardWidth + 3);
                
                // Card background
                doc.setFillColor(...card.bgColor);
                doc.rect(xPos, yPosition, cardWidth, cardHeight, 'F');
                
                // Card label
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(255, 255, 255);
                doc.text(card.label, xPos + 3, yPosition + 5);
                
                // Card value
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(`Rs. ${card.value.toFixed(2)}`, xPos + 3, yPosition + 13);
            });
            
            yPosition += cardHeight + 10;

            // ===== DIVIDER =====
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;

            // ===== PAYMENT HISTORY TABLE =====
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text('Transaction Details', margin, yPosition);
            yPosition += 7;

            // Table header
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setFillColor(59, 130, 246);
            doc.setTextColor(255, 255, 255);
            
            const colWidths = { date: 35, total: 38, paid: 38, due: 38 };
            const headerHeight = 6;
            
            doc.rect(margin, yPosition, colWidths.date, headerHeight, 'F');
            doc.rect(margin + colWidths.date, yPosition, colWidths.total, headerHeight, 'F');
            doc.rect(margin + colWidths.date + colWidths.total, yPosition, colWidths.paid, headerHeight, 'F');
            doc.rect(margin + colWidths.date + colWidths.total + colWidths.paid, yPosition, colWidths.due, headerHeight, 'F');
            
            doc.text('Date', margin + 2, yPosition + 4);
            doc.text('Total', margin + colWidths.date + 2, yPosition + 4);
            doc.text('Paid', margin + colWidths.date + colWidths.total + 2, yPosition + 4);
            doc.text('Due', margin + colWidths.date + colWidths.total + colWidths.paid + 2, yPosition + 4);
            
            yPosition += headerHeight + 2;

            // Table data
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            
            let rowCount = 0;
            const rowHeight = 5;

            if (reportData.paymentDetails && reportData.paymentDetails.length > 0) {
                reportData.paymentDetails.forEach((payment, index) => {
                    // Check if we need a new page
                    if (yPosition > pageHeight - 25) {
                        doc.addPage();
                        yPosition = margin;
                        
                        // Repeat header on new page
                        doc.setFontSize(9);
                        doc.setFont(undefined, 'bold');
                        doc.setFillColor(59, 130, 246);
                        doc.setTextColor(255, 255, 255);
                        
                        doc.rect(margin, yPosition, colWidths.date, headerHeight, 'F');
                        doc.rect(margin + colWidths.date, yPosition, colWidths.total, headerHeight, 'F');
                        doc.rect(margin + colWidths.date + colWidths.total, yPosition, colWidths.paid, headerHeight, 'F');
                        doc.rect(margin + colWidths.date + colWidths.total + colWidths.paid, yPosition, colWidths.due, headerHeight, 'F');
                        
                        doc.text('Date', margin + 2, yPosition + 4);
                        doc.text('Total', margin + colWidths.date + 2, yPosition + 4);
                        doc.text('Paid', margin + colWidths.date + colWidths.total + 2, yPosition + 4);
                        doc.text('Due', margin + colWidths.date + colWidths.total + colWidths.paid + 2, yPosition + 4);
                        
                        yPosition += headerHeight + 2;
                        doc.setFontSize(8);
                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(0, 0, 0);
                    }

                    const date = new Date(payment.paymentDate);
                    const dateStr = date.toLocaleDateString('en-IN');
                    
                    // Alternate row background
                    if (index % 2 === 0) {
                        doc.setFillColor(245, 247, 250);
                        doc.rect(margin, yPosition - 1.5, contentWidth, rowHeight + 1, 'F');
                    }
                    
                    // Cell borders
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.1);
                    doc.rect(margin, yPosition - 1.5, colWidths.date, rowHeight + 1);
                    doc.rect(margin + colWidths.date, yPosition - 1.5, colWidths.total, rowHeight + 1);
                    doc.rect(margin + colWidths.date + colWidths.total, yPosition - 1.5, colWidths.paid, rowHeight + 1);
                    doc.rect(margin + colWidths.date + colWidths.total + colWidths.paid, yPosition - 1.5, colWidths.due, rowHeight + 1);

                    doc.setTextColor(0, 0, 0);
                    doc.text(dateStr, margin + 2, yPosition + 1.5);
                    doc.text(`Rs. ${payment.totalAmount.toFixed(2)}`, margin + colWidths.date + 2, yPosition + 1.5);
                    doc.text(`Rs. ${payment.paidAmount.toFixed(2)}`, margin + colWidths.date + colWidths.total + 2, yPosition + 1.5);
                    
                    const dueText = `Rs. ${payment.dueAmount.toFixed(2)}`;
                    if (payment.dueAmount > 0) {
                        doc.setTextColor(220, 38, 38);
                    }
                    doc.text(dueText, margin + colWidths.date + colWidths.total + colWidths.paid + 2, yPosition + 1.5);
                    doc.setTextColor(0, 0, 0);
                    
                    yPosition += rowHeight + 1;
                });
            } else {
                doc.setTextColor(100, 100, 100);
                doc.setFont(undefined, 'normal');
                doc.text('No payment records found for the selected period.', margin + 2, yPosition + 5);
                yPosition += 10;
            }

            // ===== FOOTER =====
            const footerY = pageHeight - 12;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, footerY, pageWidth - margin, footerY);

            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(120, 120, 120);
            
            doc.text('This is an auto-generated payment report. For official use only.', margin, footerY + 5);
            doc.text(`Generated on ${reportDate} | Page 1`, pageWidth - margin - 30, footerY + 5);
            
            // Copyright
            doc.text('© 2026 SalesFy. All rights reserved.', pageWidth / 2, pageHeight - 4, { align: 'center' });

            // Download
            const filename = `${substockistName}_${selectedPeriod}_${new Date().getTime()}.pdf`;
            doc.save(filename);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to download PDF');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <style>{hideScrollbarStyle}</style>
            <div className="modal-no-scrollbar" style={{
                background: 'var(--surface)',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid var(--border)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Generate Report</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Generate payment history report for a substockist</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '8px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        {/* Substockist ID */}
                        <Field label="Substockist ID" icon={<Hash size={16} />}>
                            <input
                                type="text"
                                value={substockistId}
                                onChange={(e) => {
                                    setSubstockistId(e.target.value);
                                    setIdFound(false);
                                    setSubstockistName('');
                                }}
                                placeholder="Enter ID or name"
                                className={inputCls}
                                style={inputBase}
                                onFocus={focusOn}
                                onBlur={focusOff}
                                autoComplete="off"
                            />
                            {/* Search Results Dropdown */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border"
                                    style={{
                                        background: 'var(--surface-alt)',
                                        borderColor: 'var(--input-border)',
                                        maxHeight: '250px',
                                        overflow: 'auto',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {searchLoading ? (
                                        <div className="p-3 text-center text-sm" style={{ color: '#64748b' }}>
                                            <span className="inline-block animate-spin">⟳</span> Searching...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((substockist, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => selectSubstockist(substockist)}
                                                style={{
                                                    padding: '12px',
                                                    cursor: 'pointer',
                                                    borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(var(--primary-rgb),0.1)'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text)' }}>
                                                    {substockist.firstName} {substockist.middleName ? substockist.middleName + ' ' : ''}{substockist.lastName}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    ID: {substockist.substockistId}
                                                </div>
                                            </div>
                                        ))
                                    ) : substockistId.trim() ? (
                                        <div className="p-3 text-center text-sm" style={{ color: '#64748b' }}>
                                            No results found
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </Field>

                        {/* Substockist Name (auto-filled) */}
                        <Field label="Substockist Name" icon={<User size={16} />}>
                            <input
                                type="text"
                                value={substockistName}
                                readOnly
                                placeholder="Auto-filled from ID"
                                className={inputCls}
                                style={{ ...inputBase, background: idFound ? 'rgba(16,185,129,0.1)' : 'var(--surface-alt)', cursor: 'not-allowed' }}
                            />
                        </Field>
                    </div>

                    {/* Period Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', color: '#94a3b8' }}>
                            Report Period <span style={{ color: '#f43f5e' }}>*</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1.5px solid',
                                        borderColor: selectedPeriod === period ? 'var(--primary)' : 'var(--input-border)',
                                        background: selectedPeriod === period ? 'rgba(var(--primary-rgb),0.1)' : 'var(--surface-alt)',
                                        color: 'var(--text)',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <Field label={`Select ${selectedPeriod}`} icon={<Calendar size={16} />}>
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className={inputCls}
                                style={inputBase}
                                onFocus={focusOn}
                                onBlur={focusOff}
                            />
                        </Field>
                    </div>

                    {/* Generate Button */}
                    <div style={{ marginBottom: '24px' }}>
                        <button
                            onClick={generateReport}
                            disabled={reportLoading || !idFound}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: reportLoading || !idFound ? 'var(--primary-light)' : 'var(--primary-gradient)',
                                color: 'white',
                                fontWeight: 600,
                                cursor: reportLoading || !idFound ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {reportLoading ? (
                                <><span className="animate-spin">⟳</span> Generating...</>
                            ) : (
                                <><Filter size={18} /> Generate Report</>
                            )}
                        </button>
                    </div>

                    {/* Report Preview */}
                    {reportData && (
                        <div style={{
                            background: 'var(--surface-alt)',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid var(--border)'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                                📊 Report Preview
                            </h3>

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>Total Amount</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
                                        ₹{reportData.summary?.total?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>Paid Amount</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                                        ₹{reportData.summary?.paid?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>Due Amount</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f43f5e' }}>
                                        ₹{reportData.summary?.due?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>

                            {/* Payment History Table */}
                            <div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                                    Payment History
                                </h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Date</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Total</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Paid</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.paymentDetails && reportData.paymentDetails.length > 0 ? (
                                                reportData.paymentDetails.map((payment, idx) => {
                                                    const date = new Date(payment.paymentDate);
                                                    const dateStr = date.toLocaleDateString('en-IN');
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '12px', color: 'var(--text)' }}>{dateStr}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text)' }}>₹{payment.totalAmount.toFixed(2)}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: 500 }}>₹{payment.paidAmount.toFixed(2)}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right', color: '#f43f5e', fontWeight: 500 }}>₹{payment.dueAmount.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                        No payment records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid var(--input-border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        Close
                    </button>
                    {reportData && (
                        <button
                            onClick={downloadPDF}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary-gradient)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Download size={16} /> Download PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateReport;
