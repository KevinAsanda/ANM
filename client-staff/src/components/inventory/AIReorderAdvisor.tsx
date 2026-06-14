import React, { useState } from 'react';
import { inventoryService } from '../../services/inventoryService.js';
import { Button } from '../ui/Button.js';
import { Spinner } from '../ui/Spinner.js';
import { Sparkles, ArrowRight, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface AIReorderAdvisorProps {
  onRestockSuccess: () => void;
  inventoryItems: any[];
}

export const AIReorderAdvisor: React.FC<AIReorderAdvisorProps> = ({ onRestockSuccess, inventoryItems }) => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal control
  const [selectedRec, setSelectedRec] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFetchForecast = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAIForecast();
      setForecast(data);
      setIsFetched(true);
    } catch (err: any) {
      console.error('Error fetching AI forecast:', err);
      setError(err.message || 'Failed to fetch AI reorder suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRestockModal = (rec: any) => {
    setSelectedRec(rec);
    setRestockQty(rec.suggested_order_qty);
  };

  const handleCloseRestockModal = () => {
    setSelectedRec(null);
    setRestockQty(0);
  };

  const handleConfirmRestock = async () => {
    if (!selectedRec) return;
    setIsUpdating(true);
    try {
      // Find current item in local list to get the exact current stock
      const currentItem = inventoryItems.find(i => i.id === selectedRec.inventory_id);
      const currentQty = currentItem ? currentItem.qty_in_stock : selectedRec.current_stock;
      const newQty = currentQty + Number(restockQty);

      await inventoryService.updatePart(selectedRec.inventory_id, {
        qty_in_stock: newQty
      });

      // Remove the recommendation or update its status locally
      setForecast(prev => prev.filter(r => r.inventory_id !== selectedRec.inventory_id));
      handleCloseRestockModal();
      onRestockSuccess();
    } catch (err: any) {
      console.error('Error performing restock:', err);
      alert(err.message || 'Failed to restock item');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-surface to-primary-light/40 border border-primary/30 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-medium text-lg text-text">AI Smart Reorder Advisor</h2>
            <p className="text-xs text-text-muted mt-0.5">Forecasts 30-day demand and alerts you of seasonal restock needs based on job histories</p>
          </div>
        </div>

        <Button 
          variant={isFetched ? 'secondary' : 'primary'}
          onClick={handleFetchForecast}
          disabled={isLoading}
          className="gap-2 shrink-0 py-2.5 px-4 text-xs font-semibold"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : isFetched ? (
            <>
              <RefreshCw size={14} />
              Re-analyze Stock
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analyze Stock Needs
            </>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 text-center gap-2 animate-fade-in mt-4 border-t border-primary/20 pt-6">
          <Spinner size="md" />
          <p className="text-xs text-text-muted mt-2">AI is analyzing historical tickets and parts volumes...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 border-t border-primary/20 pt-4 text-error text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isFetched && !isLoading && (
        <div className="mt-4 border-t border-primary/20 pt-5 animate-fade-in">
          {forecast.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4 bg-white/50 rounded-lg">
              ✨ All stock levels look healthy for the projected 30-day demand. No reorders recommended.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecast.map((rec) => {
                // Find matching part details (e.g. part number, unit cost)
                const partInfo = inventoryItems.find(i => i.id === rec.inventory_id);
                const cost = partInfo?.unit_cost || rec.estimated_cost / (rec.suggested_order_qty || 1);

                return (
                  <div key={rec.inventory_id} className="bg-white border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-text text-sm leading-tight">{rec.part_name}</h4>
                        <span className="text-[10px] font-mono text-text-muted bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {partInfo?.part_number || 'No Part #'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="text-center bg-slate-50 px-2.5 py-1 rounded-lg border border-border/60">
                          <span className="block text-[10px] uppercase text-text-muted font-medium">In Stock</span>
                          <span className="text-xs font-bold text-text">{rec.current_stock}</span>
                        </div>
                        <ArrowRight size={14} className="text-text-muted" />
                        <div className="text-center bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                          <span className="block text-[10px] uppercase text-primary font-medium">Order Qty</span>
                          <span className="text-xs font-bold text-primary">+{rec.suggested_order_qty}</span>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted mt-3 font-light leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </div>

                    <div className="border-t border-border mt-4 pt-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase text-text-muted block">Est. Cost</span>
                        <span className="text-xs font-semibold text-text">
                          ZAR {(rec.suggested_order_qty * cost).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenRestockModal({ ...rec, cost })}
                        className="py-1.5 px-3.5 text-xs font-semibold rounded-lg"
                      >
                        Restock
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Human Touch confirmation and edit modal */}
      {selectedRec && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-medium text-lg text-text">Confirm Smart Restock</h3>
              <button 
                onClick={handleCloseRestockModal}
                className="text-text-muted hover:text-text p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-[10px] uppercase text-primary font-bold tracking-wider">Restock Item</span>
                <h4 className="font-semibold text-text text-base mt-1">{selectedRec.part_name}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{selectedRec.reasoning}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                  Adjust Restock Quantity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                  />
                  <span className="text-xs text-text-muted">
                    New quantity in stock: <strong className="text-text">{selectedRec.current_stock + restockQty}</strong> units
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                <div>
                  <span className="text-[10px] uppercase text-text-muted block">Final Cost Estimate</span>
                  <span className="text-base font-bold text-text">
                    ZAR {(restockQty * selectedRec.cost).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleCloseRestockModal} 
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleConfirmRestock} 
                    disabled={isUpdating || restockQty <= 0}
                    className="gap-1.5"
                  >
                    {isUpdating ? <Spinner size="sm" /> : <Check size={14} />}
                    Confirm Restock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
