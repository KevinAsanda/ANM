import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService.js';
import type { InventoryItem } from '../../services/inventoryService.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { AlertCircle } from 'lucide-react';

interface PartFormProps {
  part?: InventoryItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PartForm: React.FC<PartFormProps> = ({ part, onSuccess, onCancel }) => {
  const isEditMode = !!part;

  // Form Fields
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [qtyInStock, setQtyInStock] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [unitCost, setUnitCost] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if in edit mode
  useEffect(() => {
    if (part) {
      setPartName(part.part_name);
      setPartNumber(part.part_number || '');
      setQtyInStock(part.qty_in_stock.toString());
      setReorderLevel(part.reorder_level.toString());
      setUnitCost(part.unit_cost !== null ? part.unit_cost.toString() : '');
    } else {
      setPartName('');
      setPartNumber('');
      setQtyInStock('0');
      setReorderLevel('5');
      setUnitCost('');
    }
    setErrors({});
    setSubmitError(null);
  }, [part]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!partName.trim()) newErrors.partName = 'Part name is required';
    
    const qty = Number(qtyInStock);
    if (qtyInStock === '' || isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
      newErrors.qtyInStock = 'Quantity must be a positive integer';
    }

    const reorder = Number(reorderLevel);
    if (reorderLevel === '' || isNaN(reorder) || reorder < 1 || !Number.isInteger(reorder)) {
      newErrors.reorderLevel = 'Reorder level must be at least 1';
    }

    if (unitCost !== '') {
      const cost = Number(unitCost);
      if (isNaN(cost) || cost < 0) {
        newErrors.unitCost = 'Cost must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && part) {
        await inventoryService.updatePart(part.id, {
          part_name: partName,
          qty_in_stock: Number(qtyInStock),
          reorder_level: Number(reorderLevel),
          unit_cost: unitCost !== '' ? Number(unitCost) : null
        });
      } else {
        await inventoryService.addPart({
          part_name: partName,
          part_number: partNumber || undefined,
          qty_in_stock: Number(qtyInStock),
          reorder_level: Number(reorderLevel),
          unit_cost: unitCost !== '' ? Number(unitCost) : null
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error('Inventory submission error:', err);
      if (err.message?.includes('exists') || err.code === 'PART_NUMBER_EXISTS') {
        setSubmitError('A part with this number already exists.');
      } else {
        setSubmitError(err.message || 'Failed to save part. Please check inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {submitError && (
        <div className="p-3 bg-error-bg border border-error text-error rounded text-sm font-medium flex items-center gap-2" role="alert">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <Input
        label="Part Name *"
        value={partName}
        onChange={(e) => setPartName(e.target.value)}
        error={errors.partName}
        placeholder="Oil Filter"
        disabled={isSubmitting}
        required
      />

      <Input
        label="Part Number"
        value={partNumber}
        onChange={(e) => setPartNumber(e.target.value)}
        error={errors.partNumber}
        placeholder="OF-001"
        disabled={isSubmitting || isEditMode} // Lock part number on edit
        helperText={isEditMode ? "Part numbers cannot be changed once created." : "Optional, must be unique if provided."}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Qty in Stock *"
          type="number"
          value={qtyInStock}
          onChange={(e) => setQtyInStock(e.target.value)}
          error={errors.qtyInStock}
          placeholder="15"
          disabled={isSubmitting}
          required
        />

        <Input
          label="Reorder Level *"
          type="number"
          value={reorderLevel}
          onChange={(e) => setReorderLevel(e.target.value)}
          error={errors.reorderLevel}
          placeholder="5"
          disabled={isSubmitting}
          required
        />
      </div>

      <Input
        label="Unit Cost (ZAR)"
        type="number"
        step="0.01"
        value={unitCost}
        onChange={(e) => setUnitCost(e.target.value)}
        error={errors.unitCost}
        placeholder="45.00"
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-2 border-t border-border pt-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {isEditMode ? 'Save Changes' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
};
export default PartForm;
