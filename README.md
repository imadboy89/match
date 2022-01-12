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