import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ViewMode} from '@app/common-utils';
import {ClusterService} from '../../cluster.service';

@Component({
  selector: 'app-cluster-actions',
  template: `
    <div class="actions">

      <button mat-button [disableRipple]="true" class="action-button-white test-connection-button"
              type="button" (click)="testConnection()"
              [disabled]="clusterForm.invalid"
              [ngClass]="{
        connected: testConnectionState === 'connected',
        unableToConnect: testConnectionState === 'failed'
        }">
        <div class="test-connection-btn-content">
          <ng-container *ngIf="testConnectionState === 'default'">
            <mat-icon class="material-symbols-outlined sync test-connection-icon">
              sync
            </mat-icon>
            Test connection
          </ng-container>

          <ng-container *ngIf="testConnectionState === 'connecting'">
            <mat-spinner class="small-spinner"></mat-spinner>
            Connecting...
          </ng-container>

          <ng-container *ngIf="testConnectionState === 'connected'">
            <mat-icon class="material-symbols-outlined check_circle test-connection-icon">
              check_circle
            </mat-icon>
            Connection successful
          </ng-container>

          <ng-container *ngIf="testConnectionState === 'failed'">
            <mat-icon class="material-symbols-outlined cancel test-connection-icon">
              cancel
            </mat-icon>
            Connection failed
          </ng-container>
        </div>
      </button>

      <button mat-button [disableRipple]="true" class="action-button-white"
              [routerLink]="['/clusters']">
        Cancel
      </button>

      <button *ngIf="isVisible([ViewMode.CREATE, ViewMode.EDIT])"
              mat-button [disableRipple]="true"
              class="action-button-black" type="submit"
              [disabled]="clusterForm.invalid">
        Save
      </button>

      <button *ngIf="isVisible([ViewMode.VIEW])"
              mat-button [disableRipple]="true"
              [routerLink]="['/clusters/cluster/', clusterName, 'edit']"
              class="action-button-white" type="button">
        Edit
      </button>
    </div>
  `,
  styleUrls: ['./cluster-form-actions.component.scss']
})
export class ClusterFormActionsComponent implements OnDestroy {

  @Input() clusterForm: FormGroup;
  @Output() testConnectionEvent: EventEmitter<void> = new EventEmitter<void>();
  @Input() viewMode: ViewMode;
  @Input() clusterName: string;

  ViewMode: typeof ViewMode = ViewMode;

  subscriptions: Subscription = new Subscription();

  testConnectionState: 'default' | 'connecting' | 'connected' | 'failed' = 'default';

  constructor(private cdr: ChangeDetectorRef,
              private clusterService: ClusterService) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  testConnection(): void {
    this.testConnectionState = 'connecting';
    this.subscriptions.add(this.clusterService.testConnection$(Object.assign({}, this.clusterForm.value)).subscribe(result => {
      if (result) {
        this.updateTestConnectionBtnState('connected');
      } else {
        this.updateTestConnectionBtnState('failed');
      }

      setTimeout(() => {
        this.updateTestConnectionBtnState('default');
      }, 5000);
    }));
  }

  updateTestConnectionBtnState($event: 'default' | 'connecting' | 'connected' | 'failed'): void {
    this.testConnectionState = $event;
    this.cdr.detectChanges();
  }

  isVisible(viewModes: ViewMode[]): boolean {
    return viewModes.includes(this.viewMode);
  }
}
