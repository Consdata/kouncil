export class SelectableItem {

  label: string;
  value: string;
  selected: boolean;

  constructor(label: string, value: string, selected: boolean) {
    this.label = label;
    this.value = value;
    this.selected = selected;
  }
}
