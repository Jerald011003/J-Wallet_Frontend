import React, { useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { COLORS, FONTS, icons, SIZES } from "../constants";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Wallet = ({ navigation }) => {
    // User balance
    const userBalance = "46,072.55";

    const [balance, setBalance] = React.useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    
    // Fetch CSRF Token
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/csrf/');
                setCsrfToken(response.data.csrfToken);
            } catch (error) {
                console.error('Error fetching CSRF token', error);
            }
        };
    
        fetchCsrfToken();
    }, []); // Empty dependency array to ensure this runs only once
    
    // Fetch Balance and User Information
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken || !csrfToken) {
                    console.error('Token or CSRF Token not available');
                    return;
                }
    
                const response = await axios.get('http://127.0.0.1:8000/balance/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken
                    }
                });
    
                // Convert balance to float and format
                const balance = parseFloat(response.data.balance).toFixed(2);
                const formattedBalance = Number(balance).toLocaleString();
                setBalance(formattedBalance);

                // // Capitalize the first letter of the first name
                // const firstName = response.data.first_name;
                // const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
                // setFirstName(capitalizedFirstName);
            } catch (error) {
                console.error("Error fetching balance:", error);
                Alert.alert('Error', 'Unable to fetch balance.');
            }
        };
    
        if (csrfToken) {
            fetchBalance();
        }
    }, [csrfToken]); // Only run when csrfToken changes


    // Header component
    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: SIZES.padding * 5, paddingHorizontal: SIZES.padding * 3, alignItems: 'center' }}>
                <TouchableOpacity
                    style={{ width: 45, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        style={{ height: 20, width: 20, tintColor: COLORS.black }}
                    />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: COLORS.black, ...FONTS.h3 }}>Wallet</Text>
                </View>

                <TouchableOpacity
                    style={{ width: 45, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => console.log("Settings")}
                >
                    <Image
                        source={icons.settings}
                        style={{ height: 20, width: 20, tintColor: COLORS.black }}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    // User balance component
    function renderUserBalance() {
        return (
            <View
                style={{
                    height: 120,
                    borderRadius: 20,
                    backgroundColor: COLORS.lightGray,
                    paddingHorizontal: SIZES.padding * 2,
                    paddingVertical: SIZES.padding,
                    marginHorizontal: SIZES.padding * 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
                    elevation: 6,
                }}
            >
                <View>
                    <Text style={{ ...FONTS.body3, color: COLORS.gray }}>Available Balance</Text>
                    <Text style={{ ...FONTS.h1 }}>₱{balance}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: COLORS.primary,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => navigation.navigate("SendMoney")}
                    >
                        <Image
                            source={icons.send}
                            resizeMode="contain"
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: COLORS.white
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            {renderHeader()}
            {renderUserBalance()}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: COLORS.gray, ...FONTS.body3 }}></Text>
                {/* You can add more content here as needed */}
            </View>
        </SafeAreaView>
    );
};



export default Wallet;
