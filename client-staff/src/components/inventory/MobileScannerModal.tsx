import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { scannerService } from '../../services/scannerService.js';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Spinner } from '../ui/Spinner.js';
import { Smartphone, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export const MobileScannerModal: React.FC<MobileScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "Link Smartphone Barcode Scanner"
}) => {
  const { user } = useAuth();
  
  const [sessionId, setSessionId] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'registering' | 'waiting' | 'scanned' | 'error'>('registering');
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  // Play a synthesized scan beep sound via the Web Audio API
  const playDesktopBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext not supported on this browser/device', e);
    }
  };

  const startSession = async () => {
    if (!user) return;
    
    setError(null);
    setIsRegistering(true);
    setStatus('registering');
    
    // Generate a unique session token
    const newSessionId = `scan-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString().slice(-4)}`;
    setSessionId(newSessionId);

    try {
      // 1. Register session on the backend
      await scannerService.registerSession(newSessionId);
      setStatus('waiting');

      // 2. Start polling for scans
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const response = await scannerService.pollSession(newSessionId);
          if (response.barcode) {
            playDesktopBeep();
            setLastScannedBarcode(response.barcode);
            setStatus('scanned');
            
            // Forward scanned barcode to parent component
            onScan(response.barcode);
            
            // Reset status back to waiting after a short delay
            setTimeout(() => {
              setStatus('waiting');
            }, 1500);
          }
        } catch (pollErr: any) {
          console.error('Error polling scanner session:', pollErr);
        }
      }, 1500);

    } catch (err: any) {
      console.error('Failed to initialize mobile scanner session:', err);
      setError(err.message || 'Failed to start remote scanner session.');
      setStatus('error');
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      // Clean up polling interval on close
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setLastScannedBarcode(null);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen]);

  // Construct connection URL pointing to /scanner-session on phone
  const scanUrl = `${window.location.origin}/scanner-session?sessionId=${sessionId}&email=${encodeURIComponent(user?.email || '')}`;
  // Public QR Code API URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(scanUrl)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-6 p-2 text-center">
        {status === 'registering' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Spinner size="lg" />
            <span className="text-sm text-text-muted">Registering remote session...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4 max-w-sm">
            <AlertCircle size={40} className="text-error animate-bounce" />
            <h4 className="font-display font-medium text-lg text-text">Connection Error</h4>
            <p className="text-text-muted text-xs leading-relaxed">{error}</p>
            <Button variant="primary" onClick={startSession}>Retry Connection</Button>
          </div>
        )}

        {(status === 'waiting' || status === 'scanned') && (
          <div className="flex flex-col items-center gap-5 w-full">
            {/* QR Code container */}
            <div className="p-3 bg-white border border-border/80 rounded-2xl shadow-xs">
              <img 
                src={qrCodeImageUrl} 
                alt="Scanner connection QR code" 
                className="w-[200px] h-[200px] object-contain select-none"
              />
            </div>

            <div className="flex flex-col items-center gap-1.5 max-w-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Smartphone size={14} className="text-primary" />
                <span>Camera Scanner Setup</span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Scan this QR code with your mobile device, enter your portal password, and use your phone as a mobile barcode scanner.
              </p>
            </div>

            {/* Scanning connection status bar */}
            <div className="w-full bg-background border border-border/60 p-4 rounded-xl flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'scanned' ? 'bg-emerald-500 scale-125' : 'bg-amber-500 animate-pulse'}`} />
                <div>
                  <h5 className="font-semibold text-xs text-text">
                    {status === 'scanned' ? 'Barcode Transmitted!' : 'Awaiting mobile scan...'}
                  </h5>
                  <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                    {status === 'scanned' ? `Received: ${lastScannedBarcode}` : `Session ID: ${sessionId.slice(0, 15)}...`}
                  </p>
                </div>
              </div>
              {status === 'scanned' && (
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 animate-bounce" />
              )}
            </div>

            <div className="flex gap-2 w-full mt-1">
              <Button variant="ghost" onClick={startSession} className="flex-1 text-xs">
                Regenerate QR Code
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1 text-xs">
                Close Connection
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default MobileScannerModal;
