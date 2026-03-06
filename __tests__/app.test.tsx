import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock axios lib (uses import.meta.env which isn't available in Jest)
jest.mock('../apps/web/src/lib/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock('../apps/web/src/app/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({ user: null, login: jest.fn(), logout: jest.fn() }),
}));

jest.mock('../apps/web/src/app/routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="app-routes">App Loaded</div>,
}));

import App from '../apps/web/src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });
});
