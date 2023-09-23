import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from '../config'

const ListingDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { listing, userId } = route.params;

    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user data from Firestore based on the userId
        const fetchUser = async () => {
            const userSnapshot = await firebase.firestore().collection('users').doc(userId).get();
            if (userSnapshot.exists) {
                setUser(userSnapshot.data());
            }
        };

        fetchUser();
    }, [userId]);

    // Function to initiate a chat with the listing's creator
    const initiateChat = async () => {
        try {
            // Fetch creator's data from Firestore based on the createdBy field in the listing
            const creatorSnapshot = await firebase.firestore().collection('users').doc(listing.createdBy).get();
            if (creatorSnapshot.exists) {
                const creator = creatorSnapshot.data();
                // Navigate to the ChatRoom screen with relevant parameters
                navigation.navigate('ChatRoom', {
                    otherUser: { uid: listing.createdBy, name: `${creator.firstName} ${creator.lastName}` },
                    userId: route.params.userId,
                    listingID: listing.id, 
                    createdBy: listing.createdBy, 
                    creatorFirstName: creator.firstName, 
                });
            } else {
                console.log('Creator not found in the database.');
            }
        } catch (error) {
            console.error('Error fetching creator data:', error);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/background.png')} 
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <Text style={styles.user}>Created by: {listing.creatorFirstName}</Text>
                <Text style={styles.detailText}>Pick-up Location: {listing.pickUpLocation}</Text>
                <Text style={styles.detailText}>Destination: {listing.destination}</Text>
                <Text style={styles.detailText}>Date: {listing.selectedDate}</Text>
                <Text style={styles.detailText}>Time: {listing.selectedTime}</Text>
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={initiateChat}
                >
                    <Text style={styles.chatButtonText}>Start Chat</Text>
                </TouchableOpacity>
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
    user: {
        fontSize: 16,
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
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
});

ListingDetails.navigationOptions = {
    headerTitle: () => <Header name="Listing Details" />,
    headerStyle: {
        height: 150,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        backgroundColor: '#00e4d0',
        shadowColor: '#000',
        elevation: 25,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 10,
    },
};

export default ListingDetails;
