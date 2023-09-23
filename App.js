import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { firebase } from './config';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ImageBackground, View } from 'react-native';

import Login from "./src/Login";
import Registration from "./src/Registration";
import Dashboard from "./src/Dashboard";
import Header from "./components/Header";
import ForgotPassword from "./src/ForgotPassword";
import NewListing from "./src/NewListing";
import ListingDetails from "./src/ListingDetails";
import ChatRoom from "./src/ChatRoom";
import Chatting from "./src/Chatting";
import Chats from "./src/Chats";
import Profile from "./src/Profile";
import History from "./src/History";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle User State Changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? (
        // If the user is authenticated, show the app's main tab navigation
        <Tab.Navigator>
          <Tab.Screen
            name="Home"
            component={DashboardStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="dashboard" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Ride History"
            component={HistoryScreenStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="history" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Chat"
            component={ChatsStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="comments" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Edit Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="user" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="ListingDetails"
            component={ListingDetails}
            options={{
              tabBarButton: () => null, // Hide from tab bar
            }}
          />
          <Tab.Screen
            name="ChatRoom"
            component={ChatRoom}
            options={{
              tabBarButton: () => null, // Hide from tab bar
            }}
          />
          <Tab.Screen
            name="Chatting"
            component={Chatting}
            options={{
              tabBarButton: () => null, // Hide from tab bar
            }}
          />
          <Tab.Screen
            name="NewListing"
            component={NLStack}
            options={{
              tabBarButton: () => null, // Hide from tab bar
            }}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              header: () => (
                <ImageBackground
                  source={require('./assets/background.png')}
                  style={{
                    flex: 1,
                    resizeMode: 'cover',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Header name="Hitch Rides" />
                  </View>
                </ImageBackground>
              ),
            }}
          />
          <Stack.Screen
            name="Registration"
            component={Registration}
            options={{
              header: () => (
                <ImageBackground
                  source={require('./assets/background.png')}
                  style={{
                    flex: 1,
                    resizeMode: 'cover',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Header name="Hitch Rides" />
                  </View>
                </ImageBackground>
              ),
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{
              header: () => (
                <ImageBackground
                  source={require('./assets/background.png')}
                  style={{
                    flex: 1,
                    resizeMode: 'cover',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Header name="Hitch Rides" />
                  </View>
                </ImageBackground>
              ),
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

function DashboardStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          header: () => (
            <ImageBackground
              source={require('./assets/background.png')}
              style={{
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Header name="Hitch Rides" />
              </View>
            </ImageBackground>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function HistoryScreenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={History}
        options={{
          header: () => (
            <ImageBackground
              source={require('./assets/background.png')}
              style={{
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Header name="Hitch Rides" />
              </View>
            </ImageBackground>
          ),
        }}
      />
    </Stack.Navigator>
  )
}

function NLStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NewListing"
        component={NewListing}
        options={{
          header: () => (
            <ImageBackground
              source={require('./assets/background.png')}
              style={{
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Header name="Hitch Rides" />
              </View>
            </ImageBackground>
          ),
        }}
      />
    </Stack.Navigator>
  )
}

function ChatsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Chats"
        component={Chats}
        options={{
          header: () => (
            <ImageBackground
              source={require('./assets/background.png')}
              style={{
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Header name="Hitch Rides" />
              </View>
            </ImageBackground>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function ProfileScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: () => (
            <ImageBackground
              source={require('./assets/background.png')}
              style={{
                flex: 1,
                resizeMode: 'cover',
                justifyContent: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Header name="Hitch Rides" />
              </View>
            </ImageBackground>
          ),
        }}
      />
    </Stack.Navigator>
  )
}

export default App;
