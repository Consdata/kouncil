import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomFloatGeneratorService {

  private readonly MIN_RANDOM_NUMBER: number = 1;
  private readonly MAX_RANDOM_NUMBER: number = 1000;

  public getRandomFloat(): number {
    return Math.random() * (this.MAX_RANDOM_NUMBER - this.MIN_RANDOM_NUMBER) + this.MIN_RANDOM_NUMBER;
  }
}
