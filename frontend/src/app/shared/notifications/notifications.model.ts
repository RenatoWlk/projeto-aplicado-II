export interface NotificationDto {
  notificationBaseId: string;
  title?: string;
  body?: string;
  type?: string;
  redirectTo?: string; // URL to redirect when notification is clicked
  metadata?: { [key: string]: any }; // Additional metadata
  read?: boolean;
  expireAt?: string; // ISO date
  createdAt?: string; // ISO date
}
