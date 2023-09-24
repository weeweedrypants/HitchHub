import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { firebase } from '../config';

// Function to create a new chat room in Firestore
const createChatRoom = async (participants, roomName, listingOwnerID, listingID) => {
    console.log('Creating chat room with participants:', participants);

    // Add a new chat room document to the 'chatRooms' collection
    const chatRoomRef = await firebase.firestore().collection('chatRooms').add({
        participants,
        roomName,
        listingOwnerID,
        listingID,
        createdAt: new Date(),
    });

    console.log('Chat room created with ID:', chatRoomRef.id);

    // Return the ID of the created chat room
    return chatRoomRef.id;
};

const ChatRoom = ({ route, navigation }) => {
    const userId = firebase.auth().currentUser?.uid;
    const { otherUser, listingID, createdBy, creatorFirstName } = route.params;
    console.log('Received creatorFirstName:', creatorFirstName);
    const [chatRoomID, setChatRoomID] = useState(null);

    useEffect(() => {
        const handleStartChat = async () => {
            if (!userId) {
                console.log('User ID is not available.');
                return;
            }

            console.log('userId:', userId);
            console.log('Navigating to Chatting screen with listingID:', listingID);

            // Fetch the current user's data from Firestore
            const userSnapshot = await firebase.firestore().collection('users').doc(userId).get();
            const user = userSnapshot.data();

            console.log('Fetched user:', user);

            if (!user || !otherUser || !otherUser.uid) {
                console.log('Invalid user data.');
                return;
            }

            const participants = [userId, otherUser.uid];
            const roomName = `${creatorFirstName || 'Other User'}`;
            const listingOwnerID = createdBy; // Set listingOwnerID based on createdBy
            console.log('Participants array:', participants);

            // Create a new chat room and get the ID
            const newChatRoomID = await createChatRoom(participants, roomName, listingOwnerID, listingID, creatorFirstName);
            console.log('test yes:', creatorFirstName);
            setChatRoomID(newChatRoomID);

            // Navigate to the Chatting screen and pass relevant data
            navigation.navigate('Chatting', {
                roomID: newChatRoomID,
                listingID: listingID,
                createdBy: createdBy,
                creatorFirstName: creatorFirstName,
            });
        };

        handleStartChat();
    }, [userId, otherUser, listingID, createdBy, creatorFirstName, navigation]);

    return (
        <ImageBackground
            source={require('../assets/background.png')} 
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Start a Chat</Text>
                <Text style={styles.description}>Chat with {otherUser.displayName}</Text>
                {chatRoomID ? (
                    <TouchableOpacity
                        style={styles.chatButton}
                        disabled={!chatRoomID}
                    >
                        <Text style={styles.chatButtonText}>Go to Chat</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.loadingText}>Creating chat room...</Text>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 18,
        marginBottom: 20,
    },
    chatButton: {
        backgroundColor: '#026efd',
        borderRadius: 50,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    chatButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingText: {
        fontSize: 18,
        marginTop: 20,
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
});

export default ChatRoom;
