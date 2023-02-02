
import React, { useState, useCallback, useMemo, useRef} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'
import { Input } from '@rneui/themed'

import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    FlatList,
    View,
  } from 'react-native';

const AddBathroomScreen = () => {
    const inputRef = useRef(null)
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['30%', '60%'], []);

    // callbacks
    const handleSheetChanges = useCallback( index => {
        console.log('handleSheetChanges', index);
    }, []);

  return (
    <View style={{backgroundColor:'white'}}>
      <SafeAreaView >
            <View style={{height:'100%'}}>
                <MapView
                    style={{width:'100%', height:'70%'}}
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
                    <Input ref={inputRef} 
                        placeholder="Name" 
                        inputContainerStyle={{backgroundColor:'lightgrey', paddingHorizontal:10, paddingVertical:5, 
                                borderBottomColor:'lightgrey', borderRadius: 5}}/>
                    <Text style={{fontSize:14, fontWeight:'bold', marginTop:-10}}>1156 High St, Santa Cruz, CA 95064</Text>
                </View>
            </BottomSheet>
      </SafeAreaView>

    </View>
  )
}

export default AddBathroomScreen

const styles = StyleSheet.create({})

//CSE115AWinter2022-WePee/WePee
