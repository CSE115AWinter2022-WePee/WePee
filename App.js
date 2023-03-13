import React, { useState, useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Mapview from './screens/mapview'
import AddBathroomScreen from './screens/addBathroom'
import BathroomDetailsScreen from './screens/bathroomDetails'
import ProfileScreen from './screens/profilePage'
import { ThemeProvider, createTheme, lightColors } from '@rneui/themed'
import auth from '@react-native-firebase/auth'
import { SocialButton } from 'react-native-login-screen'
import { anonymousLogin, onGoogleButtonPress } from './modules/login'

import {
  View,
  Image,
  Platform,
  StyleSheet,
  Text
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const theme = createTheme({
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios
    })
    // primary: '#e7e7e8',

  },
  darkColors: {
    primary: '#000'

  },
  mode: 'light',
  components: {
    SearchBar: {

    }
  }
})

const Stack = createNativeStackNavigator()

function App () {
  // This code was blatantly copied from the documentation for firebase auth
  // Check it out here: https://rnfirebase.io/auth/usage
  // If it works correctly, that means I (Yatrik) did something right
  // if it works incorrectly, it is Rohan's fault
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState()

  function onAuthStateChanged (user) {
    console.log('auth state changed')
    setUser(user)
    console.log(user)
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber
  }, [])

  if (!user) {
    return (
      <View style={styles.buttonsStyle}>
        <Text style={{ fontSize: 50, fontWeight: 'bold', color: '#3C99DC', opacity: 1 }}>
          WePee
        </Text>
        <Image source={require('./assets/logo.png')} style={{ width: 200, height: 200 }} />
        <SocialButton
          text='Continue with Google'
          imageSource={require('./assets/google.png')}
          onPress={onGoogleButtonPress}
        />
        {/* The javscript:void() just prevents it from rendering the facebook icon (default logo) */}
        <SocialButton
          text='Skip login'
          onPress={anonymousLogin}
        />
      </View>
    )
  };

  const d = new Date(user.metadata.creationTime)
  const daysInApp = Math.abs((Date.now() - d.valueOf()) / 86400000)
  const displayName = (user.displayName || 'WePee User ' + user.uid.replace(/\D/g, ''))

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <ThemeProvider theme={theme}>

        <SafeAreaProvider>

          <NavigationContainer>
            <Stack.Navigator initialRouteName='Mapview'>
              <Stack.Screen
                name='Mapview'
                component={Mapview}
                options={{
                  headerShown: false
                }} initialParams={{ displayName, uid: user.uid, photoURL: user.photoURL, isAnonymous: user.isAnonymous, daysInApp }}
              />
              <Stack.Screen
                name='Add'
                component={AddBathroomScreen}
                options={{
                  headerTitle: 'Add Bathroom',
                  headerTitleStyle: { color: 'black' }
                }}
              />
              <Stack.Screen
                name='Details'
                component={BathroomDetailsScreen}
                options={{
                  headerTitle: 'Bathroom Details',
                  headerTitleStyle: { color: 'black' }
                }}
              />
              <Stack.Screen
                name='Profile'
                component={ProfileScreen}
                options={{
                  headerTitle: 'Profile',
                  headerTitleStyle: { color: 'black' }
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>

        </SafeAreaProvider>

      </ThemeProvider>

    </GestureHandlerRootView>

  )
}

const styles = StyleSheet.create({
  txt: {
    fontSize: 24,
    fontWeight: '600'
  },
  // Default units in react native = dp (density-dependent pixels)
  buttonsStyle: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white'
  }
})

export default App
