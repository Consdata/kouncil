import { AfterContentChecked, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[autosize]'
})
export class AutosizeDirective implements AfterContentChecked {

  constructor(public element: ElementRef) {}

  @HostListener('input', ['$event.target'])
  public onInput() {
    this.resize();
  }

  public ngAfterContentChecked() {
    this.resize();
  }

  public resize() {
    const style = this.element.nativeElement.style;
    style.overflow = 'hidden';
    style.height = 'auto';

    const height = this.element.nativeElement.scrollHeight;
    style.height = `${height}px`;
  }

}
