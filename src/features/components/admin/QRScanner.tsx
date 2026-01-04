"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Camera, CameraOff, CheckCircle, AlertCircle } from "lucide-react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      return code ? code.data : null;
    } catch (err) {
      console.error("QR detection error:", err);
      return null;
    }
  };

  const handleScanSuccess = useCallback(
    (data: string) => {
      setScanSuccess(true);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      setIsScanning(false);

      setTimeout(() => {
        onScan(data);
        setScanSuccess(false);
      }, 1000);
    },
    [onScan]
  );

  const captureAndScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = detectQRCode(imageData);

    if (code) {
      handleScanSuccess(code);
    }
  }, [handleScanSuccess]);

  const startScanning = useCallback(() => {
    scanIntervalRef.current = setInterval(() => {
      captureAndScan();
    }, 500);
  }, [captureAndScan]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Cannot access camera. Please check permissions.");
    }
  }, [startScanning]);

  useEffect(() => {
    if (!isOpen) return;

    // Use timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      startCamera();
    }, 0);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleManualInput = () => {
    const qrCode = prompt("Enter QR Code manually:");
    if (qrCode) {
      handleScanSuccess(qrCode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Camera className="text-white" size={24} />
            <div>
              <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
              <p className="text-blue-100 text-sm">
                Position QR code within frame
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-gray-900">
          {error ? (
            <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
              <AlertCircle className="text-red-500 mb-4" size={48} />
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning Frame */}
                  <div className="w-64 h-64 border-4 border-white rounded-lg relative">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>

                    {/* Scanning line animation */}
                    {isScanning && !scanSuccess && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="scan-line"></div>
                      </div>
                    )}

                    {/* Success indicator */}
                    {scanSuccess && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <CheckCircle className="text-green-500" size={64} />
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="text-center mt-4">
                    <p className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                      {scanSuccess
                        ? "QR Code Detected!"
                        : "Position QR code in the frame"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex justify-between items-center gap-4">
          <button
            onClick={handleManualInput}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Enter Manually
          </button>
          <div className="flex gap-2">
            {isScanning ? (
              <button
                onClick={stopCamera}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <CameraOff size={18} />
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Camera size={18} />
                Start Camera
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            to right,
            transparent,
            #3b82f6,
            transparent
          );
          animation: scan 2s linear infinite;
          box-shadow: 0 0 10px #3b82f6;
        }
      `}</style>
    </div>
  );
}
