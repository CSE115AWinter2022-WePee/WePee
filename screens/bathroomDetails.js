import React, { useState, useCallback, useMemo, useRef, useEffect} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'

import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView,
    FlatList
} from 'react-native'

const BathroomDetailsScreen = ({route}) => {
    const [bathroomData, setBathroomData] = useState()
    const bottomSheetRef = useRef(null);
    const [coordinate, setCoordinate] = useState({latitude: 37.78825, longitude: -122.4324})
    const snapPoints = useMemo(() => ['50%', '70%'], []);

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    useEffect(() => {
        fetchBathroomData(route.params?.bathroomId)
    }, route.params)

    const fetchBathroomData = async (bathroomId) => {
        try {
            const snap = await firestore().collection('bathrooms').doc(bathroomId).get()
            if (snap.exists) {
                setBathroomData(snap.data())
                setRegion({
                    ...region, 
                    latitude: snap.data().latitude, 
                    longitude:snap.data().longitude})
                setCoordinate({latitude: snap.data().latitude, longitude:snap.data().longitude})
            }
        } catch (error) {
            console.log(error)
        }
       
    }

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
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    region={region}
                    onRegionChange={() => {}}>
                    <Marker
                        key={1}
                        coordinate={coordinate}
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
                <View style={{flex:1, padding:10}}>
                    <Text style={[styles.txt, {fontWeight:'bold'}] }>
                        Name: {bathroomData?.name}
                    </Text>
                    <Text style={[styles.txt, {fontWeight:'bold'}] }>
                        Rating: {bathroomData?.rating}/5
                    </Text>
                    <Text style={[styles.txt, {fontWeight:'bold', marginVertical:15}] }>
                        Description: {bathroomData?.description}
                    </Text>
                </View>
            </BottomSheet>
      </SafeAreaView>
    </View>
  )
}

export default BathroomDetailsScreen

const styles = StyleSheet.create({
    txt: {
        color:'black',
        fontSize: 18
    }
})