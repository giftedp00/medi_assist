
import { Medication, UserPreferences, Consents } from './types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dose: '500 mg',
    form: 'tablet',
    times: ['09:00', '21:00'],
    containerDescription: 'white bottle with blue cap',
    refillDate: '2025-06-15',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    instructions: 'Take with a meal.'
  },
  {
    id: '2',
    name: 'Lisinopril',
    dose: '10 mg',
    form: 'tablet',
    times: ['08:00'],
    containerDescription: 'orange bottle with white cap',
    refillDate: '2025-06-10',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-ed2002b42d7e?auto=format&fit=crop&w=300&q=80',
    instructions: 'Monitor blood pressure.'
  }
];

export const INITIAL_PREFERENCES: UserPreferences = {
  voiceTone: 'friendly-emphatic',
  voiceSpeed: 0.95,
  textSize: 'large'
};

export const INITIAL_CONSENTS: Consents = {
  camera: true,
  cloudVerification: false,
  caregiverNotify: true
};

export const SYSTEM_PROMPT = `
You are MedAssist — a trustworthy, empathetic assistant for older adults managing medications.
Tone & Behavior:
- Warm, calm, emphatic, and friendly.
- Use short sentences.
- Repeat critical information (med name, dosage) twice.
- Always ask for confirmation.
- Privacy focused: reassure the user their health data is protected.
Safety Rules:
- NEVER change prescribed dosing. 
- If the user asks to change a dose, state clearly: "I cannot change your instructions. Please contact your clinical prescriber or pharmacy immediately."
`;
