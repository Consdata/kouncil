export interface TableColumn {

  name: string;
  prop: string;
  sticky: boolean;
  resizeable: boolean;
  sortable: boolean;
  draggable: boolean;
  width?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columnClass?: (value: any) => string;

}
