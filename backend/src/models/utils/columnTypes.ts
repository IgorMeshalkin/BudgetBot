export enum ColumnType {
  SMALLINT = 'smallint',
  INTEGER = 'int',
  BIGINT = 'bigint',
  DECIMAL = 'decimal',
  NUMERIC = 'numeric',
  REAL = 'real',
  DOUBLE_PRECISION = 'double precision',
  MONEY = 'money',

  CHAR = 'char',
  VARCHAR = 'varchar',
  TEXT = 'text',
  CITEXT = 'citext',

  UUID = 'uuid',
  XML = 'xml',
  JSON = 'json',
  JSONB = 'jsonb',

  BYTEA = 'bytea',

  DATE = 'date',
  TIME = 'time',
  TIME_WITH_TIME_ZONE = 'time with time zone',
  TIME_WITHOUT_TIME_ZONE = 'time without time zone',
  TIMESTAMP = 'timestamp',
  TIMESTAMP_WITH_TIME_ZONE = 'timestamptz',
  TIMESTAMP_WITHOUT_TIME_ZONE = 'timestamp without time zone',
  INTERVAL = 'interval',

  BOOLEAN = 'boolean',

  ENUM = 'enum',

  POINT = 'point',
  LINE = 'line',
  LSEG = 'lseg',
  BOX = 'box',
  PATH = 'path',
  POLYGON = 'polygon',
  CIRCLE = 'circle',

  CIDR = 'cidr',
  INET = 'inet',
  MACADDR = 'macaddr',

  TSVECTOR = 'tsvector',
  TSVECTOR_ARRAY = 'tsvector[]',
  TSVECTOR_MULTI = 'tsvector[]',

  ARRAY = 'array', // используется с `type: 'varchar', array: true` и т.п.
}