
export const calculateEstimatedRunTime = (
  eventStartTime: Date | null,
  horsesPerHour: number,
  drawNumber: number
): Date | null => {
  if (!eventStartTime || horsesPerHour <= 0 || drawNumber <= 0) {
    return null;
  }

  const minutesPerHorse = 60 / horsesPerHour;
  const minutesUntilRun = (drawNumber - 1) * minutesPerHorse;
  
  const estimatedTime = new Date(eventStartTime);
  estimatedTime.setMinutes(estimatedTime.getMinutes() + minutesUntilRun);
  
  return estimatedTime;
};

export const calculateFiresAtTime = (
  runTime: Date | null,
  offsetMinutes: number
): Date | null => {
  if (!runTime) {
    return null;
  }

  const firesAt = new Date(runTime);
  firesAt.setMinutes(firesAt.getMinutes() - offsetMinutes);
  
  return firesAt;
};

export const formatTime = (date: Date | null): string => {
  if (!date) {
    return '--:--';
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const offsetOptions = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hrs', value: 120 },
  { label: '2.5 hrs', value: 150 },
  { label: '3 hrs', value: 180 },
  { label: '4 hrs', value: 240 },
];
