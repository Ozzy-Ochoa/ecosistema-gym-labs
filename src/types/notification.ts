export type NotificationType = 
  | 'MANDATORY_DATA' 
  | 'PERIODIC_CHECK' 
  | 'SYSTEM_UPDATE' 
  | 'NEWS' 
  | 'ALERT';

export type NotificationSeverity = 'info' | 'warning' | 'urgent';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  dismissedPopup: boolean; // whether dismissed from the pop-up on screen
  severity: NotificationSeverity;
  actionLabel?: string;
  actionType?: 'OPEN_VERIFY_MODAL' | 'NAVIGATE_SETTINGS' | 'NAVIGATE_TAB' | 'DISMISS';
  actionTargetTab?: string;
  metadata?: {
    missingFields?: string[];
    daysSinceLastCheck?: number;
    lastCheckedDate?: string;
    version?: string;
    checkFrequencyDays?: number;
  };
}
