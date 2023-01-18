
import React, {useState} from 'react'
import MapView, { Marker } from 'react-native-maps'

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
  } from 'react-native';


const Mapview = () => {

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
  return (
    <View style={{width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
        <MapView
            style={{width:'100%', height:'100%', position:'absolute'}}
            mapType="standard"
            initialRegion={region}
            region={region}
            onRegionChange={() => {}}
        >
            <Marker
                key={1}
                coordinate={{
                    latitude: 37.78825,
                    longitude: -122.4324
                }}
                title= "Origin"
                description= "Origin"
            />

        </MapView>
    </View>
 
  )
}

export default Mapview

const styles = StyleSheet.create({})