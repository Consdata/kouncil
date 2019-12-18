import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";

@Injectable()
export class JsonGrid {

  private static ROWS_LIMIT = 1000;
  private static FRESH_ROWS_TIMEOUT_MILLIS = 1000;

  private columns = new Set<Column>();
  private columnNames = new Set<string>();
  private rows: any[] = [];

  constructor(private datePipe: DatePipe) {
  }

  addObjects(objects: any[]) {
    let firstLoad = this.rows.length == 0;
    objects.forEach(object => {
      try {
        let row = {};
        if (object.valueJson) {
          this.handleObject(0, "", "", object.valueJson, row);
          console.log(this.columns)
        }
        row['kafkaCompanionKey'] = object.key;
        row['kafkaCompanionOffset'] = object.offset;
        row['kafkaCompanionPartition'] = object.partition;
        row['kafkaCompanionTimestamp'] = this.formatTimestamp(object.timestamp);
        row['kafkaCompanionTimestampEpoch'] = object.timestamp;
        row['kafkaCompanionValue'] = object.value;
        row['kafkaCompanionValueJson'] = object.valueJson;
        this.rows.unshift(row);
      } catch (e) {
        this.rows.unshift({});
      }
    });
    this.limitRows();
    if (!firstLoad) {
      let freshMessageTimestamp = objects[0].timestamp - JsonGrid.FRESH_ROWS_TIMEOUT_MILLIS;
      this.flagFreshRows(freshMessageTimestamp);
    }
    this.sortColumns();
  }

  getColumns(): Set<Column> {
    return this.columns;
  }

  getRows(): any[] {
    return this.rows;
  }


  private handleObject(level, prefix, prefixShort, object, row) {
    Object.keys(object).forEach(propertyName => {
      let propertyValue = object[propertyName];
      if (this.isScalar(propertyValue) || propertyValue === null) {
        this.addColumn(prefix + propertyName, prefixShort + propertyName);
        row[prefix + propertyName] = this.escapeHtml(this.limitChars(propertyValue));
      } else if (typeof propertyValue === 'object' && Array.isArray(propertyValue)) {
        this.addColumn(prefix + propertyName, prefixShort + propertyName);
        row[prefix + propertyName] = propertyValue.toString();
      }
    });
    Object.keys(object).forEach(propertyName => {
      let propertyValue = object[propertyName];
      if (typeof propertyValue === 'object' && !Array.isArray(propertyValue) && level <= 2 && propertyValue !== null) {
        this.handleObject(level + 1, prefix + propertyName + ".", prefixShort + propertyName.substr(0, 3) + "~.", propertyValue, row);
      }
    });
  }

  private limitChars(propertyValue) {
    if (typeof propertyValue === 'string') {
      return propertyValue.substr(0, 100);
    } else {
      return propertyValue;
    }
  }

  private escapeHtml(propertyValue) {
    if (typeof propertyValue === 'string') {
      return propertyValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
      return propertyValue;
    }
  }

  private isScalar(propertyValue: any) {
    return typeof propertyValue ===
      'string' ||
      typeof propertyValue ===
      'number' ||
      typeof propertyValue ===
      'boolean';
  }

  private limitRows() {
    this.rows.splice(JsonGrid.ROWS_LIMIT, this.rows.length - JsonGrid.ROWS_LIMIT);
  }

  private sortColumns() {
    let sorted = new Set<Column>();
    Array.from(this.columns.values()).forEach(column => {
      if (column.name.indexOf(".") === -1) {
        sorted.add(column);
      }
    });
    Array.from(this.columns.values()).forEach(column => {
      if (column.name.indexOf(".") > -1) {
        sorted.add(column);
      }
    });
    this.columns = sorted;
  }

  private flagFreshRows(freshMessageTimestamp: number) {
    this.rows.forEach(row => {
      row['fresh'] = row['kafkaCompanionTimestampEpoch'] > freshMessageTimestamp;
    });
  }

  private formatTimestamp(timestamp: number) {
    return this.datePipe.transform(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss.SSS');
  }


  private addColumn(name: string, nameShort: string) {
    if (!this.columnNames.has(name)) {
      this.columnNames.add(name);
      this.columns.add(new Column(name, nameShort));
    }
  }
}

export class Column {
  constructor(public name: string, public nameShort: string) {

  }
}
