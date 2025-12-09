
export interface Medication {
  id: string;
  name: string;
  dose: string;
  form: string;
  times: string[];
  containerDescription: string;
  refillDate: string;
  imageUrl?: string; // Reference image of the container
  instructions?: string;
}

export interface AdherenceLog {
  id: string;
  medicationId: string;
  timestamp: string;
  status: 'taken' | 'missed' | 'skipped';
  verified: boolean;
}

export interface UserPreferences {
  voiceTone: string;
  voiceSpeed: number;
  textSize: 'normal' | 'large';
}

export interface Consents {
  camera: boolean;
  cloudVerification: boolean;
  caregiverNotify: boolean;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  REMINDER = 'reminder',
  REFILLS = 'refills',
  SETTINGS = 'settings',
  CALENDAR = 'calendar'
}
