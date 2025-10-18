export class NotificationModel {
  constructor(public type: NotificationType, public message: string, public action: NotificationAction) {
  }
}

export enum NotificationType {
  PUSH_WITH_ACTION_REQUIRED = 'PUSH_WITH_ACTION_REQUIRED',
  PUSH = 'PUSH'
}

export enum NotificationAction {
  LOGOUT = 'LOGOUT',
  CLUSTERS_NOT_DEFINED = 'CLUSTERS_NOT_DEFINED'
}
