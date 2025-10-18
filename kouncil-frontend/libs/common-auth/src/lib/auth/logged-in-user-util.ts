export class LoggedInUserUtil {

  public static isTemporaryAdminLoggedIn(): boolean {
    return localStorage.getItem('temporaryAdmin') === 'true';
  }

  static temporaryAdminLoggedIn(): void {
    localStorage.setItem('temporaryAdmin', true.toString());
  }
}
