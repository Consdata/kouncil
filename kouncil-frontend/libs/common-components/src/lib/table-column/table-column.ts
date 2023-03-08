export interface TableColumn {

  name: string;
  prop: string;
  sticky: boolean;
  resizeable: boolean;
  sortable: boolean;
  draggable: boolean;
  width?: number;
  valueFormatter?: (value: any) => string;

}
