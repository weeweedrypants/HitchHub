import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ImageBackground, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { firebase } from '../config'

const Dashboard = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [listings, setListings] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredlistings, setFilteredlistings] = useState([]);
    const [noResults, setNoResults] = useState(false);

    useEffect(() => {
        firebase.firestore().collection('users')
            .doc(firebase.auth().currentUser.uid).get()
            .then((snapshot) => {
                if (snapshot.exists) {
                    setName(snapshot.data())
                    setUserRole(snapshot.data().role); // Assuming user's role is stored in 'role' field
                }
                else {
                    console.log('User does not exist')
                }
            })
    }, []);

    // Fetch and filter listings based on user role and search text
    useEffect(() => {
        const listingsRef = firebase.firestore().collection('listings');
        let query = listingsRef;

        if (userRole === 'user') {
            query = query.where('creatorRole', '==', 'driver'); // Query listings with 'driver' role
        } else if (userRole === 'driver') {
            query = query.where('creatorRole', '==', 'user'); // Query listings with 'user' role
        }

        const unsubscribe = query.onSnapshot((snapshot) => {
            const listingData = [];
            snapshot.forEach((doc) => {
                listingData.push({ id: doc.id, ...doc.data() });
            });

            // Filter listings based on search text
            const filtered = listingData.filter((item) => {
                const locationMatch = item.pickUpLocation && item.pickUpLocation.toLowerCase().includes(searchText.toLowerCase());
                const destinationMatch = item.destination && item.destination.toLowerCase().includes(searchText.toLowerCase());
                return locationMatch || destinationMatch;
            });
            setListings(listingData);
            setFilteredlistings(filtered);
            setNoResults(filtered.length === 0);
        });

        return () => unsubscribe();
    }, [userRole, searchText]);


    return (
        <ImageBackground
            source={require('../assets/background.png')}
            style={styles.imageBackground}
        >
            <Text style={styles.topHeader}><Text style={styles.appName}>Hitch Rides</Text></Text>
            <SafeAreaView style={styles.container}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by location or destination"
                    onChangeText={(text) => setSearchText(text)}
                    value={searchText}
                />
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Text style={styles.headerText}>Hello {userRole.charAt(0).toUpperCase() + userRole.slice(1)} {name.firstName}!</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('NewListing', { firstName: name.firstName })}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {noResults && (
                    <Text style={styles.noResultsText}>
                        {searchText.trim() === '' ? 'No available hitch rides' : 'No matching results'}
                    </Text>
                )}

                <FlatList
                    data={filteredlistings.length > 0 ? filteredlistings : listings} // Use filtered listings if available, otherwise use all listings
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.listingItem}
                            onPress={() => {
                                navigation.navigate('ListingDetails',
                                    {
                                        listing: item,
                                        firstName: name.firstName,
                                        userId: firebase.auth().currentUser.uid,
                                    });
                            }}>
                            <Text style={styles.userName}>Created by: {item.creatorFirstName}</Text>
                            {item.pickUpLocation && <Text style={styles.listingInfo}>Pick Up Location: {item.pickUpLocation}</Text>}
                            {item.destination && <Text style={styles.listingInfo}>Destination: {item.destination}</Text>}
                            {item.selectedDate && <Text style={styles.listingInfo}>Date: {new Date(item.selectedDate).toDateString()}</Text>}
                            {item.selectedTime && (
                                <Text style={styles.listingInfo}>
                                    Time: {new Date(`2000-01-01T${item.selectedTime}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </ImageBackground>
    )
}

export default Dashboard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#026efd',
        borderRadius: 50,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        marginTop: 20,
        height: 70,
        width: 250,
        backgroundColor: '#026efd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    buttonText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: 'purple',
        borderRadius: 20,
        paddingLeft: 15,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        padding: 10
    },
    topHeader: {
        textAlign: 'center',
        padding: 10
    },
    listingItem: {
        padding: 10,
        marginBottom: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: 'gray',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#026efd',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        letterSpacing: 2,
    },
})