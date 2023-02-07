import React from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Mapview from './screens/mapview';
import AddBathroomScreen from './screens/addBathroom';
import BathroomDetailsScreen from './screens/bathroomDetails';
import { ThemeProvider, createTheme, lightColors} from '@rneui/themed'
import IconFA from 'react-native-vector-icons/FontAwesome'

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
