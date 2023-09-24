import React from 'react';
import { render } from '@testing-library/react-native';
import Dashboard from '../src/Dashboard';
import firebase from 'firebase/app'; // Import only the necessary Firebase modules

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

    // You can add assertions here to check if certain elements are present in the rendered component
    // For example, you can check if a specific text is present in the component.
    expect(getByText('Hello')).toBeTruthy();
  });
});
