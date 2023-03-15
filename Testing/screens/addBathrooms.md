# Test for screens/addBathroom.js
There are a few functions in this file we need to test.
## `_getLocation`
### Input
Indirect input: fetches coordinates and region from `AsyncStorage`.

### Output
Location has been fetched and stored in the variables.

### Equivalence Classes
There is only one equivalence class here as is there only one path through the function.
### Test
Set the `coordinates` key in `AsyncStorage` to be any coordinates.
Set the `region` key in `AsyncStorage` to be any region.
Run `_getLocation`.
`assert coordinates equals value of coordinates in asyncstorage`
`assert region equals value of region in asyncstorage`

## `addBathroom`
### Input
Direct input is none, indirect is the name of the bathroom and the data specified by the user creating the bathroom.

### Output
If the bathroom name is too short (less than two characters) or already exists at that location, don't add it. Otherwise, add the bathroom with the user-specified data.

### Equivalence Classes
There are 3 equivalence classes: the bathroom name is too short, another bathroom exists at that location, or it's valid and we add the bathroom.

### Test
#### Name too short
```
name = "a"
addBathroom()
assert an alert popped up for the name being too short
```

#### Bathroom already exists here
```
name = "Yatrik's awesome bathroom"
location = another bathroom's location
addBathroom()
assert an alert popped up for this bathroom existing already
```

#### Valid bathroom
Use UI to create bathroom. Ensure that your bathroom now appears in the database by looking at the firebase console. That's all to this test, it's pretty hard (although doable) to do with stubs, spies, mocks to simulate the user input and database.

## `doesBathroomExist`
### Input
Indirect input: the database entry at the location specified by the user's pinned coordinate on the map

### Output
A promise resolving true, false, or an exception if there was a database error.

### Equivalence Classes
There are 3 equivalence classes: there is a bathroom at that location, there isn't, or there was a db error.

### Test Cases
#### Bathroom exists at location
```
insert bathroom into db at location (0, 0)
set pinnedCoordiantes to (0, 0)
assert await doesBathroomExist() === true
```

#### Bathroom doesn't exist at location
```
insert bathroom into db at location (0, 0)
set pinnedCoordiantes to (3.14159, 3.14159)
assert await doesBathroomExist() === false
```

#### DB error
Use a stub to represent the db and to refuse the query.
```
assert await doesBathroomExist() raised an error
```

The rest of the stuff in this file is mostly UI-based and so won't be unit-tested./
