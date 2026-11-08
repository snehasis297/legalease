import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, X, Sparkles } from 'lucide-react';

export const FaceVerificationModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [livenessStatus, setLivenessStatus] = useState('Align your face inside the oval');

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setLivenessStatus('Good lighting detected. Look directly at the camera.');
    } catch (err) {
      console.warn('Webcam access error:', err);
      setCameraError('Camera access denied or unavailable. You can upload a clear selfie photo instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const triggerCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    setLivenessStatus('Hold still. Capturing in 3 seconds...');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror the image horizontally to match webcam view
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'face_selfie.jpg', { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          setCapturedImage(previewUrl);
          stopCamera();
          setLivenessStatus('Biometric selfie captured successfully!');
          if (onCapture) {
            onCapture(file, previewUrl);
          }
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCapturedImage(previewUrl);
      stopCamera();
      setLivenessStatus('Selfie photo uploaded successfully!');
      if (onCapture) {
        onCapture(file, previewUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCountdown(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card max-w-lg w-full p-6 shadow-2xl relative border border-white/20 bg-white/95 dark:bg-slate-900/95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Biometric Face Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live selfie verification to confirm your identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Camera Box */}
        <div className="my-5 relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-indigo-500/30">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured Biometric Selfie"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive && 'hidden'}`}
              />

              {/* Oval Face Guide Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-64 border-2 border-dashed border-indigo-400 rounded-[50%] shadow-[0_0_25px_rgba(99,102,241,0.5)] animate-pulse" />
                  <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-900/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
                    {livenessStatus}
                  </span>
                </div>
              )}

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <span className="text-7xl font-black font-mono text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {!cameraActive && (
                <div className="p-6 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer shadow-lg transition">
                    <Camera className="w-4 h-4" />
                    <span>Upload Selfie Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use This Selfie</span>
              </button>
            </>
          ) : (
            cameraActive && (
              <>
                <label className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer">
                  <span>Upload photo instead</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={triggerCountdown}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationModal;
