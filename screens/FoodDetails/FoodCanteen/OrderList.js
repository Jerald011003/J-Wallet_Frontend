import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, TextInput, Image } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, images } from "../../../constants";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderList = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('Access token not available');
                    return;
                }

                const response = await axios.get('http://127.0.0.1:8000/orders/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                console.log(response.data); // Add this line to check the response
                setOrders(response.data);

                const userResponse = await axios.get('http://127.0.0.1:8000/details/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                setUser(userResponse.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                Alert.alert("Error", "There was an error fetching the orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handlePayNow = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const handleTransfer = async () => {
        if (!password) {
            Alert.alert("Error", "Please enter your password.");
            return;
        }

        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                console.error('Access token not available');
                return;
            }

            // Verify the password
            const passwordResponse = await axios.post('http://127.0.0.1:8000/verify-password/', { password }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (passwordResponse.status === 200) {
                const response = await axios.post('http://127.0.0.1:8000/transfer/', {
                    recipient_phone_number: selectedOrder.vendor_phone_number,
                    amount: selectedOrder.total_price,
                }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                // Update order payment status
                await axios.patch(`http://127.0.0.1:8000/orders/${selectedOrder.id}/pay/`, {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                Alert.alert("Success", "Payment successful.");
                setModalVisible(false);
                setOrders((prevOrders) => prevOrders.map((order) =>
                    order.id === selectedOrder.id ? { ...order, is_paid: true } : order
                ));
            } else {
                Alert.alert("Error", "Incorrect password.");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            Alert.alert("Error", "There was an error processing the payment.");
        }
    };

    const renderItem = ({ item }) => {
        const isBuyer = user && item.user === user.email;
        const isVendor = user && item.vendor === user.email;
    
        return (
            <View style={styles.orderContainer}>
                <View style={styles.orderContent}>
                    {item.food && (
                        <Image source={{ uri: images.promoBanner }} style={styles.foodImage} />
                    )}
                    <View style={styles.orderDetails}>
                        {item.food && (
                            <>
                                <Text style={styles.foodName}>{item.food.name}</Text>
                                <Text style={styles.foodDescription}>{item.food.description}</Text>
                                <Text style={styles.foodPrice}>₱{item.food.price}</Text>
                            </>
                        )}
                        <Text style={styles.orderQuantity}>Quantity: {item.quantity}</Text>
                        <Text style={styles.totalPrice}>Total: ₱{item.total_price}</Text>
                        <Text style={styles.orderedBy}>Ordered by {isBuyer ? "You" : item.user}</Text>
                        <Text style={styles.orderDate}>Ordered on: {new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                {isBuyer && !item.is_paid && (
                    <TouchableOpacity style={styles.payButton} onPress={() => handlePayNow(item)}>
                        <Text style={styles.payButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                )}
                {isVendor && <Text style={styles.vendorViewText}>Vendor View</Text>}
                {item.is_paid && <Text style={styles.paidText}>Paid</Text>}
            </View>
        );
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
                    onPress={() => navigation.navigate("Home")}
                >
                    <Icon name="arrow-left" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Orders</Text>
                </View>
            </View>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders found</Text>}
                // numColumns={2}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Confirm Payment</Text>
                        <Text style={styles.modalText}>Vendor Email: {selectedOrder?.vendor}</Text>
                        <Text style={styles.modalText}>Vendor Phone no.: {selectedOrder?.vendor_phone_number}</Text>
                        <Text style={styles.modalText}>Enter your password to confirm the payment of ₱{selectedOrder?.total_price}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleTransfer}>
                                <Text style={styles.modalButtonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    orderContainer: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    orderContent: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    foodImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
    },
    orderDetails: {
        flex: 1,
        marginLeft: 10,
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodDescription: {
        fontSize: 14,
        color: '#555',
    },
    foodPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    orderQuantity: {
        fontSize: 14,
        color: '#555',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    orderedBy: {
        fontSize: 14,
        color: '#555',
    },
    orderDate: {
        fontSize: 14,
        color: '#555',
    },
    payButton: {
        backgroundColor: '#ff5a5f',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    vendorViewText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    paidText: {
        fontSize: 14,
        color: '#28a745',
        textAlign: 'center',
    },


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
    contentContainer: {
        paddingHorizontal: SIZES.padding * 3,
    },
    buyerOrderItem: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        padding: SIZES.padding,
        marginVertical: SIZES.padding * 0.5,
        flex: 1,
        marginHorizontal: SIZES.padding * 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    vendorOrderItem: {
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        padding: SIZES.padding,
        marginVertical: SIZES.padding * 0.5,
        flex: 1,
        marginHorizontal: SIZES.padding * 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyText: {
        ...FONTS.h4,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: SIZES.padding * 2,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        ...FONTS.h2,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        ...FONTS.body3,
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: COLORS.gray,
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: COLORS.white,
        ...FONTS.h4,
    },
});

export default OrderList;