export class TableGroup {

  level: number = 0;
  expanded: boolean = true;
  group: string;
  parent: TableGroup;

  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
}
