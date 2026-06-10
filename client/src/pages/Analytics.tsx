import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService.js';
import type { FinancialAnalyticsReport } from '../services/analyticsService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { AlertCircle, TrendingUp, DollarSign, Wrench, Receipt } from 'lucide-react';

const Analytics: React.FC = () => {
  const [report, setReport] = useState<FinancialAnalyticsReport | null>(null);
  const [range, setRange] = useState<'30_days' | '90_days' | 'year_to_date'>('30_days');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchAnalytics = async (selectedRange: typeof range) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getFinancials(selectedRange);
      setReport(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load financial report details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const ranges = [
    { id: '30_days', label: 'Last 30 Days' },
    { id: '90_days', label: 'Last 90 Days' },
    { id: 'year_to_date', label: 'Year To Date' }
  ] as const;

  // Columns for staff rankings
  const techColumns: TableColumn<any>[] = [
    {
      key: 'name',
      header: 'Mechanic Name',
      render: (row) => <span className="font-semibold text-text">{row.name}</span>
    },
    {
      key: 'tickets_completed',
      header: 'Tickets Completed',
      render: (row) => <span className="font-mono">{row.tickets_completed}</span>
    },
    {
      key: 'labor_revenue',
      header: 'Labour Value (ZAR)',
      render: (row) => <span>ZAR {Number(row.labor_revenue).toFixed(2)}</span>
    },
    {
      key: 'parts_value',
      header: 'Parts Value (ZAR)',
      render: (row) => <span>ZAR {Number(row.parts_value).toFixed(2)}</span>
    },
    {
      key: 'total_value',
      header: 'Total Generated (ZAR)',
      render: (row) => (
        <span className="font-bold text-primary">
          ZAR {(Number(row.labor_revenue) + Number(row.parts_value)).toFixed(2)}
        </span>
      )
    }
  ];

  // Calculations for Donut Chart (SVG)
  const renderDonutChart = () => {
    if (!report || report.summary.gross_revenue === 0) return null;
    const { labor_revenue, parts_revenue } = report.summary;
    const total = labor_revenue + parts_revenue;
    if (total === 0) return null;

    const laborPct = (labor_revenue / total) * 100;
    const partsPct = (parts_revenue / total) * 100;

    // SVG parameters
    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Stroke dashes
    const laborDash = (laborPct / 100) * circumference;
    const partsDash = (partsPct / 100) * circumference;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
        {/* SVG Circle */}
        <div className="relative w-[180px] h-[180px]">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e8ddd2"
              strokeWidth={strokeWidth}
            />
            {/* Labor Circle (Teal) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#4a8c80"
              strokeWidth={strokeWidth}
              strokeDasharray={`${laborDash} ${circumference}`}
              strokeDashoffset={0}
              className="transition-all duration-500 ease-out"
            />
            {/* Parts Circle (Amber/Sand) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#c8922a"
              strokeWidth={strokeWidth}
              strokeDasharray={`${partsDash} ${circumference}`}
              strokeDashoffset={-laborDash}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Total Revenue</span>
            <span className="text-xl font-bold text-text mt-0.5">
              ZAR {Number(report.summary.gross_revenue - report.summary.vat_collected).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 font-sans text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#4a8c80] block"></span>
            <div>
              <p className="font-semibold text-text">Labour Charges ({laborPct.toFixed(0)}%)</p>
              <p className="text-xs text-text-muted">ZAR {Number(labor_revenue).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#c8922a] block"></span>
            <div>
              <p className="font-semibold text-text">Parts Billings ({partsPct.toFixed(0)}%)</p>
              <p className="text-xs text-text-muted">ZAR {Number(parts_revenue).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculations for bar charts (Vflex-bars)
  const renderBarChart = () => {
    if (!report || report.monthly_trends.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-sm italic text-text-muted">
          No historical monthly data recorded.
        </div>
      );
    }

    // Find max total to normalize heights
    const maxVal = Math.max(...report.monthly_trends.map(t => t.total), 1000);

    return (
      <div className="flex flex-col h-full justify-between font-sans">
        {/* Y Axis Grid lines */}
        <div className="flex-1 flex flex-col justify-between relative h-[180px] border-b border-border mb-3 pt-4">
          <div className="absolute inset-x-0 top-0 border-t border-border/40 text-[9px] text-text-muted/70 pt-0.5">ZAR {maxVal.toFixed(0)}</div>
          <div className="absolute inset-x-0 top-[33%] border-t border-border/40 text-[9px] text-text-muted/70 pt-0.5">ZAR {(maxVal * 0.66).toFixed(0)}</div>
          <div className="absolute inset-x-0 top-[66%] border-t border-border/40 text-[9px] text-text-muted/70 pt-0.5">ZAR {(maxVal * 0.33).toFixed(0)}</div>
          <div className="absolute inset-x-0 bottom-0 text-[9px] text-text-muted/70 pb-0.5">ZAR 0</div>

          {/* Bar Columns Container */}
          <div className="absolute inset-0 flex items-end justify-around px-8">
            {report.monthly_trends.slice().reverse().map((t, idx) => {
              const laborPct = (t.labor / maxVal) * 100;
              const partsPct = (t.parts / maxVal) * 100;

              return (
                <div key={t.month} className="flex flex-col items-center gap-1.5 w-16 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-200 z-10 bg-text text-white text-[10px] rounded p-2 shadow flex flex-col items-center pointer-events-none w-28 whitespace-nowrap">
                    <span>Labour: ZAR {t.labor.toFixed(0)}</span>
                    <span>Parts: ZAR {t.parts.toFixed(0)}</span>
                    <span className="font-bold border-t border-white/20 mt-1 pt-0.5">Total: ZAR {t.total.toFixed(0)}</span>
                  </div>

                  {/* Vertical Stacked Bars */}
                  <div className="w-7 bg-border rounded-t flex flex-col justify-end overflow-hidden h-[150px] shadow-sm group-hover:shadow transition-shadow">
                    {/* Parts (Amber) */}
                    <div 
                      className="bg-[#c8922a] w-full transition-all duration-500"
                      style={{ height: `${partsPct}%` }}
                    ></div>
                    {/* Labor (Teal) */}
                    <div 
                      className="bg-[#4a8c80] w-full transition-all duration-500"
                      style={{ height: `${laborPct}%` }}
                    ></div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                    {new Date(t.month + '-02').toLocaleDateString('en-ZA', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans text-text">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-4xl text-text">Financial Analytics</h1>
          <p className="text-text-muted text-sm mt-1 font-light">
            Monitor revenue stats, tax billing, and mechanic labor metrics
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex border border-border rounded-lg bg-surface p-1 shadow-sm gap-1 self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
                range === r.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Spinner size="lg" />
        </div>
      ) : error || !report ? (
        <div className="p-6 bg-error-bg border border-error text-error rounded-xl flex items-center gap-4 animate-fade-in">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-display font-medium text-xl">Error Loading Reports</h3>
            <p className="text-sm mt-0.5">{error || 'Data mapping failed.'}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => fetchAnalytics(range)}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Revenue Card */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Gross Revenue</p>
                <h3 className="text-2xl font-bold mt-0.5">ZAR {Number(report.summary.gross_revenue).toFixed(2)}</h3>
              </div>
            </div>

            {/* Labour Revenue Card */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#5a9e75]">
                <Wrench size={24} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Labour Split</p>
                <h3 className="text-2xl font-bold mt-0.5">ZAR {Number(report.summary.labor_revenue).toFixed(2)}</h3>
              </div>
            </div>

            {/* Parts Revenue Card */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-[#c8922a]">
                <Receipt size={24} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Parts Billed</p>
                <h3 className="text-2xl font-bold mt-0.5">ZAR {Number(report.summary.parts_revenue).toFixed(2)}</h3>
              </div>
            </div>

            {/* VAT Collected Card */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-500/10 flex items-center justify-center text-text-muted">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">VAT Collected (15%)</p>
                <h3 className="text-2xl font-bold mt-0.5">ZAR {Number(report.summary.vat_collected).toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-text uppercase tracking-wider">Monthly Earnings Trend</h3>
                <p className="text-xs text-text-muted mt-0.5">Monthly billing splits (Labour vs Parts) collected on paid invoices</p>
              </div>
              <div className="h-[210px] mt-2">
                {renderBarChart()}
              </div>
            </div>

            {/* Donut Splits Chart */}
            <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-text uppercase tracking-wider">Revenue Proportion</h3>
                <p className="text-xs text-text-muted mt-0.5">Sales contribution share (excluding VAT)</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                {report.summary.gross_revenue === 0 ? (
                  <p className="text-sm italic text-text-muted py-8">No billing records found in selected range.</p>
                ) : (
                  renderDonutChart()
                )}
              </div>
            </div>
          </div>

          {/* Technician Rankings Table */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-text uppercase tracking-wider">Technician Performance Rankings</h3>
              <p className="text-xs text-text-muted mt-0.5">Completed tickets count and associated labor value generated</p>
            </div>
            
            {report.technicians.length === 0 ? (
              <p className="text-sm text-center text-text-muted italic py-6">No completed mechanic records found.</p>
            ) : (
              <Table
                columns={techColumns}
                data={report.technicians}
                onRowClick={(row) => navigate('/staff')}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
