import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService.js';
import type { InventoryItem } from '../services/inventoryService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Modal } from '../components/ui/Modal.js';
import { PartForm } from '../components/inventory/PartForm.js';
import { ClipboardList, PlusCircle, AlertCircle, Edit2 } from 'lucide-react';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedPart(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (part: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click triggers
    setSelectedPart(part);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchInventory();
  };

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: 'part_name',
      header: 'Part Name'
    },
    {
      key: 'part_number',
      header: 'Part Number',
      render: (row) => row.part_number || 'N/A'
    },
    {
      key: 'qty_in_stock',
      header: 'Qty in Stock',
      render: (row) => (
        <span className={row.qty_in_stock <= row.reorder_level ? 'text-error font-bold' : ''}>
          {row.qty_in_stock}
        </span>
      )
    },
    {
      key: 'reorder_level',
      header: 'Reorder Level'
    },
    {
      key: 'unit_cost',
      header: 'Unit Cost',
      render: (row) => row.unit_cost !== null ? `R ${row.unit_cost.toFixed(2)}` : 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const isLow = row.qty_in_stock <= row.reorder_level;
        return isLow ? (
          <Badge variant="low_stock">Low Stock</Badge>
        ) : (
          <span className="text-success text-[0.7rem] font-semibold uppercase tracking-widest">OK</span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleOpenEditModal(row, e)}
          className="p-1 hover:bg-background rounded-xl text-text-muted hover:text-text"
          aria-label={`Edit ${row.part_name}`}
        >
          <Edit2 size={16} />
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-4xl text-text">Inventory</h1>
          <p className="text-text-muted text-sm mt-1 font-light">Manage workshop spare parts, stock counts, and reorder alerts</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal} className="gap-2 self-start sm:self-auto">
          <PlusCircle size={18} />
          Add Part
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 animate-fade-in">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-6 bg-error-bg border border-error text-error rounded-xl flex items-center gap-4 animate-fade-in">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-display font-medium text-xl">Error Loading Inventory</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={fetchInventory}>
            Try Again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No parts in inventory yet"
          description="Register spare parts in the system so mechanics can log them against job cards."
          icon={<ClipboardList size={40} />}
          action={{
            label: 'Add First Part',
            onClick: handleOpenAddModal
          }}
        />
      ) : (
        <Table
          columns={columns}
          data={items}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPart ? 'Edit Part' : 'Add New Part'}
      >
        <PartForm
          part={selectedPart}
          onSuccess={handleModalSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Inventory;
