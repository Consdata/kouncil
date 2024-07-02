import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {JsonGridData} from './json-grid-data';

export interface Column {
  name: string;
  nameShort: string;
}

@Injectable()
export class JsonGrid {

  private static ROWS_LIMIT: number = 1000;
  private static FRESH_ROWS_TIMEOUT_MILLIS: number = 1000;
  private static EXPAND_LIST_LIMIT: number = 10;
  private static EXPAND_OBJECT_LIMIT: number = 100;
  private static MAX_OBJECT_DEPTH: number = 3;

  private columns: Set<Column> = new Set<Column>();
  private columnNames: Set<string> = new Set<string>();
  private rows: unknown[] = [];

  constructor(private datePipe: DatePipe) {
  }

  private static isScalar(propertyValue: unknown): boolean {
    return (
      typeof propertyValue === 'string' ||
      typeof propertyValue === 'number' ||
      typeof propertyValue === 'boolean'
    );
  }

  private static escapeHtml(propertyValue: unknown) {
    if (typeof propertyValue === 'string') {
      return propertyValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    } else {
      return propertyValue;
    }
  }

  private static limitChars(propertyValue: unknown) {
    if (typeof propertyValue === 'string') {
      return propertyValue.substr(0, 100);
    } else {
      return propertyValue;
    }
  }

  replaceObjects(objects: JsonGridData[], formatPath: boolean = true, addColumn: boolean = true): void {
    this.columns = new Set<Column>();
    this.columnNames = new Set<string>();
    this.rows.length = 0;
    const firstLoad = this.rows.length === 0;
    objects.forEach((object) => {
      try {
        const row = {};
        if (object.headers) {
          object.headers.forEach((header) => {
            const headerPath = 'H[' + header.key + ']';
            row[headerPath] = header.value;
            if (addColumn) {
              this.addColumn(headerPath);
            }
          });
        }
        if (object.valueJson) {
          Object.keys(object.valueJson).forEach((propertyName) => {
            this.handleObject(
              0,
              object.valueJson[propertyName],
              row,
              propertyName,
              false,
              formatPath,
              addColumn
            );
          });
        }
        if (object.keyJson) {
          Object.keys(object.keyJson).forEach((propertyName) => {
            this.handleObject(
              0,
              object.keyJson[propertyName],
              row,
              propertyName,
              true,
              formatPath,
              addColumn
            );
          });
        }
        row['kouncilKey'] = object.key;
        row['kouncilKeyFormat'] = object.keyFormat;
        row['kouncilKeyJson'] = object.keyJson;
        row['kouncilOffset'] = object.offset;
        row['kouncilPartition'] = object.partition;
        row['kouncilTopic'] = object.topic;
        row['kouncilTimestamp'] = this.formatTimestamp(object.timestamp);
        row['kouncilTimestampEpoch'] = object.timestamp;
        row['kouncilValue'] = object.value;
        row['kouncilOriginalValue'] = object.originalValue;
        row['kouncilValueFormat'] = object.valueFormat;
        row['kouncilValueJson'] = object.valueJson;
        row['headers'] = object.headers;
        this.rows.unshift(row);
      } catch (e) {
        this.rows.unshift({});
      }
    });
    this.limitRows();
    if (!firstLoad) {
      if (objects.length > 0 && objects[0].timestamp) {
        const freshMessageTimestamp =
          objects[0].timestamp - JsonGrid.FRESH_ROWS_TIMEOUT_MILLIS;
        this.flagFreshRows(freshMessageTimestamp);
      }
    }
    this.sortColumns();
  }

  getColumns(): Set<Column> {
    return this.columns;
  }

  getRows(): unknown[] {
    return this.rows;
  }

  private handleObject(level: number, value: unknown, row: Record<string, unknown>, path: string, isKey: boolean, formatPath: boolean = true,
                       addColumn: boolean = true): void {
    if (level > JsonGrid.MAX_OBJECT_DEPTH) {
      return;
    }
    if (JsonGrid.isScalar(value) || value === null) {
      // scalar value
      const formattedPath = formatPath ? this.formatPath(path, isKey) : path;
      if (addColumn) {
        this.addColumn(formattedPath);
      }
      row[formattedPath] = JsonGrid.escapeHtml(JsonGrid.limitChars(value));
    } else if (typeof value === 'object' && Array.isArray(value)) {
      // array
      if (value.length <= JsonGrid.EXPAND_LIST_LIMIT) {
        value.forEach((arrayValue, i) =>
          this.handleObject(level + 1, arrayValue, row, `${path}[${i}]`, isKey, formatPath, addColumn)
        );
      } else {
        const formattedPath = formatPath ? this.formatPath(path, isKey) : path;
        if (addColumn) {
          this.addColumn(formattedPath);
        }
        row[formattedPath] = `[Array of ${value.length} elements]`;
      }
    } else {
      // object
      if (Object.keys(value).length <= JsonGrid.EXPAND_OBJECT_LIMIT) {
        Object.keys(value).forEach((property) =>
          this.handleObject(
            level + 1,
            value[property],
            row,
            `${path}.${property}`,
            isKey,
            formatPath,
            addColumn
          )
        );
      } else {
        const formattedPath = formatPath ? this.formatPath(path, isKey) : path;
        if (addColumn) {
          this.addColumn(formattedPath);
        }
        row[formattedPath] = `[Object with ${Object.keys(value).length} properties]`;
      }
    }
  }

  private shortenPath(path: string): string {
    return path
    .split('.')
    .map((p) => {
      const indexMatch = p.match('[[0-9]+]$');
      if (path.endsWith(p)) {
        return p;
      } else if (indexMatch) {
        return `${p.substr(0, 3)}~${indexMatch[0]}`;
      } else {
        return p.substr(0, 3) + '~';
      }
    })
    .join('.');
  }

  private limitRows(): void {
    this.rows.splice(
      JsonGrid.ROWS_LIMIT,
      this.rows.length - JsonGrid.ROWS_LIMIT
    );
  }

  private sortColumns(): void {
    const columnNames = Array.from(this.columns.values());
    const headerColumns = columnNames.filter(column => column.name.startsWith('H['));
    const keyColumns = columnNames.filter(column => column.name.startsWith('K['));
    const valueColumns = columnNames.filter(column => column.name.startsWith('V['));

    this.columns = new Set<Column>([
      ...headerColumns,
      ...keyColumns.sort((a, b) => a.name.includes('.') ? 1 : b.name.includes('.') ? -1 : 0),
      ...valueColumns.sort((a, b) => a.name.includes('.') ? 1 : b.name.includes('.') ? -1 : 0)
    ]);
  }

  private flagFreshRows(freshMessageTimestamp: number): void {
    this.rows.forEach((row) => {
      row['fresh'] = row['kouncilTimestampEpoch'] > freshMessageTimestamp;
    });
  }

  private formatTimestamp(timestamp: number | null): string | null {
    if (timestamp == null) {
      return null;
    }
    return this.datePipe.transform(
      new Date(timestamp),
      'yyyy-MM-dd HH:mm:ss.SSS'
    );
  }

  private addColumn(name: string): void {
    if (!this.columnNames.has(name)) {
      this.columnNames.add(name);
      this.columns.add({name, nameShort: this.shortenPath(name)});
    }
  }

  private formatPath(path: string, isKey: boolean): string {
    return isKey ? `K[${path}]` : `V[${path}]`;
  }
}
