import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, ImageBackground } from 'react-native';
import { firebase } from '../config';
import RNPickerSelect from 'react-native-picker-select';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState('user'); // Default role is 'user'

    // Function to register a new user
    const registerUser = async (email, password, displayName, role) => {
        try {
            // Create a new user with email and password
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = firebase.auth().currentUser;

            // Update the user's display name
            await user.updateProfile({
                displayName,
            });

            // Send email verification to the user
            await user.sendEmailVerification({
                handleCodeInApp: true,
                url: 'https://hitchhub-28a45.firebaseapp.com',
            });

            // Create a user document in Firestore with additional information
            await firebase.firestore().collection('users')
                .doc(user.uid)
                .set({
                    id: user.uid,
                    firstName,
                    lastName,
                    email,
                    displayName,
                    role,
                });

            alert('Verification email has been sent!');
        } catch (error) {
            alert(error.message);
        }
    }

    const fullName = `${firstName} ${lastName}`;

    return (
        <ImageBackground
            source={require('../assets/background.png')}
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <Image
                    source={require('../assets/HitchHub.png')}
                    style={styles.logo}
                />
                <Text style={styles.headerText}>Register</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='First Name'
                        onChangeText={(firstName) => setFirstName(firstName)}
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Last Name'
                        onChangeText={(lastName) => setLastName(lastName)}
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Email'
                        onChangeText={(email) => setEmail(email)}
                        autoCapitalize='none'
                        autoCorrect={false}
                        keyboardType='email-address'
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Password'
                        onChangeText={(password) => setPassword(password)}
                        autoCorrect={false}
                        secureTextEntry={true}
                    />
                </View>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Select Role:</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setSelectedRole(value)}
                        items={[
                            { label: 'User', value: 'user' },
                            { label: 'Driver', value: 'driver' },
                        ]}
                        value={selectedRole}
                        style={pickerSelectStyles}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => registerUser(email, password, fullName, selectedRole)}
                    style={styles.registerButton}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 26,
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    textInput: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 18,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#026efd',
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerLabel: {
        fontSize: 16,
        marginBottom: 10,
    },
    registerButton: {
        width: '70%',
        backgroundColor: '#026efd',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff',
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    logo: {
        width: 380,
        height: 200,
        marginBottom: 50,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#026efd',
        color: 'black',
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#026efd',
        color: 'black',
    },
});

export default Registration;
