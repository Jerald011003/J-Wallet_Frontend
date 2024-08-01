import React from 'react';

import { SignUp } from "./screens";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import Tabs from "./navigation/tabs";
import Food from "./screens/Food";
import Login from "./screens/Login";
import DietTracker from "./screens/DietTracker"
import TopUp from "./screens/TopUp"

import Transactions from "./screens/Transactions"
import Wallet from "./screens/Wallet"
import SendMoney from "./screens/SendMoney"
import Notif from "./screens/Notif"
import User from "./screens/User"

import Profile from './screens/Profile';

// Food System
import AllCanteens from './screens/FoodDetails/FoodCanteen/AllCanteens';
import AllFoods from './screens/FoodDetails/FoodCanteen/AllFoods';
import OrderCreate from './screens/FoodDetails/FoodCanteen/OrderCreate';
import OrderList from './screens/FoodDetails/FoodCanteen/OrderList';
import FeaturedFoods from './screens/FeaturedFoods';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        border: "transparent",
    },
};

const Stack = createStackNavigator();

const App = () => {
    const [loaded] = useFonts({
        "Roboto-Black" : require('./assets/fonts/Roboto-Black.ttf'),
        "Roboto-Bold" : require('./assets/fonts/Roboto-Bold.ttf'),
        "Roboto-Regular" : require('./assets/fonts/Roboto-Regular.ttf'),
    })
    
    if(!loaded){
    return null;
    }
    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
                initialRouteName={'Login'}
            >
                <Stack.Screen name="SignUp" component={SignUp} />

                {/* Tabs */}
                <Stack.Screen name="HomeTabs" component={Tabs} />

                {/* <Stack.Screen name="Scan" component={Scan} /> */}
                <Stack.Screen name="Food" component={Food} />

                <Stack.Screen name="Login" component={Login} />

                <Stack.Screen name="DietTracker" component={DietTracker} />

                <Stack.Screen name="TopUp" component={TopUp} />

                <Stack.Screen name="Wallet" component={Wallet} />

                <Stack.Screen name="User" component={User} />

                <Stack.Screen name="Transactions" component={Transactions} />

                <Stack.Screen name="Notif" component={Notif} />

                <Stack.Screen name="SendMoney" component={SendMoney} />

                <Stack.Screen name="Profile" component={Profile} />

                <Stack.Screen name="AllCanteens" component={AllCanteens} />

                <Stack.Screen name="AllFoods" component={AllFoods} />

                <Stack.Screen name="OrderCreate" component={OrderCreate} />

                <Stack.Screen name="OrderList" component={OrderList} />

                <Stack.Screen name="FeaturedFoods" component={FeaturedFoods} />


            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App;
