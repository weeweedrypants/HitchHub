import React from 'react';
import { render } from '@testing-library/react-native';
import Dashboard from '../src/Dashboard';
import firebase from 'firebase/app';

// Import the test Firebase configuration
import firebaseConfig from './firebaseConfig.test';

// Mock dependencies that are used within the component
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Dashboard Component', () => {
  beforeAll(() => {
    // Initialize Firebase with the test configuration before running the tests
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  });

  afterAll(async () => {
    // Clean up Firebase after all tests (if needed)
    await firebase.app().delete();
  });

  it('should render without errors', () => {
    // Render the Dashboard component
    const { getByText } = render(<Dashboard />);

    expect(getByText('Hello')).toBeTruthy();
  });
});
