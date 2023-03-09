import { Dropdown } from "react-native-element-dropdown";
import { Text, View } from "react-native";
import { Icon } from '@rneui/themed'

// Map types for dropdown
const mapTypeData = [
    {label: "Standard", value: "standard"},
    {label: "Satellite", value: "satellite"},
    {label: "Hybrid", value: 'hybrid'}
  ]

// small function to render each item in dropdown list
const renderItem = item => {
  return (
    <View style={{ marginTop: 5, marginBottom: 5, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{color: 'black'}}>{item.label}</Text>
    </View>
  );
};

// Maptypes dropdown component
// Takes as props the `style` for the dropdown's View container, the `mapType` state var, and the `setMapType` setter method
export const MapTypeDropdown = ( {style, mapType, setMapType, mapLabel, setMapLabel} ) => {
    return (
      <Dropdown // Map type dropdown menu
      style={style}
      containerStyle={
        {
          width: 110, 
          borderRadius: 18, 
          backgroundColor: 'white',
          padding: 5,
          right: 50
        }
      }
      placeholderStyle={{color: 'black', fontSize: 16}}
      placeholder={""}
      data={mapTypeData}
      // The following lines are commented out because they cause display issues in tags.
      // labelField="label"
      // valueField="value"
      onChange={item => {setMapType(item.value); setMapLabel(item.label)}}
      renderItem={renderItem}
      renderRightIcon={() => 
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: "black"}}>{mapLabel} map</Text>
          <Icon name="caret-down" type='font-awesome' style={{marginLeft: 3}} size={15} color='gray'/>
        </View>
        }
      />);
    }