
import React, { useState, useRef, useEffect } from 'react';
import { Medication } from '../types';
import { Camera, X, Check, Loader2, Volume2, UserCheck, Smartphone } from 'lucide-react';
import { verifyContainer } from '../services/geminiService';

interface MedicationVerificationProps {
  med: Medication;
  onCancel: () => void;
  onConfirm: (verified: boolean) => void;
}

const MedicationVerification: React.FC<MedicationVerificationProps> = ({ med, onCancel, onConfirm }) => {
  const [step, setStep] = useState<'intro' | 'camera' | 'verifying' | 'result' | 'take_confirm'>('intro');
  const [assistantMessage, setAssistantMessage] = useState<string>(`Hi Joyce, it's time for your ${med.name}. Shall we check the bottle together?`);
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
      setAssistantMessage("Great! Hold the bottle right in front of the camera so I can see the name clearly.");
    } catch (err) {
      console.error("Camera access failed", err);
      setAssistantMessage("I can't see through the camera right now. No worries, let's just double check carefully by eye.");
      setStep('take_confirm');
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    setStep('verifying');
    setAssistantMessage("I'm looking at the bottle now...");

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
      setAssistantMessage(`That looks like your ${med.name}. Good job! Did you take the ${med.dose} now?`);
    } else {
      setAssistantMessage(`Hmm, that doesn't look like ${med.name}. I saw ${result.label}. Please look closely at the bottle.`);
    }

    stream?.getTracks().forEach(track => track.stop());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-95 flex flex-col animate-in fade-in duration-300">
      {/* Top Progress / Escape */}
      <div className="flex justify-between items-center p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
                <UserCheck className="text-white" size={28} />
            </div>
            <h2 className="text-white text-2xl font-bold">SafeCheck Assistant</h2>
        </div>
        <button onClick={onCancel} className="text-white bg-slate-800 p-3 rounded-2xl hover:bg-slate-700">
          <X size={32} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-6 space-y-6 overflow-y-auto pb-32">
        {/* Agent Interaction Area */}
        <div className="w-full max-w-lg space-y-6">
            <div className="agent-bubble">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl shrink-0">
                  <Volume2 className="text-blue-600" size={32} />
                </div>
                <p className="text-2xl text-slate-800 font-bold leading-snug">{assistantMessage}</p>
              </div>
            </div>

            {/* Reference Visual Container (Always helpful for elderly users) */}
            {med.imageUrl && (step === 'intro' || step === 'camera' || step === 'result') && (
              <div className="bg-white rounded-3xl p-4 shadow-xl border-4 border-blue-200">
                <p className="text-center text-blue-900 font-bold text-lg mb-2">LOOK FOR THIS BOTTLE:</p>
                <img 
                    src={med.imageUrl} 
                    alt="Sample Container" 
                    className="w-full h-56 object-contain rounded-2xl" 
                />
                <div className="mt-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-blue-900 text-xl font-bold text-center">It should say: <span className="underline decoration-blue-400 decoration-4 underline-offset-4">{med.name}</span></p>
                </div>
              </div>
            )}
        </div>

        {/* Step-Specific Controls */}
        <div className="w-full max-w-lg">
            {step === 'intro' && (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startCamera}
                  className="bg-blue-600 text-white font-bold py-8 px-6 rounded-3xl flex items-center justify-center gap-4 text-3xl shadow-2xl hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Camera size={40} />
                  Check Bottle
                </button>
                <button 
                  onClick={() => { setStep('take_confirm'); setAssistantMessage(`No problem. Did you take the ${med.dose} of ${med.name}?`); }}
                  className="bg-slate-800 text-slate-100 font-bold py-6 px-4 rounded-3xl flex items-center justify-center gap-4 text-2xl shadow-xl hover:bg-slate-700 active:scale-95 transition-all"
                >
                  Confirm by Hand
                </button>
              </div>
            )}

            {step === 'camera' && (
              <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[10px] border-blue-500 opacity-20 pointer-events-none rounded-3xl"></div>
                <button 
                  onClick={captureAndVerify}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold px-16 py-6 rounded-full shadow-2xl text-2xl animate-pulse"
                >
                  Tap to Confirm
                </button>
              </div>
            )}

            {step === 'verifying' && (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-800 rounded-3xl shadow-inner">
                <Loader2 className="animate-spin text-blue-400 mb-6" size={80} />
                <p className="text-white text-3xl font-bold">Checking label...</p>
              </div>
            )}

            {step === 'result' && (
              <div className="flex flex-col gap-4">
                {verificationResult?.match ? (
                  <button 
                    onClick={() => onConfirm(true)}
                    className="bg-green-600 text-white font-bold py-10 rounded-3xl flex items-center justify-center gap-6 text-4xl shadow-2xl border-b-8 border-green-800 active:translate-y-2 active:border-b-0"
                  >
                    <Check size={50} />
                    Yes, Taken
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-red-100 rounded-3xl border-4 border-red-300">
                       <p className="text-red-900 text-center text-2xl font-bold">Careful! That looks like {verificationResult?.label}.</p>
                    </div>
                    <button 
                      onClick={() => onConfirm(false)}
                      className="bg-orange-600 text-white font-bold py-8 rounded-3xl text-3xl shadow-xl border-b-4 border-orange-800"
                    >
                      I confirm it's correct
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'take_confirm' && (
              <div className="flex flex-col gap-6">
                <button 
                  onClick={() => onConfirm(false)}
                  className="bg-green-600 text-white font-bold py-12 rounded-3xl flex items-center justify-center gap-6 text-4xl shadow-2xl border-b-8 border-green-800"
                >
                  <Check size={50} />
                  Yes, Taken
                </button>
                <button 
                  onClick={onCancel}
                  className="bg-slate-700 text-white font-bold py-8 rounded-3xl text-2xl shadow-xl border-b-4 border-slate-900"
                >
                  Not yet
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MedicationVerification;