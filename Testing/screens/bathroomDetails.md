# Test for screens/bathroomDetails.js

## fetchBathroomReviewData
### Input format
This function expects an input of a unique database bathroom identifier (string). 
### Output
This function will call the `cleanupAndSetFirebaseUserReviews` function and update the data stored for a specifc review to be operated on. If no such bathroom with the id exists, it does nothing to the existing data.
### Equivalence Classes
There are two equivalence classes: a bathroom id that exists and one that doesn't.

## cleanupAndSetFirebaseUserReviews
### Input format
This function expects an input of a list of reviews from the reviews collection with the bathroom_id all matching. 
### Output
This function will clean up the junk list of reviews and assign them a user_name from the user and fetch the bathroom_name from the bathrooms collection.
### Equivalence Classes
There are two equivalence classes: an empty list of reviews and a full list.

### Test Cases
### Review id exists
Let's use the review id `2c8uekzfpTQwUu8y5J90`, which has been verified to exist in the database as a bathroom with no bathroom 
name or username assigned. ```fetchBathroomReviewData("2c8uekzfpTQwUu8y5J90")``` should now update the review to have its bathroom name be "Outside of E1" and a random username of the form "WePee User #". This can be verified with a spy or by manually checking the database.

### Review id doesn't exist
Let's use review id "" (the empty string), which doesn't exist. ```fetchBathroomReviewData("")```
There should be no effect as no such review id exists. This can be manually verified or with a spy.


## getUserId
### Input format
This function has no input.
### Output
This function will return a userId either from an existing user or a newly generated one using the deviceID.
### Test Cases
```assert getUserId() === auth().currentUser.uid``` this is for existing users else it's the device ID.


## fetchBathroomData
### Input format
This function expects an input of a unique database bathroom identifier (string). 
### Output
This function doesn't return anything. The main purpose of this function is to fetch the specific information for a bathroom of given
ID and save it locally for further usage.
### Equivalence Classes
There are two equivalence classe: when a bathroom id exists inside the database and when it doesn't.
### Test Cases
### Review id exists
Let's use the review id `2c8uekzfpTQwUu8y5J90`, which has been verified to exist in the database as a bathroom. 
```fetchBathroomData("2c8uekzfpTQwUu8y5J90")``` should now update the bathroom data and coordinates of current pin. This can be verified for correctness using a spy or manually in the DB.

#### Review id doesn't exist
Let's use review id "" (the empty string), which doesn't exist.
```fetchBathroomData("")```
There should be no effect as no such review id exists. This can be manually verified or with a spy.


## getUserRatingIfAny
### Input format
This function expects an input of a unique database bathroom identifier (string). 
### Output
This function doesn't return anything. It collects all the ratings in the database for a specific bathroom and saves them locally.
### Equivalence Classes
There are two possibilities: the first is that ratings exist for given ID which is tested below and the other is when no ratings exist for given ID and nothing happens locally or otherwise.
### Test Cases
The function `getUserRatingIfAny('2c8uekzfpTQwUu8y5J90')` is called and saves snap as every review from the collection 'reviews' inside
the database. Next, the local userRating is set along with the number of stars. This outcome can be confirmed by checking the values of
this variable after execution or alternatively by using a spy to fetch the DB values and compare them.


## updateRating
### Input format
This function has no input only the current userRating variable is checked for usage.
### Output
This function doesn't return anything but it can change the star assigned for a review or delete the current review from the database.
### Test Cases
The function `updateRating()` is called automatically after a review is changed or added in the UI and it can handle the modification of stars or even add new reviews to the database. We can verify that this works correctly manually or with a spy on the DB after inputing a fresh review or modifying the star count on an existing review.


## deleteReview
### Input format
This function has no input.
### Output
This function doesn't return any values but it can delete the current review from the database and affects the internal variables.
### Test Cases
`deleteReview()` will set userRating to undefined and if you check the DB manually or with a spy the specific review selected is deleted.