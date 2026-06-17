import * as migration_20260401_163108_migration from './20260401_163108_migration';
import * as migration_20260616_144946 from './20260616_144946';

export const migrations = [
  {
    up: migration_20260401_163108_migration.up,
    down: migration_20260401_163108_migration.down,
    name: '20260401_163108_migration',
  },
  {
    up: migration_20260616_144946.up,
    down: migration_20260616_144946.down,
    name: '20260616_144946'
  },
];
