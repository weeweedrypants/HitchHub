// firebase config key setup

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
//import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

//firebase web app configuration
const firebaseConfig = {
    apiKey: "AIzaSyALrZyTdYXUsrzMPINvUYiWByH37U-GM0k",
    authDomain: "hitchhub-28a45.firebaseapp.com",
    projectId: "hitchhub-28a45",
    storageBucket: "hitchhub-28a45.appspot.com",
    messagingSenderId: "432480759082",
    appId: "1:432480759082:web:cdda9be7967aa449780253",
    measurementId: "G-LJHFN62R2M"
  };

  if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }
  export const auth = firebase.auth();
  export const firestore = firebase.firestore();
  export{firebase};