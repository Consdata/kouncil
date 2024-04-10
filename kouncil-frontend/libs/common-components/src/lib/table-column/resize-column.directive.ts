import {Directive, OnInit, Renderer2, Input, ElementRef} from '@angular/core';

@Directive({
  selector: '[appResizeColumn]'
})
export class ResizeColumnDirective implements OnInit {
  @Input('appResizeColumn') resizable: boolean;

  @Input() index: number;

  private startX: number;

  private startWidth: number;

  private column: HTMLElement;

  private table: HTMLElement;

  private pressed: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.column = this.el.nativeElement;
  }

  ngOnInit(): void {
    if (this.resizable) {
      const row = this.renderer.parentNode(this.column);
      const thead = this.renderer.parentNode(row);
      this.table = this.renderer.parentNode(thead);

      const resizer = this.renderer.createElement('span');
      this.renderer.addClass(resizer, 'resize-holder');
      this.renderer.appendChild(this.column, resizer);
      this.renderer.listen(resizer, 'mousedown', this.onMouseDown);
      this.renderer.listen(this.table, 'mousemove', this.onMouseMove);
      this.renderer.listen('document', 'mouseup', this.onMouseUp);
    }
  }

  onMouseDown: (event: MouseEvent) => void = (event: MouseEvent): void => {
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
  };

  onMouseMove: (event: MouseEvent) => void = (event: MouseEvent): void => {
    const offset = 35;
    if (this.pressed && event.buttons) {
      this.renderer.addClass(this.table, 'resizing');

      // Calculate width of column
      const width = this.startWidth + (event.pageX - this.startX - offset);

      const tableCells = Array.from(this.table.querySelectorAll('.mat-mdc-row')).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row: any) => row.querySelectorAll('.mat-mdc-cell').item(this.index)
      );

      // Set table header width
      this.renderer.setStyle(this.column, 'min-width', `${width}px`);

      // Set table cells width
      for (const cell of tableCells) {
        this.renderer.setStyle(cell, 'min-width', `${width}px`);
      }
    }
  };

  onMouseUp: () => void = (): void => {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, 'resizing');
    }
  };
}
