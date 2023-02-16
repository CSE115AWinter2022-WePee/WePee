import React, {useState, useEffect} from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Mapview from './screens/mapview';
import AddBathroomScreen from './screens/addBathroom';
import BathroomDetailsScreen from './screens/bathroomDetails';
import { ThemeProvider, createTheme, lightColors} from '@rneui/themed'
import IconFA from 'react-native-vector-icons/FontAwesome'
import auth from '@react-native-firebase/auth';


import {
  Platform,
  StyleSheet,
 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios
    }),
    // primary: '#e7e7e8',

  },
  darkColors: {
    primary: '#000',

  },
  mode: 'light',
  components: {
    SearchBar: {
      
    }
  }
})

const Stack = createNativeStackNavigator()


function App() {
  // This code was blatantly copied from the documentation for firebase auth
  // Check it out here: https://rnfirebase.io/auth/usage
  // If it works correctly, that means I (Yatrik) did something right
  // if it works incorrectly, it is Rohan's fault
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  function onAuthStateChanged(user) {
    setUser(user);
    console.log(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    auth()
    .signInAnonymously()
    .then(() => {
      console.log('User signed in anonymously');
    })
    .catch(error => {
      if (error.code === 'auth/operation-not-allowed') {
        console.log('Enable anonymous in your firebase console.');
      }

      console.error(error);
    });

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    console.log("initalizing")  
    return null
  };


  return (
    <GestureHandlerRootView style={{flex:1}}>

      <ThemeProvider theme={theme}>

        <SafeAreaProvider>

          <NavigationContainer>
            <Stack.Navigator initialRouteName='Mapview'>
              <Stack.Screen name="Mapview" 
                  component={Mapview}
                  options={{
                    headerShown:false
                  }} />
              <Stack.Screen name="Add" 
                  component={AddBathroomScreen}
                  options={{
                    headerTitle: 'Add Bathroom',
                    headerTitleStyle: {color: 'black'}
                  }} />
              <Stack.Screen name="Details" 
                  component={BathroomDetailsScreen}
                  options={{
                    headerTitle: 'Bathroom Details',
                    headerTitleStyle: {color: 'black'},
                  }} />
            </Stack.Navigator>
          </NavigationContainer>

        </SafeAreaProvider>

      </ThemeProvider>

    </GestureHandlerRootView>
    
  );
}

const styles = StyleSheet.create({
  txt: {
    fontSize: 24,
    fontWeight: '600'
  }

});

export default App;
