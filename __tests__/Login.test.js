import { useNavigation } from '@react-navigation/native';

// Mock the useNavigation hook to return a mock navigation object
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import Login from '../src/Login';

jest.mock('../config', () => ({
    auth: () => ({}),
    firestore: () => ({}),
}));

describe('Login Component', () => {
    it('should render email and password inputs', () => {
        const { getByTestId } = render(<Login />);

        const emailInput = getByTestId('emailInput');
        const passwordInput = getByTestId('passwordInput');

        expect(emailInput).toBeTruthy();
        expect(passwordInput).toBeTruthy();
    });
});
