module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.jest.json',
        diagnostics: false, // ← stops ts-jest from failing on import.meta errors
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/fileMock.cjs',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'apps/web/src/**/*.{ts,tsx}',
    '!apps/web/src/**/*.d.ts',
    '!apps/web/src/main.tsx',
  ],
  // Provide import.meta.env stubs for Vite files
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3000',
      },
    },
  },
};
