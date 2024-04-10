import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandomStringGeneratorService {

  public getRandomString(): string {
    return (Math.random() + 1).toString(36).substring(7);
  }
}
