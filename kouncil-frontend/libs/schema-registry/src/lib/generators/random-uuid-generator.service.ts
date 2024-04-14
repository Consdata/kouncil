import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomUuidGeneratorService {

  public getRandomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string) {
      // eslint-disable-next-line no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
