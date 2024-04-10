import {Injectable} from '@angular/core';
import {Crypto} from '@app/common-utils';

@Injectable({
  providedIn: 'root'
})
export class RandomUuidGeneratorService {

  public getRandomUUID(): string {
    return Crypto.uuidv4();
  }
}
