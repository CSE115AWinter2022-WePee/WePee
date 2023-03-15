# Test for modules/getAndSetBathroomNameFromId.md

## getBathroomNameFromId
### Input format
This function takes an input of a unique database identifier (string). 

### Output
This function will return the name of the bathroom with the specified database id. If no such bathroom with the id exists, it returns `undefined` or some other falsey value.

### Equivalence Classes
There are two equivalence classes: a bathroom id that exists and one that doesn't.

### Test Cases
#### Bathroom id exists
Let's use the bathroom id `I9To54MqsmuDglX7rrjD`, which has been verified to exist in the database as a bathroom. The name of the corresponding bathroom is "Oakes Library ".
```assert await getBathroomNameFromId('I9To54MqsmuDglX7rrjD') === "Oakes Library "```

#### Bathroom id doesn't exist
Let's use the bathroom id "" (the empty string), which doesn't exist.
```assert !(await getBathroomNameFromId(''))```

## updateBathroomNameInReview
### Input format
This functions take the unique database id and a bathroom name.

### Output
No return value. This function add the associated bathroom name to the review specified by the id if it doesn't already have one.

### Equivalence Classes
The classes are if the bathroom id that exists and if it doesn't.

### Test Cases
#### Review id exists
Let's use the review id `2c8uekzfpTQwUu8y5J90`, which has been verified to exist in the database as a bathroom. 
```updateBathroomNameInReview("2c8uekzfpTQwUu8y5J90", "Outside of E1")``` should now update the review to have its bathroom name be "Outside of E1". This can be verified with a spy or by manually checking the database.

#### Review id doesn't exist
Let's use review id "" (the empty string), which doesn't exist.
```updateBathroomNameInReview("", "Outside of E1")```
There should be no effect as no such review id exists. This can be manually verified or with a spy.