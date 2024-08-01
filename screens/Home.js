import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Alert
} from "react-native";
import { COLORS, SIZES, FONTS, icons, images } from "../constants";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
    const navigation = useNavigation();
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

    const featuresData = [
        {
            id: 1,
            icon: icons.reload,
            color: COLORS.primary,
            backgroundColor: COLORS.white,
            description: "Top Up",
            screen: "TopUp"
        },
        {
            id: 2,
            icon: icons.food,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Foods",
            screen: "Food"
        },
        {
            id: 3,
            icon: icons.diet,
            color: COLORS.primary,
            backgroundColor: COLORS.lightGreen,
            description: "Diet Tracker",
            screen: "DietTracker"
        },
        {
            id: 4,
            icon: icons.wallet,
            color: COLORS.red,
            backgroundColor: COLORS.lightRed,
            description: "Wallet",
            screen: "Wallet"
        },
        {
            id: 5,
            icon: icons.bill,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Transactions",
            screen: "Transactions"
        },
        {
            id: 6,
            icon: icons.cart,
            color: COLORS.yellow,
            backgroundColor: COLORS.lightyellow,
            description: "Orders",
            screen: "OrderList"
        },
    ];

    const [features, setFeatures] = useState(featuresData);
    const [specialPromos, setSpecialPromos] = useState([]);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState('');
    const [firstName, setFirstName] = useState('');
    
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
    }, []);

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

            const balance = parseFloat(response.data.balance).toFixed(2);
            const formattedBalance = Number(balance).toLocaleString();
            setBalance(formattedBalance);

            const firstName = response.data.first_name;
            const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            setFirstName(capitalizedFirstName);
        } catch (error) {
            console.error("Error fetching balance:", error);
            Alert.alert('Error', 'Unable to fetch balance.');
        }
    };

    const fetchFeaturedFoods = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }

            const response = await axios.get('http://127.0.0.1:8000/featured-foods/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            setSpecialPromos(response.data.slice(0, 4)); // Limit to 4 items
        } catch (error) {
            console.error("Error fetching featured foods:", error);
            Alert.alert('Error', 'Unable to fetch featured foods.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (csrfToken) {
                fetchBalance();
                fetchFeaturedFoods();
            }
        }, [csrfToken])
    );

    useEffect(() => {
        const checkNotifications = async () => {
            const notificationsRead = await AsyncStorage.getItem('notificationsRead');
            setHasUnreadNotifications(notificationsRead !== 'true');
        };

        checkNotifications();
    }, []);

    const handleNotificationsPress = async () => {
        await AsyncStorage.setItem('notificationsRead', 'true');
        setHasUnreadNotifications(false);
        navigation.navigate("Notif");
    };

    

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: SIZES.padding * 3 }}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={images.juanbytesLogo}
                        resizeMode="contain"
                        style={{
                            width: 100,
                            height: 100,
                        }}
                    />
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: COLORS.lightGray
                        }}
                        onPress={handleNotificationsPress}
                    >
                        <Image
                            source={icons.bell}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: COLORS.secondary
                            }}
                        />
                        {hasUnreadNotifications && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    height: 10,
                                    width: 10,
                                    backgroundColor: COLORS.red,
                                    borderRadius: 5
                                }}
                            >
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    function renderUserBalance() {
        return (
            <View
                style={{
                    height: 100,
                    borderRadius: 30,
                    backgroundColor: COLORS.lightGray,
                    paddingHorizontal: SIZES.padding * 3,
                    paddingVertical: SIZES.padding,
                    marginHorizontal: SIZES.padding * 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
                    elevation: 6,
                }}
            >
                <View>
                    <Text style={{ ...FONTS.body3, color: COLORS.gray }}>Available Balance</Text>
                    <Text style={{ ...FONTS.h2 }}>₱{balance}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        style={{
                            width: 35,
                            height: 35,
                            borderRadius: 20,
                            backgroundColor: COLORS.lightorrange,
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
    
    function renderFeatures() {
        const Header = () => (
            <View style={{ marginBottom: SIZES.padding * 2 }}>
                <Text style={{ ...FONTS.h3 }}>Features</Text>
            </View>
        );

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ marginBottom: SIZES.padding * 2, width: 60, alignItems: 'center' }}
                onPress={() => {
                    if (item.screen) {
                        navigation.navigate(item.screen);
                    } else {
                        console.log(item.description);
                    }
                }}
            >
                <View
                    style={{
                        height: 50,
                        width: 50,
                        marginBottom: 5,
                        borderRadius: 20,
                        backgroundColor: item.backgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.15,
                        shadowRadius: 2.84,
                        elevation: 3,
                        
                    }}
                >
                    <Image
                        source={item.icon}
                        resizeMode="contain"
                        style={{
                            height: 20,
                            width: 20,
                            tintColor: item.color
                        }}
                    />
                </View>
                <Text style={{ textAlign: 'center', flexWrap: 'wrap', ...FONTS.body4 }}>{item.description}</Text>
            </TouchableOpacity>
        );

        return (
            <FlatList
                ListHeaderComponent={Header}
                data={features}
                numColumns={4}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                // keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                style={{ marginTop: SIZES.padding * 2 }}
            />
        );
    }

    function renderPromos() {
        const HeaderComponent = () => (
            <View>
                {renderHeader()}
                {renderUserBalance()}
                {renderFeatures()}
                {renderPromoHeader()}
            </View>
        );

        const renderPromoHeader = () => (
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: SIZES.padding
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text style={{ ...FONTS.h3 }}>Featured Foods</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("FeaturedFoods")}>
                    <Text style={{ color: COLORS.primary, ...FONTS.body4 }}>View All</Text>
                </TouchableOpacity>
            </View>
        );

        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={{ marginVertical: SIZES.base, width: SIZES.width / 2.5 }}
                onPress={() => navigation.navigate("OrderCreate", { meal: item.food, canteenName: item.canteenName })}
                >
                <View
                    style={{
                        height: 150,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: COLORS.lightGray,
                        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
                        elevation: 6,
                    }}
                >
                    <Image
                        source={images.promoBanner}
                        resizeMode="cover"
                        style={{
                            width: "100%",
                            height: "100%",
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}
                    />
                </View>
                <View
                    style={{
                        padding: SIZES.padding,
                        backgroundColor: COLORS.white,
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                >
                    <Text style={{ ...FONTS.h4 }}>{item.food.name}</Text>
                    <Text style={{ ...FONTS.body4 }}>{item.food.description}</Text>
                </View>
            </TouchableOpacity>
        );

        return (
            <FlatList
                ListHeaderComponent={HeaderComponent}
                contentContainerStyle={{ paddingHorizontal: SIZES.padding * 4 }}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                // keyExtractor={item => `${item.id}`}
                data={specialPromos}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <View style={{ marginBottom: 80 }}>
                    </View>
                }
            />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: SIZES.padding }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ ...FONTS.h3 }}>Loading...</Text>
                </View>
            ) : (
                renderPromos()
            )}
        </SafeAreaView>
    );
};

export default Home;
