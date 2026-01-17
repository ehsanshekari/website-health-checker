import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'infra/cdk.out/**',
      '**/.nyc_output/**',
      '**/coverage/**'
    ]
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**/*.{ts,tsx,js,jsx}'
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    }
  },
  // Disable stylistic rules to align with Prettier, equivalent to extends: ['prettier']
  eslintConfigPrettier
];