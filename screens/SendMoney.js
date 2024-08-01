import React, { useState, useEffect } from "react";
import { Alert, SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, SIZES, FONTS, icons } from "../constants";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SendMoney = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState('');

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
            } catch (error) {
                console.error("Error fetching balance:", error);
                Alert.alert('Error', 'Unable to fetch balance.');
            }
        };

        if (csrfToken) {
            fetchBalance();
        }
    }, [csrfToken]); // Only run when csrfToken changes

    const handleTransfer = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password.');
            return;
        }
    
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken || !csrfToken) {
                console.error('Token or CSRF Token not available');
                return;
            }
    
            // Verify the password
            const passwordResponse = await axios.post('http://127.0.0.1:8000/verify-password/', { password }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-CSRFToken': csrfToken,
                },
            });
    
            if (passwordResponse.status === 200) {
                const transferData = {
                    recipient_phone_number: recipientPhoneNumber,
                    amount: parseFloat(transferAmount),
                };
    
                const transferResponse = await axios.post('http://127.0.0.1:8000/transfer/', transferData, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-CSRFToken': csrfToken,
                    },
                });
    
                if (transferResponse.status === 200) {
                    Alert.alert('Success', transferResponse.data.message);
                    // Refresh the balance after successful transfer
                    await fetchBalance();
                    setShowPasswordPrompt(false); // Hide the password prompt
                }
            } else {
                Alert.alert('Error', 'Incorrect password.');
            }
        } catch (error) {
            console.error('Error during transfer:', error);
    
            // Check if the error is related to sending money to oneself
            if (error.response && error.response.data && error.response.data.error) {
                const errorMessage = error.response.data.error;
                if (errorMessage === 'Cannot transfer money to yourself') {
                    Alert.alert('Error', errorMessage);
                } else {
                    Alert.alert('Error', 'Unable to complete the transfer.');
                }
            } else {
                Alert.alert('Error', 'Unable to complete the transfer.');
            }
        }
    };
    
    // Function to fetch and set the updated balance
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
        } catch (error) {
            console.error("Error fetching balance:", error);
            Alert.alert('Error', 'Unable to fetch balance.');
        }
    };

    const handleAmountChange = (text) => {
        // Remove all non-numeric characters except the decimal point
        const cleanedText = text.replace(/[^0-9.]/g, '');

        // Check for multiple decimal points
        const parts = cleanedText.split('.');
        if (parts.length > 2) {
            return; // More than one decimal point is not allowed
        }

        // Limit decimal places to 2
        const formattedText = parts[0] + (parts[1] ? `.${parts[1].slice(0, 2)}` : '');

        setTransferAmount(formattedText);
    };

    function renderHeader() {
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        style={styles.icon}
                    />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Send Money</Text>
                </View>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => console.log("Settings")}
                >
                    <Image
                        source={icons.settings}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    const handleShowPasswordPrompt = () => {
        if (recipientPhoneNumber && transferAmount) {
            setShowPasswordPrompt(true);
        } else {
            Alert.alert('Error', 'Please fill in phone number and amount.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                {/* Display user balance */}
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>₱{balance}</Text>
                </View>

                {/* Form to input phone number and amount */}
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={recipientPhoneNumber}
                        onChangeText={setRecipientPhoneNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        keyboardType="numeric"
                        value={transferAmount}
                        onChangeText={handleAmountChange}
                    />
                    {showPasswordPrompt ? (
                        <View style={styles.passwordPrompt}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleTransfer}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, (!recipientPhoneNumber || !transferAmount) && { opacity: 0.5 }]}
                            onPress={handleShowPasswordPrompt}
                            disabled={!recipientPhoneNumber || !transferAmount}
                        >
                            <Text style={styles.buttonText}>Send</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

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
    icon: {
        height: 20,
        width: 20,
        tintColor: COLORS.black,
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
    content: {
        paddingHorizontal: SIZES.padding * 3,
        flex: 1,
    },
    balanceContainer: {
        marginBottom: SIZES.padding * 2,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding * 2,
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        boxShadow: "0px 3px 4.65px rgba(0, 0, 0, 0.2)",
        elevation: 3,
    },
    balanceLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    balanceAmount: {
        ...FONTS.h2,
        color: COLORS.black,
    },
    form: {
        borderRadius: 10,
        backgroundColor: COLORS.lightGray,
        padding: SIZES.padding * 2,
    },
    input: {
        height: 50,
        marginBottom: SIZES.padding,
        paddingHorizontal: SIZES.padding,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        borderColor: COLORS.gray,
        borderWidth: 1,
        ...FONTS.body4,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.padding,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    passwordPrompt: {
        marginTop: SIZES.padding * 2,
    }
});

export default SendMoney;
