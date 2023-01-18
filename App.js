import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';


function App() {

  return (
    <SafeAreaView style={{flex:1}}>
      <View style={{display:'flex', flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{fontSize: 60, fontWeight:'bold'}}>WePee</Text>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  txt: {
    fontSize: 24,
    fontWeight: '600'
  }

});

export default App;
