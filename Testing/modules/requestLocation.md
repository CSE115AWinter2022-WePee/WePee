# Test for modules/requestLocation.js
Tests for the function `requestLocationPermission`.
## Input format
This function takes no inputs.

## Output
This function will return whether we have permission to access the user location, on Android or iOS.

## Equivalence Classes
### Android
Android has 3 equivalence classes: the user has granted access to their precise location, their approximate location, or hasn't granted permission at all.

## iOS
iOS has 2 equivalence classes: the user has granted permission or they haven't.

## Test Cases
In the code, we can set up a `console.log` for the return value.
### Android
First delete any permissions of the app. Wait for the app to prompt, asking for permissions.

#### Precise Location
When the dialog pops up, select "Precise Location" before selecting "Allow". The console should now print true since the app has permission.

#### Approximate location
When the dialog pops up, select "Approximate Location" before selecting "Allow". The console should now print true since the app has permission.

#### Deny
When the dialog pops up, select "Deny". The console should now print false because the app has been denied location acces.

### iOS
First delete any permissions of the app. Wait for the app to prompt, asking for permissions.
#### Allow
The console should now print true because we have location access.

#### Deny
The console should now print false because we don't have location permission.
