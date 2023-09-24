import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { firebase } from '../config';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the appropriate icon component


const Chats = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState([{ id: 'placeholder', roomName: 'Loading...' }]);
    const [currentUserID, setCurrentUserID] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    setCurrentUserID(user.uid);
                }
            });

            const unsubscribeChatRooms = firebase.firestore().collection('chatRooms')
                .where('participants', 'array-contains', currentUserID)
                .onSnapshot((snapshot) => {
                    const chatRoomData = [];
                    snapshot.forEach(async (doc) => {
                        const chatRoom = { id: doc.id, ...doc.data(), messages: [], unreadMessages: 0 };
                        console.log('Chat room data:', chatRoom); // Check if 'listingID' is present

                        // Fetch all messages for the chat room
                        const messagesSnapshot = await firebase.firestore()
                            .collection('chatRooms')
                            .doc(chatRoom.id)
                            .collection('messages')
                            .orderBy('timestamp', 'desc')
                            .get();

                        const messages = [];
                        let latestMessage = null; // Store the latest message

                        messagesSnapshot.forEach((messageDoc) => {
                            const message = messageDoc.data();
                            messages.push(message);

                            if (!latestMessage || message.timestamp > latestMessage.timestamp) {
                                latestMessage = message;
                            }
                        });

                        chatRoom.messages = messages;

                        // Calculate the unreadMessages count
                        chatRoom.unreadMessages = messages.reduce((count, message) => {
                            if (!message.isRead && message.receiver.id === currentUserID) {
                                return count + 1;
                            }
                            return count;
                        }, 0);

                        // Assign the latest message as the lastMessage
                        chatRoom.lastMessage = latestMessage;

                        chatRoomData.push(chatRoom);
                    });
                    setChatRooms(chatRoomData);
                });

            return () => {
                unsubscribeChatRooms();
            };
        }, [currentUserID])
    );

    const flatListRef = useRef(null);


    const markMessagesAsRead = async (roomID, messageID) => {
        if (!messageID) {
            console.log('Invalid message ID');
            return;
        }
        console.log('Marking message as read. Room ID:', roomID, 'Message ID:', messageID);

        const messageRef = firebase.firestore()
            .collection('chatRooms')
            .doc(roomID)
            .collection('messages')
            .doc(messageID);

        try {
            const messageDoc = await messageRef.get();

            if (messageDoc.exists) {
                console.log('Message exists. Updating read status.');
                // Perform the update operation here
                await messageRef.update({ isRead: true });

                // Update the unreadMessages count for the sender
                const senderID = messageDoc.data().sender.id;
                console.log('Sender ID:', senderID);
                console.log('Current User ID:', currentUserID);

                setChatRooms(prevChatRooms => {
                    const updatedChatRooms = prevChatRooms.map(chatRoom => {
                        if (chatRoom.id === roomID) {
                            if (chatRoom.lastMessage.sender.id === senderID) {
                                chatRoom.unreadMessages = 0;
                            } else if (chatRoom.lastMessage.receiver.id === currentUserID) {
                                chatRoom.unreadMessages = chatRoom.unreadMessages - 1;
                            }
                        }
                        return chatRoom;
                    });
                    console.log('Updated Chat Rooms:', updatedChatRooms);
                    return updatedChatRooms;
                });
            } else {
                console.log(`Message with ID ${messageID} does not exist.`);
                // Handle the case where the message doesn't exist
            }
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/background.png')} // Replace with your background image path
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Chat Rooms</Text>
                <FlatList
                    ref={flatListRef}
                    data={chatRooms}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.chatRoomItem,
                                item.unreadMessages > 0 && styles.unreadChatRoomItem, // Apply styles for unread chat rooms
                            ]}
                            onPress={() => {
                                console.log('Pressed chat room:', item.id);
                                console.log('Listing ID:', item.listingID); // Add this line
                                console.log('Pressed chat room:', item.id);
                                const lastMessage = item.lastMessage;
                                if (lastMessage) { // Check if there's a last message
                                    markMessagesAsRead(item.id, lastMessage.id); // Pass lastMessage.id instead of item.lastMessage.id
                                }
                                navigation.navigate('Chatting', {
                                    roomID: item.id,
                                    listingOwnerID: item.listingOwnerID,
                                    listingID: item.listingID,
                                    creatorFirstName: item.roomName,
                                });
                            }}
                        >
                            <View style={styles.chatRoomContent}>
                                <Text style={styles.chatRoomName}>{item.roomName}</Text>
                                {item.lastMessage && (
                                    <View style={styles.lastMessageContainer}>
                                        <Text style={styles.lastMessageText}>
                                            {item.lastMessage.sender.id === currentUserID
                                                ? 'You:'
                                                : `${item.lastMessage.sender.name || 'Unknown'}:`}{' '}
                                            {item.lastMessage.text}
                                        </Text>
                                        <Text style={styles.lastMessageTime}>
                                            {item.lastMessage.timestamp.toDate().toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {item.unreadMessages > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{item.unreadMessages}</Text>
                                    <Icon
                                        name="circle" // Change this to the FontAwesome icon name you want to use
                                        size={12}
                                        color="red"
                                        style={styles.unreadIcon}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chatRoomItem: {
        backgroundColor: '#F3F3F3',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatRoomContent: {
        flex: 1,
    },
    chatRoomName: {
        fontSize: 16,
    },
    lastMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    lastMessageText: {
        fontSize: 14,
        color: 'gray',
        flex: 1,
    },
    lastMessageTime: {
        fontSize: 14,
        color: 'gray',
    },
    unreadText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover', // You can use 'contain' or 'stretch' depending on how you want the image to be displayed
    },
    // unreadChatRoomItem: {
    // borderWidth: 2, // Change the border width for unread chat rooms
    // borderColor: 'red', // Change the border color for unread chat rooms
    //  },
});

export default Chats;
