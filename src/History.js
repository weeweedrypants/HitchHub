import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firebase } from '../config';
import { auth } from '../config';

const History = () => {
    const route = useRoute();
    const {
        roomID,
        listingID,
        createdBy,
        creatorFirstName,
        listingDetails,
    } = route.params || {};

    // State to hold user's history
    const [userHistory, setUserHistory] = useState([]);

    // Function to fetch and set user's history
    const fetchUserHistory = async () => {
        try {
            // Get the current user's ID from Firebase Authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error('No user is currently logged in.');
                // Handle this situation (e.g., redirect to login).
                return;
            }

            const currentUserID = currentUser.uid;

            // Query the Firestore collection for user's history based on participation
            const historyQuery = await firebase
                .firestore()
                .collection('completedChats')
                .where('participants', 'array-contains', currentUserID) // Check if user is a participant
                .get();

            const userHistoryData = [];

            // Fetch listing details for each history item
            for (const doc of historyQuery.docs) {
                const historyItem = doc.data();

                // Fetch listing details based on listingID
                if (historyItem.listingID) {
                    const listingDoc = await firebase
                        .firestore()
                        .collection('listings')
                        .doc(historyItem.listingID)
                        .get();

                    // Attach listing details to history item
                    historyItem.listingDetails = listingDoc.data();
                }

                userHistoryData.push(historyItem);
            }

            setUserHistory(userHistoryData);
        } catch (error) {
            console.error('Error fetching user history:', error);
        }
    };

    useEffect(() => {
        // Fetch and set user's history when the component mounts
        fetchUserHistory();
    }, []);

    return (
        <ImageBackground
            source={require('../assets/background.png')} 
            style={styles.imageBackground}
        >
            <Text style={styles.topHeader}><Text style={styles.appName}>Ride History</Text></Text>
            <View style={styles.container}>
                {userHistory.length === 0 ? (
                    <Text>No history available.</Text>
                ) : (
                    <FlatList
                        data={userHistory}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.historyItem}>
                                <Text>Listing ID: {item.listingID}</Text>
                                {item.listingDetails ? (
                                    <>
                                        <Text>Destination: {item.listingDetails.destination}</Text>
                                        <Text>Pickup Location: {item.listingDetails.pickUpLocation}</Text>
                                    </>
                                ) : (
                                    <Text>No listing details available</Text>
                                )}
                            </View>
                        )}
                    />
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    historyItem: {
        borderWidth: 1,
        borderColor: 'purple',
        padding: 8,
        marginVertical: 8,
        borderRadius: 20, 
        paddingLeft: 15, 
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover', 
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#026efd', 
        letterSpacing: 2,
        textTransform: 'uppercase', 
        marginBottom: 10, 
        fontFamily: 'Arial', 
    },
    topHeader: {
        textAlign: 'center',
        padding: 10
    },
});

export default History;
