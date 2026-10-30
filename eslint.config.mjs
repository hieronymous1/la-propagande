import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Flat-config equivalent of the former .eslintrc.json
// (`extends: ["next/core-web-vitals", "next/typescript"]`); `next lint` was removed in Next 16.
// `npm run lint` keeps the old `next lint` scope (app/, components/, lib/).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // New React Compiler rule pulled in by eslint-plugin-react-hooks 7 (eslint-config-next 16);
      // it was not part of the Next 14 rule set. Kept visible as a warning so the existing
      // mount-time effects (localStorage/matchMedia/searchParams sync) can be reviewed separately
      // without changing component behaviour in the framework upgrade.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
