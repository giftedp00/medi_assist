
import React, { useState, useRef, useEffect } from 'react';
import { Medication } from '../types';
import { Camera, X, Check, Loader2, Volume2, Info } from 'lucide-react';
import { getGeminiResponse, verifyContainer } from '../services/geminiService';

interface MedicationVerificationProps {
  med: Medication;
  onCancel: () => void;
  onConfirm: (verified: boolean) => void;
}

const MedicationVerification: React.FC<MedicationVerificationProps> = ({ med, onCancel, onConfirm }) => {
  const [step, setStep] = useState<'intro' | 'camera' | 'verifying' | 'result' | 'take_confirm'>('intro');
  const [assistantMessage, setAssistantMessage] = useState<string>(`It is time for your ${med.name}. Can I help verify your bottle?`);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ match: boolean, confidence: number, label: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep('camera');
      setAssistantMessage("Please hold your bottle up to the camera so I can see the label clearly.");
    } catch (err) {
      console.error("Camera access failed", err);
      setAssistantMessage("I couldn't access the camera. That's okay, we can proceed manually.");
      setStep('take_confirm');
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    setStep('verifying');
    setAssistantMessage("Looking closely...");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];

    const result = await verifyContainer(base64, med.containerDescription);
    setVerificationResult(result);
    setStep('result');

    if (result.match) {
      setAssistantMessage(`I see a ${result.label}. That looks correct! Did you take your ${med.dose} tablets now?`);
    } else {
      setAssistantMessage(`I'm not completely sure about this bottle. It looks like ${result.label}. Please double check the label before taking it.`);
    }

    // Stop stream
    stream?.getTracks().forEach(track => track.stop());
  };

  const finalize = (success: boolean) => {
    onConfirm(success);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-95 flex flex-col p-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-3xl font-bold">Assist</h2>
        <button onClick={onCancel} className="text-white bg-slate-800 p-2 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-2 rounded-full shrink-0 mt-1">
              <Volume2 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl text-slate-800 font-bold">{assistantMessage}</p>
              {med.imageUrl && step === 'camera' && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0">
                    <img src={med.imageUrl} alt="Ref" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-blue-900 text-lg font-medium">Look for this container: <span className="font-bold">{med.containerDescription}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {step === 'intro' && (
          <div className="grid grid-cols-1 gap-4 w-full">
             {med.imageUrl && (
              <div className="mb-2 bg-white p-2 rounded-3xl shadow-lg border border-slate-100">
                <img src={med.imageUrl} alt="Container Preview" className="w-full h-48 object-contain rounded-2xl" />
                <p className="text-center py-2 text-slate-600 font-bold">Reference: {med.containerDescription}</p>
              </div>
            )}
            <button 
              onClick={startCamera}
              className="bg-blue-600 text-white font-bold py-6 px-4 rounded-3xl flex items-center justify-center gap-4 text-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Camera size={32} />
              Verify with Camera
            </button>
            <button 
              onClick={() => { setStep('take_confirm'); setAssistantMessage(`No problem. Did you take your ${med.name} tablets?`); }}
              className="bg-slate-700 text-white font-bold py-6 px-4 rounded-3xl flex items-center justify-center gap-4 text-2xl shadow-xl hover:bg-slate-600 active:scale-95 transition-all"
            >
              Skip and confirm manual
            </button>
          </div>
        )}

        {step === 'camera' && (
          <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <button 
              onClick={captureAndVerify}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold px-12 py-4 rounded-full shadow-lg text-xl"
            >
              Check Label
            </button>
          </div>
        )}

        {step === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-white mb-4" size={64} />
            <p className="text-white text-2xl font-bold">Analyzing Bottle...</p>
          </div>
        )}

        {step === 'result' && (
          <div className="w-full grid grid-cols-1 gap-4">
            {verificationResult?.match ? (
              <button 
                onClick={() => finalize(true)}
                className="bg-green-600 text-white font-bold py-8 px-4 rounded-3xl flex items-center justify-center gap-4 text-3xl shadow-xl"
              >
                <Check size={40} />
                Yes, I took it
              </button>
            ) : (
              <>
                <div className="p-6 bg-orange-100 rounded-3xl border-2 border-orange-200">
                   <p className="text-orange-900 text-center text-xl font-bold">The bottle found was: {verificationResult?.label}</p>
                   <p className="text-orange-800 text-center mt-2">Please verify against the sample image manually.</p>
                </div>
                <button 
                  onClick={() => finalize(false)}
                  className="bg-slate-700 text-white font-bold py-8 px-4 rounded-3xl flex items-center justify-center gap-4 text-2xl shadow-xl"
                >
                  Confirm manually taken
                </button>
              </>
            )}
            <button 
              onClick={onCancel}
              className="text-white text-lg font-bold p-4 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'take_confirm' && (
          <div className="w-full grid grid-cols-1 gap-4">
            <button 
              onClick={() => finalize(false)}
              className="bg-green-600 text-white font-bold py-8 px-4 rounded-3xl flex items-center justify-center gap-4 text-3xl shadow-xl"
            >
              <Check size={40} />
              Yes, I've taken it
            </button>
            <button 
              onClick={onCancel}
              className="bg-slate-700 text-white font-bold py-6 px-4 rounded-3xl flex items-center justify-center gap-4 text-xl shadow-xl"
            >
              No, not yet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationVerification;
