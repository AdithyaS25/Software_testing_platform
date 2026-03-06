import { apiClient } from '../../../lib/axios';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  emailBugAssigned: boolean;
  emailBugStatusChanged: boolean;
  emailTestAssigned: boolean;
  emailCommentMention: boolean;
  emailRetestRequested: boolean;
  inAppBugAssigned: boolean;
  inAppBugStatusChanged: boolean;
  inAppTestAssigned: boolean;
  inAppCommentMention: boolean;
  inAppRetestRequested: boolean;
}

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    apiClient
      .get<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
      }>('/api/notifications', { params })
      .then((r) => r.data),

  getUnreadCount: () =>
    apiClient
      .get<{ count: number }>('/api/notifications/unread-count')
      .then((r) => r.data.count),

  markRead: (id: string) =>
    apiClient.patch(`/api/notifications/${id}/read`).then((r) => r.data),

  markUnread: (id: string) =>
    apiClient.patch(`/api/notifications/${id}/unread`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch('/api/notifications/read-all').then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/notifications/${id}`).then((r) => r.data),

  clearAll: () => apiClient.delete('/api/notifications').then((r) => r.data),

  getPreferences: () =>
    apiClient
      .get<NotificationPreference>('/api/notifications/preferences')
      .then((r) => r.data),

  updatePreferences: (data: Partial<NotificationPreference>) =>
    apiClient
      .put<NotificationPreference>('/api/notifications/preferences', data)
      .then((r) => r.data),
};
