export interface SchemaColumn {
  name: string;
  type: string;
  description: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface SchemaTable {
  name: string;
  description: string;
  columns: SchemaColumn[];
}
