
import React, { useState, useCallback, useMemo, useRef, useEffect} from 'react'
import MapView, { Marker } from 'react-native-maps'
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, SearchBar, Icon } from '@rneui/themed'
import { getCurrentLocation } from '../modules/getLocation';
import firestore from '@react-native-firebase/firestore';


import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    FlatList,
    View,
    TouchableOpacity
  } from 'react-native';


const Mapview = ({ navigation }) => {
      // state to hold location, default is false. setLocation(something) sets location to something
    const [coordinate, setCoordinate] = useState();
    const [searchTxt, setSearchTxt] = useState('')
    const [bathrooms, setBathrooms] = useState([])
    const bottomSheetRef = useRef(null);

    // set default region
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    //call getCurrentLocation, have it set location and region details
    useEffect(() => {
       _getLocation()
       fetchBathrooms()
    }, []);

    const _getLocation = async () => {
        try {
            const { coordinates, region } = await getCurrentLocation()
            setCoordinate(coordinates)
            setRegion(region)
            // cache location data
            await AsyncStorage.setItem('coordinates', JSON.stringify(coordinates))
            await AsyncStorage.setItem('region', JSON.stringify(region))
        } catch (error) {
            console.log(error)
        }
       
    }

    const fetchBathrooms = async () => {
        try {
            const snap = await firestore().collection('bathrooms').get()
            if (!snap.empty) setBathrooms(snap.docs.map(doc => doc._data))
        } catch (error) {
            console.log(error)
        }
    }

    function updateSearchFunc(txt) {
        setSearchTxt(txt)
    }

    const snapPoints = useMemo(() => ['30%', '60%'], []);

    // callbacks
    const handleSheetChanges = useCallback( index => {
        console.log('handleSheetChanges', index);
    }, []);

    const Item = ({ props, index, id }) => (
        <TouchableOpacity style={{width:'100%', backgroundColor: index % 2 ? 'lightgray' : null, 
            justifyContent:'center', padding:10, marginVertical: 5}}
            onPress={() => navigation.navigate('Details', {bathroomId: id})}>
        
            <View style={{flex:1, alignItems: 'center', flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={[styles.txt, {fontSize:16, fontWeight:'bold'}]}>{props.name}</Text> 
                <Text style={[styles.txt]}>{index} mil</Text>  
            </View>
        </TouchableOpacity>
    
    )

    console.log("bathroom[0]: ")
    console.log(bathrooms[0]);
    //console.dir(bathrooms[0]);
    //console.log('bathroom name: ' + bathrooms[0]);

    let bathroomMarkers;
    if (bathrooms.length > 0) {
    bathroomMarkers = bathrooms.map(bathroom => {
        if (bathroom.latitude && bathroom.longitude) {
            console.log('bathroom data: ');
            console.log(bathroom);
            return (
                <Marker
                key={bathroom.id}
                coordinate={{
                    latitude: bathroom.latitude,
                    longitude: bathroom.longitude,
                }}
                title={bathroom.name ? bathroom.name : ''}
                description={bathroom.description ? bathroom.description : ''}
                />
            );
            }
    });
    }

    if (!coordinate) return <></>
    return (
        <View style={{backgroundColor:'white'}}>
            <SafeAreaView>
                <View style={{height:'100%'}}>
    
                    <View style={{alignItems:'center'}}>
                        
                        <Text style={{fontSize:30, fontWeight:'bold'}}>WePee</Text>
                        
                        <View style={{height:60, flexDirection:'row',
                                justifyContent:'space-between', alignItems:'center', marginLeft:10, marginRight:10}}>
                             <TouchableOpacity style={{width:40, height:40, borderRadius:20, justifyContent:'center'}} onPress={() => navigation.navigate('Add')}>
                                <Icon name='sliders' type='font-awesome' size={25} color='darkgray' />
                            </TouchableOpacity>
                            <SearchBar 
                                placeholder='looking for a bathroom?'
                                onChangeText={updateSearchFunc}
                                showCancel={true}
                                containerStyle={{flex:1, marginHorizontal:15,backgroundColor:lightColors.white, borderTopColor:'white'}}
                                value={searchTxt}/>
                            <TouchableOpacity style={{width:40, height:40, borderRadius:20, justifyContent:'center'}} onPress={() => navigation.navigate('Add')}>
                                <Icon name='plus' type='font-awesome' size={20} color='darkgray' />
                            </TouchableOpacity>
                           
                        </View>
                    
                        <MapView
                            style={{width:'100%', height:'70%'}}
                            mapType="standard"
                            initialRegion={region}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                            region={region}
                            onRegionChange={() => {}}>
                            
                            {bathroomMarkers}
                        </MapView>
                    
                    </View>
    
                </View>
    
                <BottomSheet
                    ref={bottomSheetRef}
                    index={0}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                >
                    <View style={{flex:1, alignItems:'center', padding:0}}>
                        <FlatList
                            data={bathrooms}
                            renderItem={({item, index}) => <Item props={item} index={index} id={item.id}/>}
                            keyExtractor={item => item.id}
                            style={{width:'100%'}}/>
                        {/* <Text style={{fontSize:18, fontWeight:'bold', color:'black'}} onPress={() => navigation.navigate('Details')}>
                            List of bathrooms near by. Press to display an empty details screen
                        </Text> */}
                    </View>
                </BottomSheet>
    
            </SafeAreaView>
            
        </View>
        
    )

  
}

export default Mapview

const styles = StyleSheet.create({
    txt: {
        fontSize:14,
        color:'black'
    }
})