import React, { useState, useCallback, useMemo, useRef, useEffect} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'
import { tags } from '../modules/tags';

import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView,
    FlatList
} from 'react-native'

import { Input, Icon, AirbnbRating } from '@rneui/themed'

import { ScrollView } from 'react-native-gesture-handler'

const BathroomDetailsScreen = ({route}) => {
    const [bathroomData, setBathroomData] = useState()
    const bottomSheetRef = useRef(null);
    const [coordinate, setCoordinate] = useState({latitude: 37.78825, longitude: -122.4324})
    const [tagsSection, setTagsSection] = useState()
    const [stars, setStars] = useState(3)
    const snapPoints = useMemo(() => ['50%', '70%'], []);
    const [dbDocument, setDbDocument] = useState()

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    
    const getRating = function(data) {
        if (!data) {
            return 5;
        }
        totalSum = 0;
        numRatings = 0;
        for (let i = 0; i < data["rating"].length; i++) {
            totalSum += (i + 1) * data["rating"][i];
            numRatings += data["rating"][i];
        }
        return [totalSum/numRatings, numRatings];
    }

    const updateRating = async () => {
        bathroomData["rating"][stars - 1]++
        await dbDocument.update({
            rating: bathroomData["rating"]
        })
        console.log("rating updated!")
    }

    useEffect(() => {
        fetchBathroomData(route.params?.bathroomId)
    }, [])

    const fetchBathroomData = async (bathroomId) => {
        try {   
            const doc = await firestore().collection('bathrooms').doc(bathroomId);
            setDbDocument(doc);
            const snap = await doc.get()
            if (snap.exists) {
                setBathroomData(snap.data())
                setRegion({
                    ...region, 
                    latitude: snap.data().latitude, 
                    longitude:snap.data().longitude})
                setCoordinate({latitude: snap.data().latitude, longitude:snap.data().longitude})
                displayTags(snap.data())
            }
        } catch (error) {
            console.log(error)
        }
       
    }

    function displayTags(bathroomData) {
        const data = tags.map((tag, index) => {
            const dbName = tag.db_name
            if (!bathroomData[dbName]) return undefined
            return (
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
                            <Text style={{fontSize:15, marginHorizontal:10, color:'black', fontWeight:'bold'}}>{tag.name}</Text>
                        </View>
                       
                    
                    </View>
                    { index == tags.length - 1 
                        || <View style={{width:'100%', height:0.5, backgroundColor:'gray', marginLeft:10}}/>}
                    
                </View> 
        )})
        setTagsSection(data)
    }

    // callbacks
    const handleSheetChanges = useCallback( index => {
        // console.log('handleSheetChanges', index);
    }, []);

  return (
    <View style={{backgroundColor:'white'}}>
      <SafeAreaView >
            <View style={{height:'100%'}}>
                <MapView
                    style={{width:'100%', height:'100%'}}
                    mapType="standard"
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    region={region}
                    onRegionChange={() => {}}>
                    <Marker
                        key={1}
                        coordinate={coordinate}
                        title= {bathroomData?.name}
                        description= {bathroomData?.description}/>

                </MapView>

                
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                style={{marginBottom:0}}
            >   
                <ScrollView>
                    <View style={{flex:1, alignItems:'center', backgroundColor:'lightgrey'}}>
                        <View style={{width:"100%", alignItems:'center', backgroundColor:'white', padding:15}}>
                            <Text style={[styles.txt, {fontWeight:'bold', fontSize:20}] }>
                                {bathroomData?.name}
                            </Text>
                            <Text style={[styles.txt, {marginVertical:15}] }>
                                {bathroomData?.description}
                            </Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>

                                <AirbnbRating 
                                        isDisabled={true} 
                                        showRating={false}
                                        size={25}
                                        count={5}
                                        defaultRating={getRating(bathroomData)[0]} 
                                        ratingContainerStyle={{ marginTop:0 }}/>
                                <Text style={[styles.txt, {marginVertical:15}] }>
                                {getRating(bathroomData)[0]} ({getRating(bathroomData)[1]})
                            </Text>
                            </View>


                        </View>

                        <View style={{width: '100%'}}>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>

                                <AirbnbRating
                                    showRating={false}
                                    size={35}
                                    count={5}
                                    defaultRating={stars}
                                    starContainerStyle={{alignSelf:'center'}}
                                    ratingContainerStyle={{ marginTop:20 }}
                                    onFinishRating={val => setStars(val)}
                                />
                            <Text style={[styles.txt] } onPress={() => updateRating()}>
                                Post
                            </Text>
                            </View>

                             <Text style={[styles.txt, {fontWeight:'bold', fontSize:18, marginTop:30, marginLeft:15}] }>
                                Features
                            </Text>
                            <View style={{ alignItems:'center', backgroundColor:'white', marginTop:15, padding:10}}>
                                { tagsSection }
                            </View>
                        </View>
                    
                    </View>
                </ScrollView>

            </BottomSheet>

      </SafeAreaView>
    </View>
  )
}

export default BathroomDetailsScreen

const styles = StyleSheet.create({
    txt: {
        color:'black',
        fontSize: 15
    }
})