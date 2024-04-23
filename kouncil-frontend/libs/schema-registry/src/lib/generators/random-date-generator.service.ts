import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomDateGeneratorService {

  public getRandomDate(): number {
    return new Date(+new Date() - Math.random() * (1e+12)).getTime();
  }

  public getTimeSinceMidnight(): number {
    const date = this.getRandomDate();
    const midnight = new Date(date).setHours(0, 0, 0, 0);
    return date - midnight;
  }
}
