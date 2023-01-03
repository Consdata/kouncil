import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SSOProvider} from "../login/sso-provider";

@Component({
  selector: 'app-common-login-sso',
  template: `
    <div class="sso-container">
      <div class="sso-label-container">
        <div class="divider divider-left"></div>
        <span class="sso-label">OR SIGN IN WITH</span>
        <div class="divider divider-right"></div>
      </div>
      <ng-container *ngFor="let provider of availableProviders">
        <button mat-button type="button" (click)="sso(getProviderData(provider).name)"
                class="sso-button">
          <img [src]="getProviderData(provider).icon" class="sso-provider-icon"
               [title]="getProviderData(provider).title" alt="logo">
        </button>
      </ng-container>
    </div>
  `,
  styleUrls: ['./common-login-sso.component.scss']
})
export class CommonLoginSsoComponent {

  @Output() ssoEvent: EventEmitter<string> = new EventEmitter<string>();
  @Input() availableProviders: Array<string>;

  private supportedProviders: Map<string, SSOProvider> = new Map<string, SSOProvider>([
    ['github', {name: 'github', icon: '/assets/github-mark.svg', title: 'GitHub'}],
  ]);

  constructor() {
  }

  sso(provider: string) {
    this.ssoEvent.emit(provider);
  }

  getProviderData(provider: string) {
    return this.supportedProviders.get(provider);
  }
}
