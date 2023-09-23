import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ImageBackground, Image, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../config';
import RNPickerSelect from 'react-native-picker-select';
import { ScrollView } from 'react-native-gesture-handler';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('user');

    const loginUser = async (email, password) => {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Fetch user data from Firestore
            const userSnapshot = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userSnapshot.exists) {
                const userData = userSnapshot.data();

                // Check if selected role matches the role in the database
                if (userData.role === selectedRole) {
                    // Role matches, proceed with login
                    // Continue with your navigation or other logic here
                } else {
                    // Role doesn't match, show an error message
                    alert('Selected role does not match the role in the firebase.');
                    // Log the user out and navigate back to the login page
                    await firebase.auth().signOut();
                    navigation.navigate('Login');
                    return; // Exit early
                }
            } else {
                // User data doesn't exist in the database, handle accordingly
                alert('User data not found in the database.');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRoleChange = (value) => {
        setSelectedRole(value);
    };

    return (
        <ImageBackground
            source={require('../assets/background.png')}
            style={styles.imageBackground}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/HitchHub.png')}
                        style={styles.logo}
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 26 }}>
                        Welcome to HitchHub!
                    </Text>
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInput}
                            placeholder='Email'
                            onChangeText={(email) => setEmail(email)}
                            autoCapitalize='none'
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInput}
                            placeholder='Password'
                            onChangeText={(password) => setPassword(password)}
                            autoCapitalize='none'
                            autoCorrect={false}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Select Role:</Text>
                        <RNPickerSelect
                            onValueChange={handleRoleChange}
                            items={[
                                { label: 'User', value: 'user' },
                                { label: 'Driver', value: 'driver' },
                            ]}
                            style={pickerSelectStyles}
                            value={selectedRole}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => loginUser(email, password)}
                    style={styles.button}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Registration')}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        Don't have an account? Register Here!
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 380,
        height: 200,
        marginBottom: 50,
    },
    inputContainer: {
        width: '80%',
        alignItems: 'center',
        marginTop: 30,
    },
    inputBox: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    textInput: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 20,
    },
    button: {
        height: 70,
        width: 250,
        backgroundColor: '#026efd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    pickerContainer: {
        marginTop: 20,
    },
    pickerLabel: {
        fontSize: 16,
        marginBottom: 10,
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
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


export default Login;
