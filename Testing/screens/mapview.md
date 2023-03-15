# Tests for screens/mapview.js
## `fetchBathrooms`
This function fetches all bathrooms from the database.
### Input
None
### Output
This function will store  all fetched bathrooms in the variable `bathrooms`.
### Equivalence Classes
There are two equivalence classes: either it is able to fetch, or there is some database error.
#### Able to fetch
We can use a stub for the database to simulate a collection of bathrooms. We then assert that the value received by `fetchBathrooms` is what we placed in the stub.
```
await fetchBathrooms()
assert bathrooms === [database from stub]
```
#### Unable to fetch
We use a stub again that will send back an invalid response when queried. We then assert that the function has logged an error by using a spy for the console.
```
await fetchBathrooms()
assert error message logged
```

## `filterBathrooms`
This function filters bathrooms by the specified tags.
### Input
Indirect input of the stored bathroom data, direct input of selected tags `searchedTags`
### Output
Stores the filtered bathrooms in a variable `newBathrooms`
### Equivalence Classes
There are two equivalence classes here: when no tags are set, and when they are set.
### Test Cases
#### No tags
```
filterBathrooms([]);
assert newBathrooms === bathrooms
```

#### Tags specified
```
filterBathrooms({key: 0, db_name: 'cleanliness', name: 'Clean', icon: 'broom', iconColor: 'green'})
for all newBathroom in newBathrooms:
	assert newBathroom.clean
```

