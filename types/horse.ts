
export interface Reminder {
  id: string;
  label: string;
  offsetMinutes: number;
  firesAt: Date | null;
}

export interface Horse {
  id: string;
  name: string;
  drawNumber: string;
  estimatedRunTime: Date | null;
  reminders: Reminder[];
}

export interface EventDetails {
  startTime: Date | null;
  horsesPerHour: string;
}
