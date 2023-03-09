import { Dropdown } from "react-native-element-dropdown";
import { Text, View } from "react-native";

// Map types for dropdown
const mapTypeData = [
    {value: "standard"},
    {value: "satellite"},
    {value: "hybrid"}
  ]
// Maptypes dropdown component
// Takes as props the `style` for the dropdown's View container, the `mapType` state var, and the `setMapType` setter method
export const MapTypeDropdown = ( {style, mapType, setMapType} ) => {
    return (
      <Dropdown // Map type dropdown menu
      style={style}
      containerStyle={
        {
          width: 100, 
          borderRadius: 5, 
          padding: 5,
          right: 50
        }
      }
      placeholderStyle={{fontSize: 16}}
      placeholder={""}
      value={mapType}
      data={mapTypeData}
      labelField="value"
      valueField="value"
      onChange={item => setMapType(item.value)}
      renderItem={item => <Text>
          {item.value}
        </Text>
        }
      renderRightIcon={() => <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: "black"}}> {mapType} map </Text>
          {/* Uncomment the following to add a carat icon for the dropdown*/}
          {/* <Icon name="caret-down" type='font-awesome' style={{marginLeft: 5}} size={15} color='gray'/>  */}
        </View>
        }
      />);
    }