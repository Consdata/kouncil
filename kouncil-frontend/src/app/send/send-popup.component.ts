import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild} from "@angular/core";
import * as M from 'materialize-css';

@Component({
  selector: 'app-send-popup',
  template: `
    <div #popup id="send-popup" class="modal">
      <div class="modal-content">
        <app-send ></app-send>
      </div>
    </div>`
})
export class SendPopupComponent implements AfterViewInit, OnDestroy {
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('popup') private popup: ElementRef;
  private popupInstance: any;
  topicName: string = '';
  key: string = '';
  value: string = '';

  ngAfterViewInit(): void {
    this.popupInstance = new M.Modal(this.popup.nativeElement, {});
  }

  ngOnDestroy(): void {
    this.popupInstance.destroy();
  }

  public openPopup(topicName: string, key: string = '', value: string = ''): void {
    this.setValues(topicName, key, value);
    this.popupInstance.open();
  }

  close(event: boolean): void {
    this.setValues()
    this.popupInstance.close();
    this.onClose.emit(event);
  }

  private setValues(topicName: string = '', key: string = '', value: string = ''): void {
    this.topicName = topicName;
    this.key = key;
    this.value = value;
  }
}
