import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { firebase } from '../config';

const ForgetPassword = () => {
    // State for email input
    const [email, setEmail] = useState('');

    // Function to send a password reset email
    const sendPasswordResetEmail = () => {
        firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent!');
            })
            .catch((error) => {
                alert(error.message);
            });
    };

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
                <Text style={styles.headerText}>Reset Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        onChangeText={(email) => setEmail(email)}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                <TouchableOpacity onPress={sendPasswordResetEmail} style={styles.button}>
                    <Text style={styles.buttonText}>Send Reset Email</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default ForgetPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 26,
        marginBottom: 20,
    },
    inputContainer: {
        width: '80%',
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
    button: {
        marginTop: 50,
        height: 70,
        width: 250,
        backgroundColor: '#026efd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
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
        marginBottom: 20,
    },
});