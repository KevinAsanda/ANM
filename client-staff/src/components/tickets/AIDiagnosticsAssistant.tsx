import React, { useState } from 'react';
import { ticketsService } from '../../services/ticketsService.js';
import { Button } from '../ui/Button.js';
import { Spinner } from '../ui/Spinner.js';
import { Sparkles, CheckSquare, Square, CheckCircle, AlertCircle } from 'lucide-react';

interface AIDiagnosticsAssistantProps {
  ticketId: string;
  ticketDescription: string;
  initialDiagnostics?: any;
  onSelectPart: (partId: string, qty: number) => void;
  canModify: boolean;
}

export const AIDiagnosticsAssistant: React.FC<AIDiagnosticsAssistantProps> = ({
  ticketId,
  ticketDescription,
  initialDiagnostics,
  onSelectPart,
  canModify
}) => {
  const [diagnostics, setDiagnostics] = useState<any | null>(initialDiagnostics || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getAIDiagnostics(ticketId);
      setDiagnostics(data);
    } catch (err: any) {
      console.error('Error generating diagnostics:', err);
      setError(err.message || 'Failed to generate AI diagnostics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, currentChecked: boolean) => {
    if (!diagnostics || !canModify) return;
    
    setIsUpdatingChecklist(itemId);
    try {
      const updatedChecklist = diagnostics.checklist.map((item: any) => {
        if (item.id === itemId) {
          return { ...item, checked: !currentChecked };
        }
        return item;
      });

      const updated = await ticketsService.updateAIChecklist(ticketId, updatedChecklist);
      setDiagnostics(updated);
    } catch (err: any) {
      console.error('Error updating checklist:', err);
      alert(err.message || 'Failed to update checklist item');
    } finally {
      setIsUpdatingChecklist(null);
    }
  };

  const hasDiagnostics = diagnostics && (diagnostics.causes?.length > 0 || diagnostics.checklist?.length > 0);

  return (
    <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-slate-900/40 dark:to-slate-800/40 border border-blue-100 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-primary animate-pulse" size={18} />
          <h3 className="font-display font-medium text-lg text-text">AI Diagnostics Assistant</h3>
        </div>
        
        {!hasDiagnostics && !isLoading && (
          <Button
            variant="primary"
            onClick={handleGenerateDiagnostics}
            className="py-1.5 px-3.5 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <Sparkles size={14} />
            Analyze Symptoms
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-text-muted mt-2">AI is running root-cause analysis on symptoms...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-error-bg border border-error text-error text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !hasDiagnostics && !error && (
        <p className="text-xs text-text-muted italic">
          Click "Analyze Symptoms" to get AI diagnostics recommendations based on the customer's reported issues.
        </p>
      )}

      {hasDiagnostics && !isLoading && (
        <div className="flex flex-col gap-5">
          {/* Root Causes */}
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-2">Likely Root Causes</span>
            <ul className="list-disc pl-4 flex flex-col gap-1.5">
              {diagnostics.causes.map((cause: string, i: number) => (
                <li key={i} className="text-xs text-text font-light leading-relaxed">
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Checklist */}
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-2">Diagnostic Checklist</span>
            <div className="flex flex-col gap-2 bg-white/60 p-3 rounded-xl border border-border/40">
              {diagnostics.checklist.map((item: any) => {
                const isItemUpdating = isUpdatingChecklist === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id, item.checked)}
                    disabled={!canModify || isItemUpdating}
                    className={`flex items-start text-left gap-2.5 p-2 rounded-lg transition-colors w-full ${
                      item.checked ? 'bg-green-50/30' : 'hover:bg-slate-50'
                    } ${!canModify ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {isItemUpdating ? (
                      <Spinner size="sm" className="mt-0.5 shrink-0" />
                    ) : item.checked ? (
                      <CheckCircle className="text-success mt-0.5 shrink-0" size={16} />
                    ) : (
                      <Square className="text-text-muted mt-0.5 shrink-0" size={16} />
                    )}
                    <span className={`text-xs ${item.checked ? 'line-through text-text-muted' : 'text-text'}`}>
                      {item.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggested Parts */}
          {diagnostics.suggested_parts?.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-2">Recommended Parts</span>
              <div className="flex flex-col gap-2.5">
                {diagnostics.suggested_parts.map((part: any, i: number) => (
                  <div key={i} className="bg-white border border-border/80 rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-semibold text-text">{part.part_name}</h5>
                        {part.suggested_qty > 1 && (
                          <span className="text-[9px] bg-blue-50 text-primary border border-blue-100 px-1.5 py-0.2 rounded font-bold">
                            Qty: {part.suggested_qty}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{part.reasoning}</p>
                    </div>
                    {part.inventory_id && canModify && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectPart(part.inventory_id, part.suggested_qty)}
                        className="py-1 px-2.5 text-[10px] font-semibold shrink-0"
                      >
                        Add to Job
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
