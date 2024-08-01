import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Picker } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, images } from "../../../constants";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderCreate = ({ route }) => {
    const { meal, canteenName } = route.params;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');
    const [quantity, setQuantity] = useState(1); // Default quantity

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
    }, []);

    const handleOrder = async () => {
        setLoading(true);
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                return;
            }

            const response = await axios.post(`http://127.0.0.1:8000/create-order/`, 
                { 
                    food: meal.id, 
                    quantity: quantity 
                }, 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            Alert.alert("Success", "Order created successfully");
            navigation.navigate("OrderList");
        } catch (error) {
            console.error("Error creating order:", error.response.data);
            Alert.alert("Error", "There was an error creating the order.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Place Order</Text>
                </View>
            </View>

            <View style={styles.topOrderContainer}>
    <Image source={images.promoBanner} style={styles.topOrderImage} />
    <View style={styles.topOrderDetails}>
    <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealDescription}>{meal.description}</Text>
    </View>
</View>
            <View style={styles.orderContainer}>
                <View style={styles.mealContainer}>
                    <Image source={images.promoBanner} style={styles.mealImage} />
                    <View style={styles.mealDetails}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <View style={styles.quantityContainer}>
                            <Text style={styles.quantityLabel}>Quantity:</Text>
                            <Picker
                                selectedValue={quantity}
                                style={styles.picker}
                                onValueChange={(itemValue) => setQuantity(itemValue)}
                            >
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Picker.Item key={value} label={`${value}`} value={value} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.mealPrice}>₱{meal.price}</Text>
                    </View>
                </View>

                <View style={styles.orderSummaryContainer}>
                    <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                    <View style={styles.summaryDetails}>
                        <Text style={styles.summaryText}>Quantity:</Text>
                        <Text style={styles.summaryText}>{quantity}</Text>
                    </View>
                    <View style={styles.summaryDetails}>
                        <Text style={styles.summaryText}>Price per Meal:</Text>
                        <Text style={styles.summaryText}>₱{meal.price}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.totalContainer}>
    <View style={styles.totalTextRow}>
        <Text style={styles.totalLabel}>Total Price</Text>
        <Text style={styles.totalPrice}>₱{meal.price * quantity}</Text>
    </View>
    <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
        <Text style={styles.orderButtonText}>Place order</Text>
    </TouchableOpacity>
</View>



          
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topOrderContainer: {
        alignItems: 'center',
        padding: SIZES.padding * 2,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,

    },
    topOrderImage: {
        marginVertical: SIZES.shortbase,
        marginHorizontal: SIZES.padding,
        padding: SIZES.padding * 5,
        width: "100%",
        height: "110%",
        resizeMode: 'cover',
        marginBottom: SIZES.padding,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    topOrderDetails: {
        alignItems: 'flex-start',
        width: '100%',
        paddingHorizontal: SIZES.padding * 2,
    },
    topOrderText: {
        ...FONTS.h3,
        color: COLORS.black,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    
    header: {
        flexDirection: 'row',
        marginTop: SIZES.padding * 5,
        marginVertical: SIZES.padding * 2,
        paddingHorizontal: SIZES.padding * 2,
        alignItems: 'center',
    },
    iconButton: {
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: COLORS.black,
        ...FONTS.h3,
    },
    orderContainer: {
        paddingHorizontal: SIZES.padding * 2,
        marginTop: SIZES.padding * 8,


    },
    mealContainer: {
        flexDirection: 'row',
        marginBottom: SIZES.padding * 2,
        // borderRadius: 20,
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
    },
    mealImage: {
        width: 150,
        height: 150,
        resizeMode: 'cover',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mealDetails: {
        flex: 1,
        marginLeft: SIZES.padding,
        justifyContent: 'center',
    },
    mealName: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.padding * 0.5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.padding * 0.5,
    },
    quantityLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginRight: SIZES.padding,
    },
    picker: {
        width: 100,
    },
    mealPrice: {
        ...FONTS.h4,
        color: COLORS.black,
    },
    orderSummaryContainer: {
        padding: SIZES.padding,
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    orderSummaryTitle: {
        ...FONTS.h2,
        color: COLORS.black,
        marginBottom: SIZES.padding,
    },
    summaryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.padding * 0.5,
    },
    summaryText: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    totalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: SIZES.padding * 2,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        alignItems: 'center',
    },
    totalTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SIZES.padding,
    },
    totalLabel: {
        ...FONTS.h2,
        color: COLORS.black,
    },
    totalPrice: {
        ...FONTS.h2,
        color: COLORS.black,
    },
    orderButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SIZES.padding * 1.5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 0, // Ensure no horizontal margin
      },
      orderButtonText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OrderCreate;
