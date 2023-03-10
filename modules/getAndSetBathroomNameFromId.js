
import firestore from '@react-native-firebase/firestore'

// Grabs a bathroom's name given a bathroom_id
export const getBathroomNameFromId = async (bathroom_id) => {
  try {
    const snap = await firestore().collection('bathrooms')
      .where('id', '==', bathroom_id)
      .get()
    if (!snap.empty) {
      return (snap.docs[0].data().name)
    }
  } catch (error) {
    console.log(error)
  }
}

// Updates name field in a review
export const updateBathroomNameInReview = async (review_id, name) => {
  try {
    await firestore().collection('reviews').doc(review_id).update({ bathroom_name: name }) // update with name if it wasnt there
  } catch (error) {
    console.log(error)
  }
}