
import React, { useState, useCallback, useMemo, useRef} from 'react'
import MapView, { Marker } from 'react-native-maps'
import BottomSheet from '@gorhom/bottom-sheet';
import { lightColors, SearchBar } from '@rneui/themed'
import IconFA from 'react-native-vector-icons/FontAwesome'

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


const Mapview = ({ navigation }) => {

    const [searchTxt, setSearchTxt] = useState('')
    const bottomSheetRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    function updateSearchFunc(txt) {
        setSearchTxt(txt)
    }

    const snapPoints = useMemo(() => ['30%', '60%'], []);

    // callbacks
    const handleSheetChanges = useCallback( index => {
        console.log('handleSheetChanges', index);
    }, []);


  return (
    <View style={{backgroundColor:'white'}}>
        <SafeAreaView>
            <View style={{height:'100%'}}>

                <View style={{alignItems:'center'}}>
                    
                    <Text style={{fontSize:30, fontWeight:'bold'}}>WePee</Text>
                    
                    <View style={{height:60, flexDirection:'row',
                            justifyContent:'space-between', alignItems:'center', marginLeft:10, marginRight:10}}>
                        <IconFA name='sliders' size={25} color='darkgray' />
                        <SearchBar 
                            placeholder='looking for a bathroom?'
                            onChangeText={updateSearchFunc}
                            showCancel={true}
                            containerStyle={{flex:1, marginHorizontal:15,backgroundColor:lightColors.white, borderTopColor:'white'}}
                            value={searchTxt}/>
                        <IconFA name='plus' size={25} color='darkgray' 
                            onPress={() => navigation.navigate('Add')}/>
                    </View>
                
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

            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
            >
                <View style={{flex:1, alignItems:'center', padding:10}}>
                    <Text style={{fontSize:18, fontWeight:'bold'}} onPress={() => navigation.navigate('Details')}>
                        List of bathrooms near by. Press to display an empty details screen
                    </Text>
                </View>
            </BottomSheet>

        </SafeAreaView>
       
    </View>
 
  )
}

export default Mapview

const styles = StyleSheet.create({
    txt: {
        fontSize:12
    }
})