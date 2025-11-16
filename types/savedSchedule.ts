
import { EventDetails, Horse } from './horse';

export interface SavedSchedule {
  id: string;
  name: string;
  eventDate: Date;
  eventDetails: EventDetails;
  horses: Horse[];
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
