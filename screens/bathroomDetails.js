import React, { useState, useCallback, useMemo, useRef} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'

import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView 
} from 'react-native'

const BathroomDetailsScreen = () => {

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['50%', '70%'], []);

    // callbacks
    const handleSheetChanges = useCallback( index => {
        console.log('handleSheetChanges', index);
    }, []);

  return (
    <View style={{backgroundColor:'white'}}>
      <SafeAreaView >
            <View style={{height:'100%'}}>
                <MapView
                    style={{width:'100%', height:'50%'}}
                    mapType="standard"
                    initialRegion={region}
                    region={region}
                    onRegionChange={() => {}}>
                    <Marker
                        key={1}
                        coordinate={{
                            latitude: 37.78825,
                            longitude: -122.4324
                        }}
                        title= "Origin"
                        description= "Origin"/>

                </MapView>

                
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                style={{marginBottom:0}}
            >
                <View style={{flex:1, alignItems:'center', padding:10}}>
                    <Text style={{fontSize:20, fontWeight:'bold'}}>
                        Bathroom Details will be added here
                    </Text>
                </View>
            </BottomSheet>
      </SafeAreaView>
    </View>
  )
}

export default BathroomDetailsScreen

const styles = StyleSheet.create({})