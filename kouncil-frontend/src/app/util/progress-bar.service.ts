import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  progressSub: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  setProgress(progress: boolean) {
    this.progressSub.next(progress);
  }
}
