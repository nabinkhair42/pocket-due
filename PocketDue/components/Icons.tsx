import { Image, StyleProp, View, ViewStyle } from "react-native";


interface IconProps {
  size: number;
  style?: StyleProp<ViewStyle>;
}

const GoogleIcon = ({ size, style }: IconProps) => {
  return (
    <View style={style}>
      <Image
        source={require("../assets/icons/google.png")}
        style={{ width: size, height: size }}
      />
    </View>
  );
};

export default GoogleIcon;

export const AppLogo = ({ size, style }: IconProps) => {
  return (
    <View style={style}>
      <Image
        source={require("../assets/icon.png")}
        style={{ width: size, height: size }}
      />
    </View>
  );
};

