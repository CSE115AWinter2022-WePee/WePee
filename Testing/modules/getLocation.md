# Unit Tests for getLocation.js

## getCurrentLocation(latitudeDelta, longitudeDelta)
This method prompts for permission and then if allowed to, asynchronously fetches the current location of the user with a call to `GeoLocation.getCurrentPosition`. It accepts two arguments, `latitiudeDelta` and `longitudeDelta`, which are floats that provide the "zoom level" for the map region that's returned as centered on the user's location. This method returns an object giving the user's coordinates, and the map region to be rendered, in the format 

```
{coordinates: {latitude: <float>, longitude: <float>}, 
region: {latitude: <float>, longitude: <float>, latitudeDelta: args.latitudeDelta, LongitudeDelta: args.longitudeDelta}}
```

### Unit Tests
Let current user coordinates be given as `{longitude: 0.5, latitude: 0.5}`
```
assert getCurrentLocation(0.5, 0.65) == 
{coordinates: 
    {latitude: 0.5, longitude: 0.5}, 
 region: 
    {latitude: 0.5, longitude: 0.5, 
    latitudeDelta: 0.5, longitudeDelta: 0.65}
}
```
This method is used in `mapview.js` to render the user's current region with their location.



