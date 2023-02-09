
import React, { useState, useCallback, useMemo, useRef, useEffect} from 'react'
import MapView, { Marker } from 'react-native-maps'
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, SearchBar, Icon, Switch} from '@rneui/themed'
import { getCurrentLocation } from '../modules/getLocation';
import firestore from '@react-native-firebase/firestore';
import { tags  } from '../modules/tags';


import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    FlatList,
    View,
    TouchableOpacity
  } from 'react-native';


const Mapview = ({ navigation, route }) => {
      // state to hold location, default is false. setLocation(something) sets location to something
    const [coordinate, setCoordinate] = useState();
    const [searchTxt, setSearchTxt] = useState('')
    const [bathrooms, setBathrooms] = useState([])
    const bottomSheetRef = useRef(null); //bottomSheetRef.current.snapToPosition('3%')

    // States to determine if tag is active or not
    const [cleanliness, setCleanliness] = useState(false)
    const [free, setFree] = useState(false)
    const [accessibility, setAccessibility] = useState(false)
    const [changing_station, setChangingStation] = useState(false)
    const [condoms_sale, setCondomsSale] = useState(false)
    const [period_products, setPeriodProducts] = useState(false)
    const [unisex, setUnisex] = useState(false)
    const [urinal, setUrinal] = useState(false)

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
    }, [route.params]);

    const mTags = [
        {   
            ...tags[0],
            state: [cleanliness, setCleanliness], 
        },
        {   
            ...tags[1],
            state: [free, setFree],  
        },
        {   
            ...tags[2],
            state: [accessibility, setAccessibility],
        },
        {   
            ...tags[3],
            state: [changing_station, setChangingStation],

        },
        {
            ...tags[4],
            state: [condoms_sale, setCondomsSale],
        },
        {
            ...tags[5],
            state: [period_products, setPeriodProducts],
        },
        {
            ...tags[6],
            state: [unisex,setUnisex],

        },
        {
            ...tags[7],
            state: [urinal,setUrinal],
        }
       
    ]

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


    // runs when a tag is pressed
    const onTagPress = (tag, index) => {
        // Change the tags state
        tag.state[1](!tag.state[0]);
        console.log(tag.name + ' state after: ' + tag.state[0]);
    }

    const fetchBathrooms = async () => {
        try {
            const snap = await firestore().collection('bathrooms').get()
            if (!snap.empty) setBathrooms(snap.docs)
        } catch (error) {
            console.log(error)
        }
    }

    function updateSearchFunc(txt) {
        setSearchTxt(txt)
    }

    const dougsTestFunc = () => {
        console.log("YOU PRESSED DOUGS SECRET BUTTON!")
        for(let i=0; i<mTags.length; i++){
            console.log(mTags[i].name + ' and state: ' + mTags[i].state[0]);
        }
    }

    const snapPoints = useMemo(() => ['30%', '60%'], []);

    // callbacks
    const handleSheetChanges = useCallback( index => {
        // console.log('handleSheetChanges', index);
    }, []);

    const horizontalTags = mTags.map((tag, index) => 
        <View key={tag.key}>
            <TouchableOpacity
                onPress={() => onTagPress(tag, index)}
                style = {tag.state[0] ? styles.tagButtonPressed : styles.tagButtonNotPressed}>
                <Icon 
                        name={tag.icon} 
                        type={ tag.iconType || "font-awesome-5" }
                        color='white' 
                        size={10} 
                        containerStyle={{width:15, height:15, backgroundColor:tag.iconColor,
                            borderRadius:3, padding:0, marginRight: 4, justifyContent:'center'}} />
                <Text style={styles.tagButtonText}>{tag.name}</Text>
            </TouchableOpacity>
        </View>
        )

    let bathroomMarkers;
    if (bathrooms.length >= 1) {
        bathroomMarkers = bathrooms.map(snap => {
            const bathroom = snap.data()
            if (bathroom.latitude && bathroom.longitude) {
                //console.log(bathroom);
                return (
                    <Marker
                        key={bathroom.id}
                        coordinate={{
                            latitude: bathroom.latitude,
                            longitude: bathroom.longitude,
                        }}
                        title={ bathroom.name || '' }
                        description={ bathroom.description || '' }
                    />
                );
                }
        });
    }

    const Item = ({ props, index, id }) => (
        <TouchableOpacity style={{width:'100%', backgroundColor: index % 2 ? 'lightgray' : null, 
            justifyContent:'center', padding:10, marginVertical: 5}}
            onPress={() => navigation.navigate('Details', {bathroomId: id})}>
        
            <View style={{flex:1, alignItems: 'center', flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={[styles.txt, {fontSize:16, fontWeight:'bold'}]}>{props.name}</Text> 
                <Text style={[styles.txt]}>{index} mi.</Text>  
            </View>
        </TouchableOpacity>
    )
   

    if (!coordinate) return <></>
    return (
        <View style={{backgroundColor:'white'}}>
            <SafeAreaView>
                <View style={{height:'100%'}}>
    
                    <View style={{alignItems:'center'}}>
                        
                        <Text style={{fontSize:30, fontWeight:'bold'}}>WePee</Text>
                        
                        <View style={{height:60, flexDirection:'row',
                                justifyContent:'flex-start', alignItems:'center', marginLeft:6, marginRight:10}}>
                             {/* <TouchableOpacity style={{width:40, height:40, borderRadius:20, justifyContent:'center'}} onPress={() => dougsTestFunc()}>
                                <Icon name='sliders' type='font-awesome' size={25} color='darkgray' />
                            </TouchableOpacity> */}
                            <SearchBar 
                                placeholder='Looking for a bathroom?'
                                onChangeText={updateSearchFunc}
                                showCancel={true}
                                inputContainerStyle={{borderRadius: 23}}
                                containerStyle={{flex:1, backgroundColor:lightColors.white, borderTopColor:'white'}}
                                value={searchTxt}/>
                            <TouchableOpacity style={{width:40, height:40, borderRadius:20, justifyContent:'center'}} onPress={() => navigation.navigate('Add')}>
                                <Icon name='plus' type='font-awesome' size={20} color='darkgray' />
                            </TouchableOpacity>
                           
                        </View>

                        <MapView
                            style={{width:'100%', height:'100%'}}
                            mapType="standard"
                            initialRegion={region}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            region={region}
                            onRegionChange={() => {}}>
                            
                            { bathroomMarkers }
                        </MapView>

                        <ScrollView 
                            style={{
                                position: 'absolute', //use absolute position to show the ScrollView on top of the map
                                top: 108, //for center align
                                alignSelf: 'flex-start', //for align to left
                                width: '100%',
                            }}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >

                            { horizontalTags }
                        </ScrollView>
                    
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
                            renderItem={({item, index}) => <Item props={item.data()} index={index} id={item.id}/>}
                            keyExtractor={item => item.id}
                            style={{width:'100%'}}/>
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
    },
    tagButtonNotPressed: {
        height: 36,
        flexDirection:'row',
        alignItems:'center',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        borderRadius: 100,
        backgroundColor: 'white',
        marginLeft: 3,
        marginRight: 3,
    },
    tagButtonPressed: {
    height: 36,
    flexDirection:'row',
    alignItems:'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 100,
    backgroundColor: 'gray',
    marginLeft: 3,
    marginRight: 3,
    },
    tagButtonText: {
        color:'black',
        //fontWeight: 'bold',
        //lineHeight: 15,
    }
})