import {Injectable} from '@angular/core';
import {RandomStringGeneratorService} from './random-string-generator.service';

@Injectable({
  providedIn: 'root'
})
export class RandomBytesGeneratorService {

  constructor(private stringGeneratorService: RandomStringGeneratorService) {
  }

  public getRandomBytes(): string {
    return this.stringGeneratorService.getRandomString();
  }
}
