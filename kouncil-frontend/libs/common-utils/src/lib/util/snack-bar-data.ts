export class SnackBarData {

  message: string;
  iconClass: string;
  action: string;

  constructor(message: string, iconClass: string, action: string) {
    this.message = message;
    this.iconClass = iconClass;
    this.action = action;
  }
}
