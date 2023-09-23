import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { firebase } from '../config';

const Profile = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [refresh, setRefresh] = useState(false);


    // Changing password
    const changePassword = () => {
        firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
            .then(() => {
                alert("Password reset email sent!")
            }).catch((error) => {
                alert(error)
            })
    }

    useEffect(() => {
        const user = firebase.auth().currentUser;

        const fetchUserData = async () => {
            if (user) {
                // Fetch user data from Firestore based on user UID
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    setDisplayName(user.displayName || '');
                    setEmail(user.email || '');
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setFullName(`${userData.firstName || ''} ${userData.lastName || ''}`);
                } else {
                    setDisplayName(user.displayName || '');
                    setEmail(user.email || '');
                }
            }
        };

        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                // Combine the first name and last name to create a new displayName
                const newDisplayName = `${firstName} ${lastName}`;

                // Update the user document in Firestore with the new first name and last name
                await firebase.firestore().collection('users').doc(user.uid).update({
                    firstName: firstName,
                    lastName: lastName,
                    displayName: newDisplayName
                });

                // Update the state with the new values
                setFirstName(firstName);
                setLastName(lastName);
                setFullName(newDisplayName); // Update fullName with the new combined name
                console.log('New displayName:', newDisplayName);

                setSuccessMessage('Profile updated successfully!');

                // Reset success message after 2 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 2000);
            } else {
                setError('User not found.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/background.png')}
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Profile</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                {successMessage && <Text style={styles.success}>{successMessage}</Text>}
                <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    value={fullName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={text => setFirstName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={text => setLastName(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    editable={false}
                />
                <TouchableOpacity
                    onPress={() => {
                        handleUpdateProfile();
                    }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        changePassword();
                    }}
                    style={[styles.button, styles.buttonMargin]}
                >
                    <Text style={styles.buttonText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        firebase.auth().signOut();
                    }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    success: {
        color: 'green',
        marginBottom: 10,
    },
});

export default Profile;
