import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Platform, TouchableOpacity, TouchableWithoutFeedback, Text, ImageBackground } from 'react-native';
import { firebase } from '../config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation, useRoute } from '@react-navigation/native';

const NewListing = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedPickUpLocation, setSelectedPickupLocation] = useState('');
    const [selectedDestination, setSelectedDestinationLocation] = useState('');

    const minDate = new Date();
    const navigation = useNavigation();
    const route = useRoute();

    // Handle Date change
    const handleDateChange = (event, newDate) => {
        if (newDate !== undefined) {
            setSelectedDate(newDate);
        }
        setShowDatePicker(false);
    };

    // Handle time change 
    const handleTimeChange = (event, newTime) => {
        if (newTime !== undefined) {
            setSelectedTime(newTime);
        }
        setShowTimePicker(false);
    };

    // Handle "Done" button press for date and time pickers
    const handleDonePress = () => {
        setShowDatePicker(false);
    };

    // Create new listing
    const createListing = async () => {
        const user = firebase.auth().currentUser;
        if (user) {
            try {
                const userSnapshot = await firebase.firestore().collection('users').doc(user.uid).get();
                const userRole = userSnapshot.data()?.role; // Get the user's role

                // Fetch user's information from the database
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                const firstName = userDoc.data()?.firstName; // Get the first name

                const formattedTime = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;

                // Generate a unique ID for the listing
                const listingID = firebase.firestore().collection('listings').doc().id;

                // Create the listing with the generated ID
                await firebase.firestore().collection('listings').doc(listingID).set({
                    listingID: listingID,
                    pickUpLocation: selectedPickUpLocation,
                    destination: selectedDestination,
                    createdBy: user.uid,
                    creatorFirstName: firstName,
                    creatorRole: userRole,
                    selectedDate: selectedDate.toDateString(),
                    selectedTime: formattedTime,
                });

                alert('Listing created successfully with ID: ' + listingID);
            } catch (error) {
                console.error('Error creating listing:', error);
            }
        }
    };


    return (
        <ImageBackground
            source={require('../assets/background.png')}
            style={styles.imageBackground}
        >
            <View style={styles.container}>
                <GooglePlacesAutocomplete
                    styles={{ container: styles.autoInput, textInput: styles.autoContainer }}
                    placeholder="Pick-up Location"
                    onPress={(data, details = null) => {
                        setSelectedPickupLocation(data.description);
                    }}
                    query={{
                        key: 'AIzaSyAOufpGRkE_1FWpcfmUYIw995WTdauNv9M',
                        language: 'en', // Language of the results
                    }}
                    autoFocus={true} // Auto-focus the input to show suggestions immediately
                    listViewDisplayed="auto" // Display suggestions automatically
                    renderDescription={data => data.description}
                />
                <GooglePlacesAutocomplete
                    styles={{ container: styles.autoInput, textInput: styles.autoContainer }}
                    placeholder="Destination Location"
                    onPress={(data, details = null) => {
                        setSelectedDestinationLocation(data.description);
                    }}
                    query={{
                        key: 'AIzaSyAOufpGRkE_1FWpcfmUYIw995WTdauNv9M',
                        language: 'en',
                    }}
                    autoFocus={true}
                    listViewDisplayed="auto"
                    renderDescription={data => data.description}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>
                        Selected Date: {selectedDate.toDateString()}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <>
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            is24Hour={true}
                            minimumDate={minDate}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                        <Button title="Done" onPress={handleDonePress} />
                    </>
                )}

                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.timeText}>
                        Selected Time: {selectedTime.getHours().toString().padStart(2, '0')}:
                        {selectedTime.getMinutes().toString().padStart(2, '0')}
                    </Text>
                </TouchableOpacity>

                {showTimePicker && (
                    <>
                        <DateTimePicker
                            value={selectedTime}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleTimeChange}
                        />
                        <Button title="Done" onPress={handleDonePress} />
                    </>
                )}
                <Button title="Create Listing" onPress={createListing} />
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
        backgroundColor: 'transparent',
    },
    input: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        fontSize: 18,
        width: '80%',
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
    },
    dateContainer: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
        marginRight: 10,
    },
    timeContainer: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 18,
        marginRight: 10,
    },
    autoInput: {
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        marginTop: 10,
        height: 40,
        width: '100%',
    },
    autoContainer: {
        flex: 0,
    },
    imageBackground: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
});

export default NewListing;
