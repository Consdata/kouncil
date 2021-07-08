import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';
import {MessageHeader} from '../message-header';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackFilter} from '../../track/track-filter/track-filter';
import * as moment from 'moment';
import {TrackService} from '../../track/track.service';

@Component({
    selector: 'app-message-view',
    templateUrl: './message-view.component.html',
    styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {
    public isAnimationDone = false;

    constructor(
        private drawerService: DrawerService,
        private router: Router,
        private trackService: TrackService,
        private dialogRef: MatDialogRef<MessageViewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            topicName: string,
            key: string,
            source: string,
            headers: MessageHeader[],
            timestamp: number
        }) {
    }

    formatJson(object) {
        return JSON.stringify(object, null, 2);
    }

    resend() {
        this.dialogRef.close();
        this.drawerService.openDrawerWithPadding(SendComponent, {
            topicName: this.data.topicName,
            key: this.data.key,
            source: this.data.source,
            headers: this.data.headers
        });
    }

    ngOnInit(): void {
        // ngx datatable gets its width completely wrong
        // if displayed before container reaches its final size
        this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
            this.isAnimationDone = true;
        });
    }

    navigateToTrack(event): void {
        const element = event.event.target as HTMLElement;
        if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
            const date = new Date(this.data.timestamp);
            date.setMinutes(date.getMinutes() + 1);
            const trackFilter = new TrackFilter(
                event.row.key,
                event.row.value,
                moment(new Date(this.data.timestamp)).format('YYYY-MM-DDTHH:mm'),
                moment(date).format('YYYY-MM-DDTHH:mm'),
                [this.data.topicName]);
            console.log(trackFilter);
            this.trackService.storeTrackFilter(trackFilter);
            this.router.navigate(['/track']);
        }
    }
}

