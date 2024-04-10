import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomIntGeneratorService {

  private readonly MIN_RANDOM_NUMBER: number = 1;
  private readonly MAX_RANDOM_NUMBER: number = 1000;

  public getRandomInt(): number {
    return Math.floor(Math.random() * (this.MAX_RANDOM_NUMBER - this.MIN_RANDOM_NUMBER + 1)) + this.MIN_RANDOM_NUMBER;
  }
}
