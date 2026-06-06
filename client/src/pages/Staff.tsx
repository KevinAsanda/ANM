import React, { useState, useEffect } from 'react';
import { staffService } from '../services/staffService.js';
import type { Staff } from '../services/staffService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Modal } from '../components/ui/Modal.js';
import { AddMechanicForm } from '../components/staff/AddMechanicForm.js';
import { Users, PlusCircle, AlertCircle } from 'lucide-react';

const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await staffService.getStaff();
      setStaffList(data);
    } catch (err: any) {
      console.error('Error fetching staff directory:', err);
      setError(err.message || 'Failed to load staff records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchStaff();
  };

  const columns: TableColumn<Staff>[] = [
    {
      key: 'name',
      header: 'Full Name',
      className: 'font-semibold text-text'
    },
    {
      key: 'email',
      header: 'Email Address'
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'admin' ? 'in_progress' : 'pending'}>
          {row.role}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Date Added',
      render: (row) => new Date(row.created_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Staff Directory</h1>
          <p className="text-text-muted text-sm mt-1">Manage workshop administration staff and mechanics accounts</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="gap-2">
          <PlusCircle size={20} />
          Add Mechanic
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-6 bg-error-bg border border-error text-error rounded-lg flex items-center gap-4">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-lg">Error Loading Staff</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={fetchStaff}>
            Try Again
          </Button>
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-lg gap-4">
          <div className="p-4 bg-slate-100 rounded-full text-slate-400">
            <Users size={40} />
          </div>
          <h3 className="text-lg font-bold text-text">No staff records found</h3>
          <p className="text-text-muted text-sm max-w-sm">Create accounts for mechanics so they can be assigned service tickets.</p>
          <Button variant="primary" onClick={handleOpenAddModal}>
            Register Staff Member
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          data={staffList}
        />
      )}

      {/* Add Mechanic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Mechanic Account"
      >
        <AddMechanicForm
          onSuccess={handleModalSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default StaffPage;
