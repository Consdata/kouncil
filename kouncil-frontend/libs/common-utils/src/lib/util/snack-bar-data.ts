export class SnackBarData {

  message: string;
  action: string;
  snackbarType: SnackBarType;

  constructor(message: string, snackbarType: SnackBarType, action?: string) {
    this.message = message;
    this.action = action;
    this.snackbarType = snackbarType;
  }
}

export enum SnackBarType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
