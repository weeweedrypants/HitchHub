import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewListing from '../src/NewListing';

// Mock dependencies that are used within the component
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: jest.fn(), // Mock the useRoute function
}));

// Mock GooglePlacesAutocomplete
jest.mock('react-native-google-places-autocomplete', () => 'GooglePlacesAutocomplete');

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock firebase
jest.mock('../config', () => ({
  firebase: {
    auth: () => ({
      currentUser: {
        uid: 'testUserId',
      },
    }),
    firestore: () => ({
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: true, data: () => ({ role: 'user' }) }),
        }),
      }),
    }),
  },
}));

describe('NewListing Component', () => {
  it('should render without errors', () => {
    const { getByText, getByPlaceholderText } = render(<NewListing />);

    expect(getByText('Create Listing')).toBeTruthy();

    const pickUpLocationInput = getByPlaceholderText('Pick-up Location');
    fireEvent.changeText(pickUpLocationInput, 'Test Pick-up Location');
    expect(pickUpLocationInput.props.value).toBe('Test Pick-up Location');

  });
});
