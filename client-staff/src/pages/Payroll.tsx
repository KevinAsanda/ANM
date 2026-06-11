import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { payrollService } from '../services/payrollService.js';
import type { Timesheet } from '../services/payrollService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { 
  Clock, 
  Play, 
  Square, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [logs, setLogs] = useState<Timesheet[]>([]);
  const [activeSession, setActiveSession] = useState<Timesheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timer state for active clock-in
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAdmin) {
        // Mechanic: fetch active session status and personal logs
        const [status, personalLogs] = await Promise.all([
          payrollService.getClockStatus(),
          payrollService.getPayrollSummary()
        ]);
        setActiveSession(status);
        setLogs(personalLogs);
      } else {
        // Admin: fetch all logs
        const allLogs = await payrollService.getPayrollSummary();
        setLogs(allLogs);
      }
    } catch (err: any) {
      console.error('Error fetching payroll data:', err);
      setError(err.message || 'Failed to load payroll details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live ticking timer effect for clocked-in sessions
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const clockInTime = new Date(activeSession.clock_in).getTime();
    
    // Set initial elapsed time
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - clockInTime) / 1000)));

    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - clockInTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleClockIn = async () => {
    setError(null);
    try {
      const newSession = await payrollService.clockIn();
      setActiveSession(newSession);
      fetchData(); // Refresh list to include new session
    } catch (err: any) {
      setError(err.message || 'Failed to clock in.');
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      await payrollService.clockOut();
      setActiveSession(null);
      fetchData(); // Refresh list to see finished log
    } catch (err: any) {
      setError(err.message || 'Failed to clock out.');
    }
  };

  const handleApprove = async (id: string) => {
    setError(null);
    try {
      await payrollService.approveTimesheet(id);
      fetchData(); // Refresh logs list
    } catch (err: any) {
      setError(err.message || 'Failed to approve timesheet.');
    }
  };

  // Helper to format seconds to HH:MM:SS
  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Admin summary metrics
  const totalHours = logs.reduce((sum, item) => sum + (item.hours_worked || 0), 0);
  const totalPayout = logs.reduce((sum, item) => sum + (item.total_pay || 0), 0);
  const pendingApprovals = logs.filter(item => item.clock_out !== null && item.status === 'submitted').length;

  const columns: TableColumn<Timesheet>[] = [
    ...(isAdmin ? [{
      key: 'staff_name' as keyof Timesheet,
      header: 'Technician',
      className: 'font-semibold text-text'
    }] : []),
    {
      key: 'clock_in',
      header: 'Clock In',
      render: (row) => new Date(row.clock_in).toLocaleString('en-ZA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      key: 'clock_out',
      header: 'Clock Out',
      render: (row) => row.clock_out ? new Date(row.clock_out).toLocaleString('en-ZA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : (
        <span className="text-emerald-600 font-semibold flex items-center gap-1.5 animate-pulse text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Active Session
        </span>
      )
    },
    {
      key: 'hours_worked',
      header: 'Hours',
      render: (row) => row.hours_worked !== null ? `${row.hours_worked.toFixed(2)} hrs` : '—'
    },
    {
      key: 'hourly_rate',
      header: 'Rate',
      render: (row) => `ZAR ${row.hourly_rate.toFixed(2)}`
    },
    {
      key: 'total_pay',
      header: 'Earned Pay',
      render: (row) => row.total_pay !== null ? `ZAR ${row.total_pay.toFixed(2)}` : '—',
      className: 'font-semibold text-text'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let badgeVariant: 'pending' | 'in_progress' | 'completed' = 'pending';
        if (row.status === 'approved') badgeVariant = 'in_progress';
        if (row.status === 'paid') badgeVariant = 'completed';
        return <Badge variant={badgeVariant}>{row.status}</Badge>;
      }
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof Timesheet,
      header: 'Action',
      render: (row: Timesheet) => (
        row.status === 'submitted' && row.clock_out !== null ? (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleApprove(row.id)}
            className="flex items-center gap-1 py-1 px-3 text-xs"
          >
            <CheckCircle size={12} />
            Approve
          </Button>
        ) : (
          <span className="text-text-muted text-xs font-light">Verified</span>
        )
      )
    }] : [])
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-4xl text-text">
            {isAdmin ? 'Payroll & Shift Management' : 'My Hours & Timesheets'}
          </h1>
          <p className="text-text-muted text-sm mt-1 font-light">
            {isAdmin 
              ? 'Oversee mechanic clock-ins, review hours logged, and approve shift payroll disbursements.'
              : 'Track your daily workshop shift hours, check your hourly earnings, and request admin payouts.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-bg border border-error text-error rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle size={20} />
          <p className="text-sm font-medium flex-1">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-auto p-1 text-error hover:bg-error/10">Dismiss</Button>
        </div>
      )}

      {/* Mechanic clock banner */}
      {!isAdmin && !isLoading && (
        <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${activeSession ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-secondary text-text-muted'}`}>
              <Clock size={32} />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg text-text">
                {activeSession ? 'Shift is Active' : 'You are Clocked Out'}
              </h3>
              <p className="text-sm text-text-muted mt-0.5">
                {activeSession 
                  ? `Clocked in today at ${new Date(activeSession.clock_in).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Start your shift tracker when you enter the workshop.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            {activeSession && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Elapsed Time</span>
                <span className="font-display font-medium text-2xl text-text tabular-nums">{formatDuration(elapsedSeconds)}</span>
              </div>
            )}

            {activeSession ? (
              <Button 
                variant="danger" 
                onClick={handleClockOut}
                className="gap-2 px-6 py-3"
              >
                <Square size={16} />
                End Shift (Clock Out)
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleClockIn}
                className="gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700"
              >
                <Play size={16} />
                Start Shift (Clock In)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Admin stats dashboard */}
      {isAdmin && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Total Hours Logged</span>
              <h3 className="font-display font-semibold text-2xl text-text mt-1">{totalHours.toFixed(1)} hrs</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Calendar size={22} />
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Total Payroll Accrued</span>
              <h3 className="font-display font-semibold text-2xl text-text mt-1">ZAR {totalPayout.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Pending Approvals</span>
              <h3 className="font-display font-semibold text-2xl text-text mt-1">{pendingApprovals} shifts</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileSpreadsheet size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Timesheet List Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border/60 bg-surface flex justify-between items-center">
          <h3 className="font-display font-medium text-lg text-text">Timesheet Audit Log</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Spinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center gap-4">
            <div className="p-4 bg-background/50 rounded-full text-text-muted">
              <Clock size={36} />
            </div>
            <h4 className="font-display font-medium text-lg text-text">No shifts logged yet</h4>
            <p className="text-text-muted text-sm max-w-sm">
              {isAdmin 
                ? 'No mechanic shift logs have been registered in the database.' 
                : 'Your daily clock logs will appear here once you start and end a shift.'}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={logs}
          />
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
