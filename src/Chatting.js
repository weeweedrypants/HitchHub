import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../config';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Chatting = ({ route, navigation }) => {
    const { roomID, listingID, createdBy, creatorFirstName } = route.params; // Extract necessary parameter
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isFocused, setIsFocused] = useState(true);
    const currentUser = firebase.auth().currentUser;
    const currentUserID = currentUser?.uid;
    const [isTripCompleted, setIsTripCompleted] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);

    // Check if the current user is the sender
    const isSender = currentUserID === createdBy; // Check if the current user is the sender

    // Effect to handle timer expiration
    useEffect(() => {
        const { roomID, listingID, createdBy, creatorFirstName, completedBy, listingDetails } = route.params || {};
        console.log('roomID:', roomID);
        console.log('listingID:', listingID);
        console.log('createdBy:', createdBy);
        console.log('creatorFirstName:', creatorFirstName);
        console.log('completedBy:', completedBy);
        console.log('listingDetails:', listingDetails);
        const timer = setTimeout(() => {
            setTimerExpired(true);
        }, 900000); // 60,000 milliseconds = 1 minute <- please change this to 1 minute to test as 
        // this is set for the actual 15 minutes

        return () => {
            clearTimeout(timer);
        };
    }, []);

    // Function to render the cancel button based on trip status and timer expiration
    const renderCancelButton = () => {
        if (isTripCompleted || timerExpired) {
            return (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCompleteTrip}
                >
                    <Text style={styles.cancelButtonText}>Complete Ride</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelChat}
                >
                    <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                </TouchableOpacity>
            );
        }
    };

    // Function to mark unread messages as read
    const markMessagesAsRead = async () => {
        const messagesRef = firebase.firestore().collection('chatRooms').doc(roomID).collection('messages');
        const unreadMessages = messages.filter(message => message.receiver.id === currentUserID && !message.isRead);

        if (isFocused && unreadMessages.length > 0) { // Check if the screen is in focus
            const batch = firebase.firestore().batch();
            unreadMessages.forEach(message => {
                const messageRef = messagesRef.doc(message.id);
                batch.update(messageRef, { isRead: true });
            });

            await batch.commit();
        }
    };

    // Effect to fetch and listen to messages and track focus
    useEffect(() => {
        markMessagesAsRead();

        const timer = setInterval(() => {
            if (!isTripCompleted) {
                setElapsedTime(prevTime => prevTime + 1);
            }
        }, 1000);

        const unsubscribe = firebase
            .firestore()
            .collection('chatRooms')
            .doc(roomID)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                const messageData = [];
                snapshot.forEach((doc) => {
                    messageData.push(doc.data());
                });
                setMessages(messageData);
            });

        const unsubscribeFocus = navigation.addListener('focus', () => {
            setIsFocused(true);
            markMessagesAsRead();
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            setIsFocused(false);
        });

        return () => {
            clearInterval(timer);
            unsubscribe();
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [roomID, navigation, isTripCompleted]);

    // Function to handle completing the trip
    const handleCompleteTrip = async () => {
        try {
            // Perform actions to mark the trip as completed
            console.log('Listing ID:', listingID); // Logging the listing ID to check if it's correct
            console.log('Trip marked as completed.');
            try {
                // Create a reference to the listing document
                const listingRef = firebase.firestore().collection('listings').doc(listingID);

                // Update the isListingVisible field to false
                await listingRef.update({ isListingVisible: false });
                console.log('Listing visibility updated successfully.');
            } catch (error) {
                console.error('Error updating listing visibility:', error);
            }

            // Create a reference to the current chat room
            const chatRoomRef = firebase.firestore().collection('chatRooms').doc(roomID);

            // Get the chat room data
            const chatRoomData = (await chatRoomRef.get()).data();

            // Move the chat room to the "completedChats" collection
            const completedChatsRef = firebase.firestore().collection('completedChats');

            // Define the data for the completed chat
            const completedChatData = {
                ...chatRoomData,
                completedBy: currentUserID, // Add the ID of the user who completed the chat
            };

            // Add the completed chat to the "completedChats" collection
            await completedChatsRef.add(completedChatData);

            // Delete the chat room document
            await chatRoomRef.delete();

            // Delete all messages in the chat room
            const messagesSnapshot = await chatRoomRef.collection('messages').get();
            messagesSnapshot.forEach(async (messageDoc) => {
                await messageDoc.ref.delete();
            });

            setIsTripCompleted(true); // Marking the trip as completed for button change

            navigation.navigate('History', {
                roomID: roomID,
                createdBy: createdBy,
                creatorFirstName: creatorFirstName,
                completedBy: currentUserID,
                listingID: listingID,
            });
        } catch (error) {
            console.error('Error marking trip as completed:', error);
        }
    };

    // Function to get the user's current location
    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setUserLocation(newLocation);
            console.log('userLocation after setting:', newLocation);
            handleSendMessage(true, newLocation); // Pass the newLocation to handleSendMessage
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    // Function to handle sending a message
    const handleSendMessage = async (isLocation, locationData) => {
        console.log('userLocation before sending:', locationData);
        if ((newMessage.trim() !== '' || isLocation) && currentUser) {
            const senderID = currentUserID;
            const senderName = currentUser.displayName || 'Unknown';
            const receiverID = isSender ? createdBy : currentUserID;
            const receiverName = isSender
                ? creatorFirstName
                : currentUser.displayName || 'Unknown';

            const newMessageData = {
                text: newMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sender: {
                    id: senderID,
                    name: senderName,
                },
                receiver: {
                    id: receiverID,
                    name: receiverName,
                },
                location: isLocation ? locationData : null,
                isLocation: isLocation,
            };

            console.log('Sending new message data:', newMessageData);

            await firebase
                .firestore()
                .collection('chatRooms')
                .doc(roomID)
                .collection('messages')
                .add(newMessageData);

            setNewMessage('');
            setUserLocation(null);
        }
    };

    // Function to handle canceling the chat
    const handleCancelChat = async () => {
        try {
            // Delete the chat room document
            await firebase.firestore().collection('chatRooms').doc(roomID).delete();

            // Delete all messages in the chat room
            const messagesSnapshot = await firebase.firestore().collection('chatRooms').doc(roomID).collection('messages').get();
            messagesSnapshot.forEach(async (messageDoc) => {
                await messageDoc.ref.delete();
            });

            // Navigate back to the Chats screen
            navigation.goBack();
        } catch (error) {
            console.error('Error canceling chat:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Chatting with {isSender ? creatorFirstName : currentUser.displayName || 'Unknown'}
                </Text>
                {renderCancelButton()}
            </View>

            <FlatList
                inverted
                data={messages}
                keyExtractor={(item, index) => {
                    if (item.timestamp && item.timestamp.toDate()) {
                        return item.timestamp.toDate().toString() + index.toString();
                    }
                    return index.toString();
                }}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.sender.id === currentUserID ? styles.senderMessage : styles.receiverMessage
                    ]}>
                        {item.isLocation ? (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: item.location.latitude,
                                    longitude: item.location.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                <Marker coordinate={item.location} />
                            </MapView>
                        ) : (
                            <Text style={styles.messageText}>
                                {item.text}
                            </Text>
                        )}
                        <Text style={styles.timestamp}>
                            {item.timestamp ? item.timestamp.toDate().toString() : ''}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage(false)}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={() => getCurrentLocation()}>
                    <Text style={styles.sendButtonText}>Send Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageContainer: {
        backgroundColor: '#F3F3F3',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 10,
    },
    messageText: {
        fontSize: 16,
    },
    map: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginVertical: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#026efd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        alignSelf: 'flex-end',
    },
    senderMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // Example color for sender's message background
        marginRight: 10,
        marginLeft: 50,
    },

    receiverMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF', // Example color for receiver's message background
        marginLeft: 10,
        marginRight: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderBottomWidth: 1, // Add a bottom border to separate the header and messages
        borderColor: '#D3D3D3',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    acceptButton: {
        backgroundColor: 'green', // Change to your desired color
    },
    acceptButtonText: {
        color: 'white', // Change to a suitable text color for the green background
    },
});

export default Chatting;
