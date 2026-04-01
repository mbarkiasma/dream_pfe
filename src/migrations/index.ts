import * as migration_20260401_163108_migration from './20260401_163108_migration';

export const migrations = [
  {
    up: migration_20260401_163108_migration.up,
    down: migration_20260401_163108_migration.down,
    name: '20260401_163108_migration'
  },
];
