import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { dashboardService } from '../services/dashboardService.js';
import type { DashboardStats } from '../services/dashboardService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import type { InventoryItem } from '../services/inventoryService.js';
import { StatsCard } from '../components/ui/StatsCard.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Badge } from '../components/ui/Badge.js';
import type { BadgeVariant } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { 
  Wrench, 
  CheckCircle2, 
  Users, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Package,
  Check
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketRelation[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, ticketsData, stockData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentTickets(),
        dashboardService.getLowStockItems()
      ]);
      setStats(statsData);
      setRecentTickets(ticketsData);
      setLowStockItems(stockData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const ticketColumns: TableColumn<TicketRelation>[] = [
    {
      key: 'registration_number',
      header: 'Vehicle Reg',
      render: (row) => row.vehicle?.registration_number || 'N/A'
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customer?.name || 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'in_progress' ? 'in_progress' : row.status as BadgeVariant}>
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => new Date(row.created_at).toLocaleDateString('en-ZA', {
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Loading workshop overview...</p>
        </div>
        {/* Stats Row Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface p-6 rounded-lg border border-border h-24 flex items-center gap-4">
              <div className="p-3 bg-slate-200 rounded-lg w-12 h-12" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="bg-slate-200 h-4 rounded w-2/3" />
                <div className="bg-slate-200 h-6 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
        {/* Main Content Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 bg-surface p-6 rounded-lg border border-border h-[350px] flex flex-col gap-4">
            <div className="bg-slate-200 h-6 rounded w-1/4" />
            <div className="bg-slate-200 h-10 rounded w-full" />
            <div className="bg-slate-200 h-10 rounded w-full" />
            <div className="bg-slate-200 h-10 rounded w-full" />
          </div>
          <div className="bg-surface p-6 rounded-lg border border-border h-[350px] flex flex-col gap-4">
            <div className="bg-slate-200 h-6 rounded w-1/3" />
            <div className="bg-slate-200 h-12 rounded w-full" />
            <div className="bg-slate-200 h-12 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto mt-8">
        <div className="p-6 bg-error-bg border border-error text-error rounded-lg flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h3 className="font-bold text-lg">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm">{error}</p>
          <Button variant="danger" size="sm" onClick={fetchDashboardData} className="self-start">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back, {user?.name}! Here is the workshop status for today.</p>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={<Wrench size={24} />}
            label="Active Jobs"
            value={stats.active_jobs}
            iconBgColor="bg-blue-50 text-blue-600"
          />
          <StatsCard
            icon={<CheckCircle2 size={24} />}
            label="Completed Today"
            value={stats.completed_today}
            iconBgColor="bg-green-50 text-green-600"
          />
          <StatsCard
            icon={<Users size={24} />}
            label="Total Mechanics"
            value={stats.total_mechanics}
            iconBgColor="bg-purple-50 text-purple-600"
          />
          <StatsCard
            icon={<AlertTriangle size={24} />}
            label="Low Stock Alert"
            value={stats.low_stock_count}
            iconBgColor={stats.low_stock_count > 0 ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-slate-50 text-slate-400"}
          />
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Recent Tickets */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" />
              Recent Service Tickets
            </h2>
            <button
              onClick={() => navigate('/tickets')}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
              <p className="text-text-muted italic text-sm">No service tickets have been registered in the system yet.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/tickets/new')}>
                Create First Ticket
              </Button>
            </div>
          ) : (
            <Table
              columns={ticketColumns}
              data={recentTickets}
              onRowClick={(row) => navigate(`/tickets/${row.id}`)}
            />
          )}
        </div>

        {/* Right column - Low Stock Alerts */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Package size={20} className="text-primary-600" />
              Low Stock Alerts
            </h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              Manage <ArrowRight size={14} />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Check size={28} />
              </div>
              <h3 className="font-bold text-text text-sm">All Inventory Healthy</h3>
              <p className="text-text-muted text-xs px-4">There are no items currently running below their defined reorder levels.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text truncate">{item.part_name}</p>
                    <p className="text-xs text-text-muted mt-0.5">Part #: {item.part_number || 'N/A'}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                      {item.qty_in_stock} remaining
                    </span>
                    <p className="text-[10px] text-text-muted mt-1">Reorder level: {item.reorder_level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
