
import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input, Icon, Switch } from '@rneui/themed'
import firestore from '@react-native-firebase/firestore';
import { tags  } from '../modules/tags';

import {
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    Alert,
    View,
  } from 'react-native';

  import { ScrollView } from 'react-native-gesture-handler'


const AddBathroomScreen = ({ navigation }) => {
    // tag states
    const [name, setName] = useState()
    const [desc, setDesc] = useState()
    const [cleanliness, setCleanliness] = useState(false)
    const [free, setFree] = useState(false)
    const [accessibility, setAccessibility] = useState(false)
    const [changing_station, setChangingStation] = useState(false)
    const [condoms_sale, setCondomsSale] = useState(false)
    const [period_products, setPeriodProducts] = useState(false)
    const [unisex, setUnisex] = useState(false)
    const [urinal, setUrinal] = useState(false)

    const [pinnedCoordinate, setPinnedCoordinate] = useState({ latitude: null, longitude: null });
    const [coordinate, setCoordinate] = useState({ latitude: 37.78825, longitude: -122.4324 });
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['30%', '60%'], []);
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    //call getCurrentLocation, have it set location and region details
    useEffect(() => {
        _getLocation()
     }, []);

     useLayoutEffect(() => {
        navigation.setOptions({
            headerRight:() => <Icon 
                                    name='check' 
                                    size={25} 
                                    color='darkgray'
                                    type='font-awesome' 
                                    onPress={ () => addBathroom() }/>   
        })
     })
 
     const _getLocation = async () => {
        // fetch from cached data
         try {
             const coordinates = await AsyncStorage.getItem('coordinates')
             const region  = await  AsyncStorage.getItem('region')
             setCoordinate(JSON.parse(coordinates))
             setPinnedCoordinate(JSON.parse(coordinates))
             setRegion(JSON.parse(region))
         } catch (error) {
             console.log(error)
         }
        
     }

     const addBathroom = async () => {
        try {
            if (!name || name.length <= 2) {
                showAlert("Bathroon name", "Please add a name")
                return
            }
            const exists = await doesBathroomExist()
            if (exists) {
                showAlert("Bathroom exists", "Please add a different bathroom")
                return
            }

            const id = firestore().collection('bathrooms').doc().id
            const data = {
                name: name,
                description: desc || "",
                latitude: pinnedCoordinate.latitude,
                longitude: pinnedCoordinate.longitude,
                cleanliness: cleanliness,
                free: free,
                accessibility: accessibility,
                changing_station: changing_station,
                condoms_sale: condoms_sale,
                period_products: period_products,
                unisex: unisex,
                urinal: urinal,
                id: id,
                rating: 0
            }
            await firestore().collection('bathrooms').doc(id).set(data)

            showAlert("Success", 
                        "Bathroom added succesfully", 
                        () => { navigation.navigate('Mapview', {reload: true}) })
            
           
        } catch (error) {
            console.log("adding bathroom to db error ", error.message)
        }
        

     }

     const doesBathroomExist = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const snap = await firestore().collection('bathrooms')
                            .where('latitude', '==', pinnedCoordinate.latitude)
                            .where('longitude', '==', pinnedCoordinate.longitude)
                            .get()
                snap.empty ? resolve(false) : resolve(true)
            } catch (error) {
                reject(error)
            }
            
        })
     }

     const showAlert = (title, message, onPress= null) => {
        Alert.alert(
            title, 
            message,
            [
                {
                    text: "OK",
                    style: 'cancel',
                    onPress: onPress
                }
            ]
        )
     }



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
            state: [condoms_sale, setCondomsSale]
        },
        {
            ...tags[5],
            state: [period_products, setPeriodProducts]
        },
        {
            ...tags[6],
            state: [unisex,setUnisex]

        },
        {
            ...tags[7],
            state: [urinal,setUrinal]
        }
       
     ]


    const tagsSection = mTags.map((tag,index) =>
        <View style={{width:'100%',justifyContent:'center'}} key={tag.key}>
            <View style={{width:'100%',flexDirection:'row', justifyContent:'space-between', 
                    alignItems:'center', padding:10}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Icon 
                        name={tag.icon} 
                        type={ tag.iconType || "font-awesome-5" }
                        color='white' 
                        size={25} 
                        containerStyle={{width:40, height:40, backgroundColor:tag.iconColor,
                            borderRadius:5, padding:5, justifyContent:'center'}} />
                    <Text style={[styles.txt, {fontSize:18, marginHorizontal:10}]}>{tag.name}</Text>
                </View>
                <Switch value={tag.state[0]} onValueChange={val => tag.state[1](val)}/>
                
            </View>
            { index == mTags.length - 1 
                || <View style={{width:'100%', height:0.5, backgroundColor:'gray', marginLeft:10}}/>}
            
        </View> 
    )


    // callbacks
    const handleSheetChanges = useCallback( index => {
        // console.log('handleSheetChanges', index);
    }, []);

  return (
    <View style={{backgroundColor:'white'}}>
      <SafeAreaView >
            <View style={{height:'100%'}}>
                <MapView
                    style={{width:'100%', height:'70%'}}
                    mapType="standard"
                    showsUserLocation
                    initialRegion={region}
                    region={region}
                    onRegionChange={() => {}}>
                    <Marker
                        draggable
                        key={1}
                        coordinate={ coordinate }
                        onDragEnd={e => setPinnedCoordinate(e.nativeEvent.coordinate)}/>

                </MapView>
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
            >
                <ScrollView>
                    <View style={{flex:1, alignItems:'center', backgroundColor:'lightgrey'}}>
                        <View style={styles.section}>
                            <Text style={[styles.txt, { marginBottom:15}]}>{`Lat: ${pinnedCoordinate.latitude} Long: ${pinnedCoordinate.longitude}`}</Text>
                            <Input 
                                value={name} 
                                placeholder="Name" 
                                onChangeText={val => setName(val)}
                                inputContainerStyle={{backgroundColor:'lightgrey', paddingHorizontal:10, paddingVertical:5, 
                                        borderBottomColor:'lightgrey', borderRadius: 5}}/>
                            
                            <Input
                                value={desc}
                                placeholder="Description (optional)" 
                                onChangeText={val => setDesc(val)}
                                multiline
                                verticalAlign='top'
                                containerStyle={{height:80}}
                                inputContainerStyle={{backgroundColor:'lightgrey', height:'100%', 
                                                paddingHorizontal:10, paddingVertical:5, 
                                                borderBottomColor:'lightgrey', borderRadius: 5}}/>
                        </View>

                        <View style={[styles.section, {marginTop:10, paddingBottom:20}]}>
                            { tagsSection }
                        </View>
                    </View>
                </ScrollView>
            </BottomSheet>
      </SafeAreaView>

    </View>
  )
}

export default AddBathroomScreen

const styles = StyleSheet.create({
    txt: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black'
    },
    section: {
        flex:1, 
        width:'100%', 
        alignItems:'center',
        backgroundColor:'white', 
        padding:10
    }
})


