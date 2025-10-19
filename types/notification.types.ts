export interface WebNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata: JSON;
  created_at: string;
}