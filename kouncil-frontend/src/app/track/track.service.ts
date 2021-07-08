import {Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable, Subject} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';

@Injectable({
    providedIn: 'root'
})
export abstract class TrackService {

    private trackFilter: TrackFilter;
    private trackFilterChange: Subject<TrackFilter> = new Subject<TrackFilter>();
    trackFilterChange$: Observable<TrackFilter> = this.trackFilterChange.asObservable();

    protected constructor() {
    }

    abstract getEvents(serverId: string, trackFilter: TrackFilter): Observable<Message[]>;

    setTrackFilter(trackFilter: TrackFilter) {
        console.log(trackFilter);
        this.trackFilterChange.next(trackFilter);
    }

    storeTrackFilter(trackFilter: TrackFilter) {
        this.trackFilter = trackFilter;
    }

    getStoredTrackFilter() {
        return this.trackFilter;
    }
}
