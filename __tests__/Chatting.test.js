import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Chatting from '../Chatting'; // Adjust the import path as needed

// Mock the firebase module
jest.mock('firebase', () => ({
  auth: jest.fn(() => ({
    currentUser: {
      uid: 'testUserId',
      displayName: 'TestUser',
    },
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            onSnapshot: jest.fn(),
          })),
          add: jest.fn(),
          delete: jest.fn(),
          get: jest.fn(),
        })),
      })),
      update: jest.fn(),
    })),
  })),
}));

describe('Chatting Component', () => {
  // Mock the navigation prop
  const navigation = {
    addListener: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  it('renders without errors', () => {
    const route = {
      params: {
        roomID: 'testRoomId',
        listingID: 'testListingId',
        createdBy: 'testCreatedBy',
        creatorFirstName: 'Test Creator',
      },
    };

    render(<Chatting route={route} navigation={navigation} />);
  });

  // Add more test cases here as needed
});
