import React, { useState, useCallback, useMemo, useRef, useEffect} from 'react'
import BottomSheet from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { Input, Icon, AirbnbRating, Dialog } from '@rneui/themed'
import { tags } from '../modules/tags';
import DeviceInfo from "react-native-device-info"

import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView,
    TouchableOpacity,
    Alert
} from 'react-native'

import { ScrollView } from 'react-native-gesture-handler'

const BathroomDetailsScreen = ({route}) => {
    // refs
    const bottomSheetRef = useRef(null);
    const mapViewRef = useRef(null);

    const [bathroomData, setBathroomData] = useState()
    const [coordinate, setCoordinate] = useState({latitude: 37.78825, longitude: -122.4324})
    const [tagsSection, setTagsSection] = useState()

    const [showDialog , setShowDialog] = useState(false)
    // will be object {id: RatingIdInReviewsCollection, stars: Number}
    const [userRating, setUserRating] = useState() 

    const [stars, setStars] = useState(3)
    const [dbDocument, setDbDocument] = useState()

    const snapPoints = useMemo(() => ['30%', '60%', '85%'], []);

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    
    useEffect(() => {
        fetchBathroomData(route.params?.bathroomId)
        getUserRatingIfAny(route.params?.bathroomId)
        getUserId()
    }, [])

    // get uid
    // if no user uid, then use uid = deviceId
    const getUserId = async () => {
        return new Promise(async resolve => {
            let uid = await DeviceInfo.getUniqueId()
            if (auth().currentUser) uid = auth().currentUser.uid
            resolve(uid)
        })
        
    }

    const fetchBathroomData = async (bathroomId) => {
        try {   
            const doc = firestore().collection('bathrooms').doc(bathroomId);
            setDbDocument(doc);
            const snap = await doc.get()
            if (snap.exists) {
                if (typeof snap.data().rating == 'number') setBathroomData({...snap.data(), rating: [0,0,0,0,0]})
                else setBathroomData(snap.data())
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

    const getUserRatingIfAny = async (bathroomId) => {
        try {
            uid = await getUserId()
            const snap = await firestore().collection('reviews')
                                .where("uid", "==", uid)
                                .where("bathroom_id", "==", bathroomId)
                                .get()
            if (!snap.empty && snap.docs.length > 0) {
                setUserRating({id: snap.docs[0].id, stars: snap.docs[0].data().stars})
                setStars(snap.docs[0].data().stars)
            }
        } catch (error) {
            console.log(error)
        }
    }

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
        return [(totalSum > 0 ? Number((totalSum/numRatings).toFixed(2)) : 0), numRatings];
    }

    const updateRating = async () => {

        // update user previous rating if any
        // else save new rating into reviews collection
        if (userRating && userRating.stars != stars) {
            bathroomData["rating"][userRating.stars - 1]--
            await firestore().collection('reviews').doc(userRating.id).update({stars: stars})
        }
        else {
            let id = firestore().collection('reviews').doc().id
            uid = await getUserId()
            await firestore().collection('reviews').doc(id).set({
                uid: uid,
                bathroom_id: route.params?.bathroomId,
                stars: stars,
                id: id
            })
            setUserRating({id: id, stars: stars})  
        }

        bathroomData["rating"][stars - 1]++
        await dbDocument.update({
            rating: bathroomData["rating"]
        })
        
        // dismiss the review dialog
        toggleDialog()

        // show alert on succesfull review
        Alert.alert(
            "Thank you!",
            "Your review has been saved",
            [
                {
                    text: "OK",
                    style: 'cancel'
                }
            ]
        )
        console.log("rating updated!")
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

    const toggleDialog = () => setShowDialog(!showDialog)

    // callbacks
    const handleSheetChanges = useCallback( index => {
        // console.log('handleSheetChanges', index);
    }, []);

    const ShowDialog = () => (
        <Dialog
            isVisible={showDialog}
            onBackdropPress={toggleDialog}>
            

            <View style={{alignItems:'center'}}>
                <Dialog.Title title= {userRating ? "YOUR PREVIOUS REVIEW" : "LEAVE REVIEW"} />

                <AirbnbRating
                    showRating={true}
                    size={35}
                    count={5}
                    defaultRating={stars}
                    starContainerStyle={{alignSelf:'center'}}
                    ratingContainerStyle={{ marginBottom:10 }}
                    onFinishRating={val => setStars(val)}
                />
                
            </View>

            <Dialog.Actions>
                <Dialog.Button
                    title= {userRating ? "UPDATE" : "CONFIRM"}
                    onPress={updateRating}
                />
                <Dialog.Button title="CANCEL" onPress={toggleDialog} />
            </Dialog.Actions>
        </Dialog>
    )

  return (
    <View style={{backgroundColor:'white'}}>
      <SafeAreaView >
            <View style={{height:'100%'}}>
                <MapView
                    ref={mapViewRef}
                    style={{width:'100%', height:'100%'}}
                    mapType="standard"
                    initialRegion={region}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    region={region}
                    onRegionChange={() => {}}
                    onPress={() => {bottomSheetRef.current.close()}}>
                        
                    <Marker
                        key={1}
                        coordinate={coordinate}
                        title= {bathroomData?.name}
                        description= {bathroomData?.description}/>

                </MapView>

                <TouchableOpacity // Animate to bathroom button
                    onPress={() => {mapViewRef.current.animateToRegion(region, 1000)}}
                    style = {styles.bathroomLocationButton}>
                    <Icon name='map-marker-alt' type='font-awesome-5' size={35} color='lightblue' />
                </TouchableOpacity>

                <TouchableOpacity // Show list button
                    onPress={() => bottomSheetRef.current.snapToIndex(0)}
                    style = {styles.showListButton}>
                    <Icon name='list' type='material' size={30}  color='white' containerStyle={{marginRight: 3}}/>
                    <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>View List</Text>
                </TouchableOpacity>

                
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                style={{marginBottom:0}}
                enablePanDownToClose={true}
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

                            <TouchableOpacity style={{alignContent:'center', marginTop:10}} onPress={toggleDialog}>
                                <Text style={[styles.txt, {fontWeight:'bold', textDecorationLine:'underline', fontSize:18}]}>
                                    { userRating ? "View/Edit review" : "Leave a review"}
                                </Text>
                            </TouchableOpacity>

                            <ShowDialog />

                        </View>

                       

                        <View style={{width: '100%'}}>
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
    },
    showListButton: {
        position: 'absolute',
        flexDirection:'row',
        alignItems:'center',
        justifyContent: 'center',
        bottom: 15,
        right: 15,
        height: 50,
        width: 130,
        opacity: .8,
        padding: 5,
        borderRadius: 100,
        backgroundColor: '#3C99DC',
    },
    bathroomLocationButton: {
        position: 'absolute',
        alignItems:'center',
        justifyContent: 'center',
        top: 15,
        right: 15,
        height: 50,
        width: 50,
        opacity: .8,
        padding: 5,
        borderRadius: 100,
        backgroundColor: 'gray',
    },
})