import { Dropdown } from "react-native-element-dropdown";
import { Text, View } from "react-native";
import { Icon } from '@rneui/themed'

// Map types for dropdown
const mapTypeData = [
    {value: "Standard"},
    {value: "Satellite"},
    {value: "Hybrid"}
  ]

// small function to render each item in dropdown list
const renderItem = item => {
  return (
    <View style={{ marginTop: 5, marginBottom: 5, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{color: 'black'}}>{item.value}</Text>
    </View>
  );
};

// Maptypes dropdown component
// Takes as props the `style` for the dropdown's View container, the `mapType` state var, and the `setMapType` setter method
export const MapTypeDropdown = ( {style, mapType, setMapType} ) => {
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
      labelField="value"
      valueField="value"
      onChange={item => setMapType(item.value)}
      renderItem={renderItem}
      renderRightIcon={() => 
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: "black"}}>{mapType} map</Text>
          <Icon name="caret-down" type='font-awesome' style={{marginLeft: 3}} size={15} color='gray'/>
        </View>
        }
      />);
    }