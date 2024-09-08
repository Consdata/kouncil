export class SelectableItem {

  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  selected: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  constructor(label: string, value: any, selected: boolean) {
    this.label = label;
    this.value = value;
    this.selected = selected;
  }
}
