
export interface ReminderTemplate {
  id: string;
  label: string;
  offsetMinutes: number;
}

export interface IncentiveRegistration {
  id: string;
  name: string;
  annualFee: number;
  dueDate: string;
  reminderDaysBefore: number;
}

export interface HorseTemplate {
  id: string;
  name: string;
  reminderTemplates: ReminderTemplate[];
  incentiveRegistrations: IncentiveRegistration[];
  saddlePhotoUri?: string;
  bitPhotoUri?: string;
  preRunNotes?: string;
  createdAt: string;
  updatedAt: string;
}
