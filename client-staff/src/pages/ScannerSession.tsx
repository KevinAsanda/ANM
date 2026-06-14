import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { scannerService } from '../services/scannerService.js';
import { inventoryService } from '../services/inventoryService.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Clock, CheckCircle, AlertCircle, Scan, ShieldAlert, Smartphone, Camera, Eye } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const ScannerSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('sessionId') || '';
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState<string>(emailParam);
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Scanner UI States
  const [scanMode, setScanMode] = useState<'camera' | 'simulator'>('simulator');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [dbParts, setDbParts] = useState<any[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState<boolean>(false);

  // Synthesize a hardware beep sound via the Web Audio API
  const playScannerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // 950Hz crisp beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12); // 120ms duration
    } catch (e) {
      console.warn('AudioContext not supported on this browser/device', e);
    }
  };

  // Check if user is already logged in as the scanned email
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === emailParam.toLowerCase()) {
      setIsAuthenticated(true);
    }
  }, [emailParam]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadParts = async () => {
        setIsLoadingParts(true);
        try {
          const items = await inventoryService.getInventory();
          const mapped = items
            .filter(item => item.part_number)
            .map(item => ({
              name: item.part_name,
              barcode: item.part_number as string
            }));
          setDbParts(mapped);
        } catch (err) {
          console.error('Failed to load parts from database:', err);
        } finally {
          setIsLoadingParts(false);
        }
      };
      loadParts();
    }
  }, [isAuthenticated]);

  // Real Camera scan control
  useEffect(() => {
    let html5QrcodeScanner: Html5Qrcode | null = null;
    
    if (isAuthenticated && scanMode === 'camera') {
      setIsCameraActive(true);
      setCameraError(null);
      
      // Delay slightly to ensure #camera-reader is fully mounted in the DOM
      const timer = setTimeout(() => {
        try {
          html5QrcodeScanner = new Html5Qrcode('camera-reader');
          
          const formats = [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.QR_CODE
          ];

          html5QrcodeScanner.start(
            { facingMode: 'environment' }, // Back camera
            {
              fps: 10,
              qrbox: (width, height) => {
                // Return a landscape bounding rectangle optimized for EAN-13 barcodes
                const boxWidth = Math.min(width * 0.85, 260);
                const boxHeight = Math.min(height * 0.45, 120);
                return { width: boxWidth, height: boxHeight };
              },
              formatsToSupport: formats
            },
            (decodedText) => {
              // Automatically transmit barcode once successfully scanned
              handleTransmit(decodedText);
            },
            () => {
              // Frame processing failure (ignored to prevent console flooding)
            }
          ).catch(err => {
            console.error('Camera access failed:', err);
            setCameraError('Failed to access phone camera. Please grant camera permissions.');
            setIsCameraActive(false);
          });
        } catch (e: any) {
          console.error('Html5Qrcode init failed:', e);
          setCameraError('Failed to initialize barcode scanner.');
          setIsCameraActive(false);
        }
      }, 400);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeScanner) {
          if (html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
              console.log('Camera scanner stopped.');
            }).catch(stopErr => {
              console.error('Failed to stop camera scanner:', stopErr);
            });
          }
        }
      };
    }
  }, [isAuthenticated, scanMode]);

  const handleLoginAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      const loginEmail = email.trim();
      if (!loginEmail || !password) {
        throw new Error('Please enter both your email and password.');
      }

      await authService.login(loginEmail, password);
      setIsAuthenticated(true);
      playScannerBeep();
    } catch (err: any) {
      console.error('Mobile scanner connection failed:', err);
      setError(err.message || 'Verification failed. Please check credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTransmit = async (barcodeToSend: string) => {
    if (!barcodeToSend.trim()) return;
    setError(null);
    setIsTransmitting(true);
    
    try {
      await scannerService.scanBarcode(sessionId, barcodeToSend.trim());
      
      playScannerBeep();
      setLastScanned(barcodeToSend.trim());
      setScannedBarcode('');
      setFlashMessage(`Transmitted: ${barcodeToSend.trim()}`);
      
      // Auto-flash message clears after 1.5s
      setTimeout(() => setFlashMessage(null), 1500);
    } catch (err: any) {
      console.error('Transmit error:', err);
      setError(err.message || 'Failed to transmit scan to desktop.');
    } finally {
      setIsTransmitting(false);
    }
  };

  const mockParts = [
    { name: 'Spark Plug NGK BKR6', barcode: '6001234000010' },
    { name: 'Front Brake Pads ATE', barcode: '6001234000027' },
    { name: 'Engine Oil Castrol 4L', barcode: '6001234000034' },
    { name: 'ANM Oil Filter', barcode: '6001234000041' },
    { name: 'Car Battery 12V 619', barcode: '6001234000058' }
  ];

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="bg-surface border border-border p-8 rounded-2xl max-w-sm flex flex-col items-center gap-4">
          <ShieldAlert size={48} className="text-error" />
          <h3 className="font-display font-medium text-2xl text-text">Invalid Session</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            This link is missing a valid remote scanning session code. Please scan the QR code displayed on your desktop console.
          </p>
        </div>
      </div>
    );
  }

  // 1. Password Verification view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center p-6 max-w-md mx-auto">
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Smartphone size={32} />
            </div>
            <h2 className="font-display font-medium text-2xl text-text">Link Phone Scanner</h2>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              Confirm your password to link your smartphone camera to desktop session: <span className="font-mono text-primary font-semibold">{sessionId.slice(0, 8)}</span>
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-error-bg border border-error text-error rounded-xl flex items-center gap-2.5 text-xs font-medium">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginAndConnect} className="flex flex-col gap-4">
            <Input
              label="Staff Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mechanic@anm.co.za"
              required
              disabled={isConnecting || !!emailParam}
            />
            <Input
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isConnecting}
            />

            <Button
              variant="primary"
              type="submit"
              isLoading={isConnecting}
              className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover text-white border-primary"
            >
              Verify & Connect Scanner
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Active Scanner view
  return (
    <div className="min-h-screen bg-text flex flex-col text-white max-w-md mx-auto select-none">
      {/* Mobile Portal Header */}
      <header className="bg-primary p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan size={20} className="text-emerald-400 animate-pulse" />
          <h1 className="font-display font-medium text-md tracking-wide">ANM Phone Scanner</h1>
        </div>
        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
          Connected
        </span>
      </header>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 bg-primary-hover/30 border-b border-white/10 text-xs">
        <button
          onClick={() => setScanMode('camera')}
          className={`py-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${scanMode === 'camera' ? 'border-emerald-500 text-white bg-white/5' : 'border-transparent text-white/60 hover:text-white'}`}
        >
          <Camera size={14} />
          Use Camera
        </button>
        <button
          onClick={() => setScanMode('simulator')}
          className={`py-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${scanMode === 'simulator' ? 'border-emerald-500 text-white bg-white/5' : 'border-transparent text-white/60 hover:text-white'}`}
        >
          <Eye size={14} />
          Demo Simulator
        </button>
      </div>

      {/* Viewport: Camera reader or simulated laser */}
      <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/10 overflow-hidden">
        {scanMode === 'camera' ? (
          <div className="w-full h-full relative">
            <div id="camera-reader" className="w-full h-full object-cover"></div>
            {isCameraActive && (
              <>
                {/* Horizontal scanner red overlay */}
                <div className="absolute top-[40%] left-[10%] right-[10%] h-[2px] bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-pulse z-10" />
                <div className="absolute top-[20%] bottom-[20%] left-[10%] right-[10%] border border-white/20 rounded-lg pointer-events-none" />
              </>
            )}
            {cameraError && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center gap-2 z-20">
                <AlertCircle size={24} className="text-red-400" />
                <p className="text-xs text-white/95 leading-relaxed">{cameraError}</p>
                <Button variant="secondary" size="sm" onClick={() => setScanMode('simulator')}>
                  Use Demo Simulator
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Sweeping laser line animation for simulator */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_10px_#ef4444] animate-bounce z-10" style={{ animationDuration: '3s' }} />
            
            {/* Corner framing indicators */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

            <div className="flex flex-col items-center gap-2 text-center z-0 p-4">
              <Scan size={36} className="text-white/40 animate-pulse" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Demo Viewport Active</span>
            </div>
          </>
        )}

        {/* Successful Scan Splash Overlay */}
        {flashMessage && (
          <div className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center gap-2 text-white font-display text-md font-semibold animate-fade-in z-30">
            <CheckCircle size={32} />
            {flashMessage}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-primary-hover/40 px-4 py-2 border-b border-white/10 flex justify-between items-center text-[10px] text-white/70">
        <span>Session ID: <span className="font-mono text-emerald-300">{sessionId.slice(0, 12)}</span></span>
        {lastScanned && <span>Last scan: <span className="font-mono text-emerald-300 text-xs font-semibold">{lastScanned}</span></span>}
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 flex flex-col gap-5 bg-text overflow-y-auto">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Manual entry / Wedge scanning input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-semibold tracking-wider text-white/60">Manual Barcode Input / Scan Feed</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              placeholder="Type or feed barcode..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <Button
              variant="primary"
              onClick={() => handleTransmit(scannedBarcode)}
              isLoading={isTransmitting}
              disabled={!scannedBarcode}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700 text-xs font-semibold"
            >
              Send
            </Button>
          </div>
        </div>

        {/* Foolproof Simulation Panel - shown in both modes as a fallback */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-semibold tracking-wider text-white/60">
            {isLoadingParts ? 'Loading inventory parts...' : dbParts.length > 0 ? 'Inventory Parts from DB (Tap to Scan)' : 'Simulated Workshop Items (Tap to Scan)'}
          </label>
          <div className="flex flex-col gap-2">
            {((dbParts.length > 0) ? dbParts : mockParts).map((part) => (
              <button
                key={part.barcode}
                onClick={() => handleTransmit(part.barcode)}
                disabled={isTransmitting}
                className="w-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-white/10 p-3 rounded-xl flex items-center justify-between text-left transition-all text-xs"
              >
                <div>
                  <div className="font-medium text-white/90">{part.name}</div>
                  <div className="font-mono text-[10px] text-white/40 mt-0.5">{part.barcode}</div>
                </div>
                <Scan size={14} className="text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Footer */}
      <footer className="p-4 bg-primary border-t border-white/10 text-center text-[9px] text-white/40 leading-none">
        ANM Service Management System © 2026
      </footer>
    </div>
  );
};

export default ScannerSession;
