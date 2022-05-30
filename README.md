fixes for upgrading

node_modeles :
replace 
import { AsyncStorage } from "react-native";
to
import AsyncStorage from '@react-native-async-storage/async-storage';

replace
const createElement = ReactNativeWeb.createElement || ReactNativeWeb.unstable_createElement;
to
const createElement = ReactNativeWeb.unstable_createElement;



Error: Requiring module "node_modules\react-native-reanimated\src\Animated.js", which threw an exception: Error: Reanimated 2 failed to create a worklet, maybe you forgot to add Reanimated's babel plugin?

add : plugins: ['react-native-reanimated/plugin'],
to babel