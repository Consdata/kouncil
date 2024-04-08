import {Injectable} from '@angular/core';
import {RandomIntGeneratorService} from './random-int-generator.service';

@Injectable({
  providedIn: 'root'
})
export class RandomBooleanGeneratorService {

  constructor(private intGeneratorService: RandomIntGeneratorService) {
  }

  public getRandomBoolean(): boolean {
    return this.intGeneratorService.getRandomInt() % 2 === 0;
  }
}
