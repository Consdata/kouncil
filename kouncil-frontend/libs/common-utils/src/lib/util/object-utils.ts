export class ObjectUtils {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  public static removeNull(value: any): string {
    Object.keys(value).forEach(key => {
      if (value[key] && typeof value[key] === 'object') {
        this.removeNull(value[key]);
      } else if (value[key] === null) {
        delete value[key];
      }
    });
    return value;
  }
}
