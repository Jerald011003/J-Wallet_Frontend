import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, images } from "../../../constants";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllFoods = ({ route }) => {
    const { categoryId, categoryName, canteenName } = route.params;
    const navigation = useNavigation();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }, []);

    const fetchMeals = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Access token or CSRF token not available');
                return;
            }

            const response = await axios.get(`http://127.0.0.1:8000/categories/${categoryId}/foods/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken
                }
            });
            setMeals(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching meals:", error);
        }
    };

    useEffect(() => {
        if (csrfToken) {
            fetchMeals();
        }
    }, [csrfToken]);

    function renderHeader() {
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{categoryName} at {canteenName}</Text>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate("OrderCreate", { meal: item, canteenName })}
        >
            <View style={styles.imageContainer}>
                <Image source={images.promoBanner} style={styles.image} />
            </View>
            <View style={styles.textContainer}>
            <View style={styles.vendorContainer}>
                    <Image source={images.juanbytesLogo} style={styles.vendorLogo} />
                    <Text style={styles.vendorName}>{item.vendor}</Text>
                </View>

                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPrice}>₱{item.price}</Text>

                
                
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <FlatList
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                data={meals}
                keyExtractor={item => `${item.id}`}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={styles.footer} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        marginVertical: SIZES.padding * 5,
        paddingHorizontal: SIZES.padding * 3,
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
    listContainer: {
        paddingHorizontal: SIZES.padding * 3,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        marginVertical: SIZES.base,
        width: SIZES.width / 2.2,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 3,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        padding: SIZES.padding,
    },
    imageContainer: {
        width: '100%',
        height: 100,
        marginBottom: SIZES.base,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    // textRow: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     width: '100%',
    //     marginBottom: SIZES.padding,
    // },
    cardTitle: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base / 2,
    },
    cardPrice: {
        ...FONTS.h4,
        color: COLORS.black,
        marginBottom: SIZES.base,
    },
    vendorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: SIZES.base,
    },
    vendorLogo: {
        width: 20,
        height: 20,
        marginRight: SIZES.base,
    },
    vendorName: {
        ...FONTS.body4,
        color: COLORS.gray,
    },
    footer: {
        marginBottom: 80,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AllFoods;
