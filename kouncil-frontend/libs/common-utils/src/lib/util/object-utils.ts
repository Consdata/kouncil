export class ObjectUtils{
  public static removeNull(value: string): string {
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
