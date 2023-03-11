
import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import MapView, { Marker } from 'react-native-maps'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Input, Icon, Switch } from '@rneui/themed'
import firestore from '@react-native-firebase/firestore'
import { tags } from '../modules/tags'
import { AirbnbRating } from 'react-native-ratings'
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  View
} from 'react-native'
import { MapTypeDropdown } from '../modules/MapTypeDropdown'
import { ScrollView } from 'react-native-gesture-handler'

// Currently not implemented: Set rating, delete/report bathroom, edit tags for bathroom

const AddBathroomScreen = ({ navigation, route }) => {
  // tag states
  const [name, setName] = useState()
  const [desc, setDesc] = useState()
  const [cleanliness, setCleanliness] = useState(false)
  const [free, setFree] = useState(false)
  const [accessibility, setAccessibility] = useState(false)
  const [changingStation, setChangingStation] = useState(false)
  const [condomSale, setCondomsSale] = useState(false)
  const [periodProducts, setPeriodProducts] = useState(false)
  const [unisex, setUnisex] = useState(false)
  const [urinal, setUrinal] = useState(false)
  const [stars, setStars] = useState(3)

  // refs for components
  const bottomSheetRef = useRef(null)
  const mapViewRef = useRef(null)

  const [pinnedCoordinate, setPinnedCoordinate] = useState({ latitude: null, longitude: null })
  const [coordinate, setCoordinate] = useState({ latitude: 37.78825, longitude: -122.4324 })
  const snapPoints = useMemo(() => ['30%', '60%', '85%'], [])
  // State to store current map region
  const [region, setRegion] = useState(route.params?.region)
  // State to store current map type
  const [mapType, setMapType] = useState(route.params?.mapType)

  // call _getLocation, have it set location and region details from cache
  useEffect(() => {
    _getLocation()
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Icon
        name='check'
        size={25}
        color='#3C99DC'
        type='font-awesome'
        onPress={() => addBathroom()}
                         />
    })
  })

  const _getLocation = async () => {
    // fetch from cached data - Do we really want this??
    // Why not just pass location as a route parameter?...
    try {
      const coordinates = await AsyncStorage.getItem('coordinates')
      const region = await AsyncStorage.getItem('region')
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
        showAlert('Bathroom name', 'Please add a name')
        return
      }
      const exists = await doesBathroomExist()
      if (exists) {
        showAlert('Bathroom exists', 'Please add a different bathroom')
        return
      }

      const id = firestore().collection('bathrooms').doc().id
      const data = {
        name,
        description: desc || '',
        latitude: pinnedCoordinate.latitude,
        longitude: pinnedCoordinate.longitude,
        cleanliness,
        free,
        accessibility,
        changing_station: changingStation,
        condoms_sale: condomSale,
        period_products: periodProducts,
        unisex,
        urinal,
        id,
        rating: [0, 0, 0, 0, 0]
      }
      data.rating[stars - 1]++
      const review_id = firestore().collection('reviews').doc().id
      const review_data = {
        bathroom_id: id,
        bathroom_name: name,
        user_name: route.params?.displayName,
        id: review_id,
        stars,
        uid: route.params?.uid
      }
      await firestore().collection('bathrooms').doc(id).set(data)
      await firestore().collection('reviews').doc(review_id).set(review_data) // This is where the "review_id" bug was!!!

      showAlert('Success',
        'Bathroom added succesfully',
        () => { navigation.navigate('Mapview', { reload: true }) })
    } catch (error) {
      console.log('adding bathroom to db error ', error.message)
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

  const showAlert = (title, message, onPress = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          style: 'cancel',
          onPress
        }
      ]
    )
  }

  const mTags = [
    {
      ...tags[0],
      state: [cleanliness, setCleanliness]
    },
    {
      ...tags[1],
      state: [free, setFree]
    },
    {
      ...tags[2],
      state: [accessibility, setAccessibility]
    },
    {
      ...tags[3],
      state: [changingStation, setChangingStation]

    },
    {
      ...tags[4],
      state: [condomSale, setCondomsSale]
    },
    {
      ...tags[5],
      state: [periodProducts, setPeriodProducts]
    },
    {
      ...tags[6],
      state: [unisex, setUnisex]

    },
    {
      ...tags[7],
      state: [urinal, setUrinal]
    }

  ]

  const tagsSection = mTags.map((tag, index) =>
    <View style={{ width: '100%', justifyContent: 'center' }} key={tag.key}>
      <View style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10
      }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            name={tag.icon}
            type={tag.iconType || 'font-awesome-5'}
            color='white'
            size={25}
            containerStyle={{
              width: 40,
              height: 40,
              backgroundColor: tag.iconColor,
              borderRadius: 5,
              padding: 5,
              justifyContent: 'center'
            }}
          />
          <Text style={[styles.txt, { fontSize: 18, marginHorizontal: 10 }]}>{tag.name}</Text>
        </View>
        <Switch value={tag.state[0]} onValueChange={val => tag.state[1](val)} />

      </View>
      {index === mTags.length - 1 ||
        <View style={{ width: '100%', height: 0.5, backgroundColor: 'gray', marginLeft: 10 }} />}

    </View>
  )

  // callbacks
  const handleSheetChanges = useCallback(index => {
    // console.log('handleSheetChanges', index);
  }, [])

  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ height: '100%' }}>
          <MapView
            ref={mapViewRef}
            style={{ width: '100%', height: '100%' }}
            mapType={mapType.toLowerCase()}
            showsUserLocation
            showsMyLocationButton={false}
            initialRegion={region}
            region={region}
            onPress={() => { bottomSheetRef.current.close() }}
            onRegionChange={() => {}}
          >
            <Marker
              draggable
              key={1}
              coordinate={coordinate}
              onDragEnd={e => setPinnedCoordinate(e.nativeEvent.coordinate)}
            />
          </MapView>

          <MapTypeDropdown style={styles.mapTypeDropdown} mapType={mapType} setMapType={setMapType} />

          <TouchableOpacity // Show list button
            onPress={() => bottomSheetRef.current.snapToIndex(0)}
            style={styles.showListButton}
          >

            <Icon name='list' type='material' size={30} color='white' containerStyle={{ marginRight: 3 }} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>View List</Text>
          </TouchableOpacity>

          <TouchableOpacity // Animate to user button
            onPress={() => { mapViewRef.current.animateToRegion(region, 1000) }}
            style={styles.userLocationButton}
          >
            <Icon name='person-pin' type='material' size={40} color='lightblue' />
          </TouchableOpacity>

        </View>
        <BottomSheet // Place to add bathroom details
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
        >
          <ScrollView>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'lightgrey' }}>
              <View style={styles.section}>
                <Text style={[styles.txt, { marginBottom: 15 }]}>{`Lat: ${pinnedCoordinate.latitude} Long: ${pinnedCoordinate.longitude}`}</Text>
                <Input
                  value={name}
                  placeholder='Name'
                  onChangeText={val => setName(val)}
                  inputContainerStyle={{
                    backgroundColor: 'lightgrey',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomColor: 'lightgrey',
                    borderRadius: 5
                  }}
                />

                <Input
                  value={desc}
                  placeholder='Description (optional)'
                  onChangeText={val => setDesc(val)}
                  multiline
                  verticalAlign='top'
                  containerStyle={{ height: 80 }}
                  inputContainerStyle={{
                    backgroundColor: 'lightgrey',
                    height: '100%',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderBottomColor: 'lightgrey',
                    borderRadius: 5
                  }}
                />
                <AirbnbRating
                  showRating={false}
                  size={35}
                  count={5}
                  defaultRating={stars}
                  starContainerStyle={{ alignSelf: 'center' }}
                  ratingContainerStyle={{ marginTop: 20 }}
                  onFinishRating={val => setStars(val)}
                />

              </View>
              <View style={[styles.section, { marginTop: 10, paddingBottom: 20 }]}>
                {tagsSection}
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
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  showListButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 15,
    right: 15,
    height: 50,
    width: 130,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: '#3C99DC'
  },
  userLocationButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '1%',
    right: '1%',
    height: 50,
    width: 50,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: 'gray'
  },
  mapTypeDropdown: {
    position: 'absolute',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: '1%',
    left: '1%',
    fontSize: 16,
    borderRadius: 100,
    padding: 3
  }
})
