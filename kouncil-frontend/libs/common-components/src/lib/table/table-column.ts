export interface TableColumn {

  name: string;
  prop: string;
  sticky: boolean;
  resizeable: boolean;
  sortable: boolean;
  draggable: boolean;
  width?: number;
  isDate?: boolean;
  dateFormat?: string;

}
