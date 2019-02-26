import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, Text, View, Linking, Animated, Image, TextInput, TouchableOpacity, Dimensions, Keyboard, Platform, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';

import { colors, sizes, fonts } from '../common/Styles'
import { config } from '../../../config';
import storage from '../../utils/Storage';
import { processResponse } from '../../utils/Fetch';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const animDuration = {
    xl: 600,
    lg: 400,
    md: 250,
    sm: 100
}

class Login extends Component {
    formHeightPercent = (290 / SCREEN_HEIGHT) * 100;
    //formHeightPercent = 30;

    constructor(props) {
        super(props);

        this.state = {
            pointerEvents: 'none',
            emailPlaceholder: 'enter email address',
            pswrdPlaceholder: 'enter password',
            passKeyboardVisibility: 'default',
            username: '',
            password: ''
        }
    }

    componentWillMount() {
        this.formOpen = new Animated.Value(0);
        this.emailActive = new Animated.Value(0);
        this.pswrdActive = new Animated.Value(0);
        this.signingIn = new Animated.Value(0);

        this.kbdWillShowListener = Keyboard.addListener('keyboardWillShow', this.kbdShow);
        this.kbdWillHideListener = Keyboard.addListener('keyboardWillHide', this.kbdClose);
        this.kbdDidShowListener = Keyboard.addListener('keyboardDidShow', this.kbdShow);
        this.kbdDidHideListener = Keyboard.addListener('keyboardDidHide', this.kbdClose);
    }

    componentDidMount() {
        console.log(this.props)
    }

    kbdClose = (event) => {
        this.decreaseHeight();
    }

    kbdShow = (event) => {
        this.props.log("show keyboard")
        this.increaseHeight();
    }

    increaseHeight = () => {
        this.props.log("inc");
        Animated.timing(this.formOpen, { toValue: 1, duration: 400 }).start(() => {
            //this.refs.inputEmail.focus();
            this.setState(previousState => (
                {
                    pointerEvents: 'auto',
                    emailPlaceholder: 'abc@xyz.com',
                    pswrdPlaceholder: '********'
                }
            ));
        });
    }

    decreaseHeight = () => {
        this.props.log("dec");
        Keyboard.dismiss();
        Animated.timing(this.formOpen, { toValue: 0, duration: 400 }).start(() => {
            this.setState(previousState => ({ pointerEvents: 'none' }));
        });

        Animated.parallel([
            Animated.timing(this.emailActive, { toValue: 0, duration: animDuration.md }),
            Animated.timing(this.pswrdActive, { toValue: 0, duration: animDuration.md })
        ]).start();
    }

    setEmailActiveBG = () => {
        Animated.parallel([
            Animated.timing(this.emailActive, { toValue: 1, duration: animDuration.md }),
            Animated.timing(this.pswrdActive, { toValue: 0, duration: animDuration.md })
        ]).start();
    }

    setPswrdActiveBG = () => {
        Animated.parallel([
            Animated.timing(this.emailActive, { toValue: 0, duration: animDuration.md }),
            Animated.timing(this.pswrdActive, { toValue: 1, duration: animDuration.md })
        ]).start();
    }

    showPassword = () => {
        this.setState(previousState => ({ passKeyboardVisibility: 'visible-password' }));
        this.props.log(this.state.passKeyboardVisibility)
    }

    hidePassword = () => {
        this.setState(previousState => ({ passKeyboardVisibility: 'default' }));
        this.props.log(this.state.passKeyboardVisibility)
    }

    showSigninLoader = () => {
        this.decreaseHeight();
        this.signInLoader.fadeInUp(300);
    }

    hideSigninLoader = () => {
        this.signInLoader.fadeOutDown(800);
    }

    submitLoginForm = () => {
        let username = this.state.username;
        let password = this.state.password;
        let formValid = true;

        if(username == "" || password == "") {
            formValid = false;
        }

        if (formValid) {
            this.login(username, password);
        } else {
            if (username.length < 5) {
                Alert.alert(
                    'Invalid Employee ID',
                    'Please enter a valid id.',
                    [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ],
                    { cancelable: false }
                )
            } else if (password.length < 10) {
                Alert.alert(
                    'Invalid password',
                    'Password is incorrect.',
                    [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ],
                    { cancelable: false }
                )
            } 
        }
    }

    login = (usr, pass) => {

        this.showSigninLoader();

        let fetchOptions = {
            method: 'POST',
            body: JSON.stringify({ "emp_id": usr, "dob": pass }),
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' }
        }
        let uri = `${config.ConfigSettings.serverURI}users/login`;

        fetch(uri, fetchOptions)
            .then(processResponse)
            .then(res => {
                this.props.log(res);
                const { statusCode, data } = res;
                if (statusCode == 200) {
                    if(data.status) {
                        this.setUserData(data.data);
                        this.props.log(statusCode, "logged in");
                    } else {
                        this.loginFailAlert(JSON.stringify("Incorrect password."))
                    }
                } else {
                    this.props.log(statusCode, uri);
                }
            })
            .catch((error) => {
                this.props.log(uri);
                this.props.log(error);
                this.props.log(JSON.stringify(fetchOptions));
                this.hideSigninLoader();
                this.loginFailAlert(JSON.stringify(error))
            });
    }

    loginFailAlert = (msg) => {
        this.hideSigninLoader();
        Alert.alert(
            'An error occurred',
            msg,
            [
                { text: 'OK' },
            ],
            { cancelable: true }
        )
    }

    setUserData = (res) => {
        this.props.signInUser(res);
        this.props.onlogin(res);
    }

    registerUser = () => {
        Linking.openURL('https://philips.ewizsaas.com/Customer/Register');
    }

    shorPasswordHint = () => {
        Alert.alert(
            'Password Hint',
            'The password is your date of birth. Example: 1999-12-25',
            [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
        )
    }

    render() {

        let formHeight = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [sizes.loginFormHeight, SCREEN_HEIGHT]
        });

        let formTop = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_HEIGHT - sizes.loginFormHeight, 0]
        });

        let logoTop = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [(SCREEN_HEIGHT - sizes.loginFormHeight) / 2 - 45, 0] // 45 = logo height/2
        });

        let bgHeight = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [100 - this.formHeightPercent + '%', this.formHeightPercent + "%"]
        });

        let bgOpacity = this.formOpen.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [1, 0, 0]
        });

        let loginHeaderMarginTop = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 100]
        });

        let loginBackTop = this.formOpen.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 50]
        });

        let emailBG = this.emailActive.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(54, 55, 65, 1)", "rgba(24, 25, 65, 1)"]
        });

        let emailLabelColor = this.emailActive.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(54, 55, 65, 1)", "rgba(30, 200, 210, 1)"]
        });

        let pswrdBG = this.pswrdActive.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(237, 242, 245, 1)", "rgba(255, 255, 255, 1)"]
        });

        let pswrdLabelColor = this.pswrdActive.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(145, 155, 176, 1)", "rgba(30, 200, 210, 1)"]
        });


        return (
            <View style={{ flex: 1 }}>

                {/* Background */}
                {/* <LinearGradient
                    style={{ ...styles.lg, position: 'absolute', width: '100%', height: '100%' }}
                    start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
                    //colors={['#00e696', '#1ec8d2']}
                    colors={['#ffffff', '#e9e9e9']}>
                </LinearGradient> */}
                <View style={{ backgroundColor: colors.color5, position: 'absolute', width: '100%', height: '100%' }}>
                    <LinearGradient
                        style={{ ...styles.lg, position: 'absolute', width: '100%', height: '100%' }}
                        start={{ x: 0.5, y: 1 }} end={{ x: 0.8, y: 0.15 }}
                        locations={[0, 0.3, 1]}
                        colors={['#363741', '#363741', '#423a3c']}>
                    </LinearGradient>
                    {/* <Image style={{ width: SCREEN_WIDTH, height: 520, position: 'absolute', top: -200 }} source={require('../../../assets/images/zeal_bg.png')} resizeMode="cover" /> */}
                </View>

                {/* signify logo */}
                <Animated.View style={{ zIndex: 1000, position: 'absolute', top: logoTop, width: '100%' }}>
                    <Animated.View style={{ width: '100%', height: bgHeight, position: 'absolute', top: 0, ...styles.center }}>
                        <Animatable.View animation="zoomIn" iterationCount={1}>
                            <Animated.View style={{ opacity: bgOpacity, width: 250, height: 90, backgroundColor: 'rgba(255,255,255,0)', padding: 15, borderRadius: 5 }} >
                                {/* <Image
                                    style={{ flex: 1, alignSelf: 'stretch', width: undefined, height: undefined }}
                                    source={require('../../../assets/images/signify-logo.png')} resizeMode="contain" /> */}
                            </Animated.View>
                        </Animatable.View>
                    </Animated.View>
                </Animated.View>

                {/* login form */}
                <Animatable.View
                    animation="slideInUp" iterationCount={1}
                    style={{ backgroundColor: 'transparent', position: 'absolute', bottom: 0, width: '100%', top: 0 }}>
                    {/* '#f7f9fa' */}
                    <Animated.View style={{ height: formHeight, position: 'absolute', top: formTop, width: '100%', ...styles.center }}>


                        <View style={{ flex: 1, width: '100%', paddingHorizontal: 25, overflow: 'hidden' }}>

                            <Animated.View style={{ position: 'absolute', left: 25, zIndex: 1000, top: loginBackTop }}>
                                <TouchableOpacity onPress={this.decreaseHeight} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: colors.color6, fontSize: 36, fontFamily: 'FontAwesome5ProLight' }}>&#xf177;</Text>
                                    <Text style={{ color: colors.color6, fontSize: 22 }}>  Back</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.Text style={{ fontFamily: fonts.galano, fontSize: 30, opacity: 1, marginTop: loginHeaderMarginTop, marginBottom: 20, color: "#fff" }}>Welcome</Animated.Text>

                            {/* <TouchableOpacity > */}
                            <View pointerEvents='auto' style={{ overflow: "hidden" }}>
                                <Animated.View style={{ ...styles.formInputContainer }}>
                                    <Text style={styles.formInputIcon}>&#xf2c1;</Text>
                                    <View style={styles.inputLabelContainer}>
                                        <Animated.Text style={{ ...styles.inputLabel }} pointerEvents='none'>Employee ID</Animated.Text>
                                        <TextInput
                                            ref="inputEmail"
                                            keyboardType="numeric"
                                            style={styles.formInput}
                                            onFocus={this.setEmailActiveBG}
                                            onChangeText={(text) => this.setState({ username: text })}
                                            placeholder="12345" returnKeyType="go" />
                                    </View>
                                </Animated.View>
                                <Animated.View style={{ ...styles.formInputContainer }}>
                                    <Text style={styles.formInputIcon}>&#xf13e;</Text>
                                    <View style={styles.inputLabelContainer}>
                                        <Animated.Text style={{ ...styles.inputLabel }} pointerEvents='none'>Password</Animated.Text>
                                        <TextInput
                                            ref="inputPass"
                                            secureTextEntry={true}
                                            keyboardType={this.state.passKeyboardVisibility}
                                            style={{ ...styles.formInput }}
                                            onFocus={this.setPswrdActiveBG}
                                            onSubmitEditing={this.submitLoginForm}
                                            onChangeText={(text) => this.setState({ password: text })}
                                            placeholder="YYYY-MM-DD" returnKeyType="go" />
                                        <TouchableOpacity
                                            onPressIn={this.showPassword} onPressOut={this.hidePassword}
                                            style={{ position: 'absolute', right: 0, top: 42 }} >
                                            <Text style={{ color: colors.color6, fontSize: 24, fontFamily: 'FontAwesome5ProLight' }}>&#xf06e;</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>

                            </View>
                            {/* </TouchableOpacity> */}
                            <View style={{ marginTop: 5, marginBottom: 15 }}>
                                <Text onPress={() => this.shorPasswordHint()} style={{ fontSize: 16, color: colors.color1, textAlign: 'right', marginLeft: 'auto', paddingVertical: 15 }}>Forgot Password?</Text>
                            </View>

                            {/* login button */}
                            <View style={{ marginTop: 15, opacity: 1 }}>
                                <TouchableOpacity style={styles.loginBtn} onPress={this.submitLoginForm}>
                                    <Text style={{ fontSize: 20, color: '#fff', marginRight: 0 }}>Login</Text>
                                </TouchableOpacity>
                            </View>

                            {/* </TouchableOpacity> */}
                            <View style={{ marginTop: 30 }}>
                                <Text style={{ fontSize: 16, color: colors.color6, textAlign: 'center' }}>
                                    Can't access your account? Contact the HR Team.
                                </Text>
                            </View>

                        </View>
                    </Animated.View>
                </Animatable.View>


                {/* signing in loader */}
                <Animatable.View ref={ref => { this.signInLoader = ref }} style={{ flex: 1, opacity: 0 }} pointerEvents="none">
                    <View style={{ backgroundColor: colors.color5, flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={colors.color3} />
                        <Text style={{ textAlign: 'center', color: colors.color3, marginTop: 10, fontSize: 20 }}>Signing in</Text>
                    </View>
                </Animatable.View>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    center: {
        alignItems: 'center', justifyContent: 'center'
    },
    lg: {
        flex: 1, alignItems: 'center', justifyContent: 'center'
    },
    footerTop: {
        paddingHorizontal: 30, backgroundColor: '#fff', width: '100%', paddingBottom: 20
    },
    footerBottom: {
        height: 70, paddingHorizontal: 30, backgroundColor: '#fff', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopColor: '#e8e8e8', borderTopWidth: 1
    },
    footerLinks: {
        fontSize: 18, color: '#1ec8d2'
    },
    formInputContainer: {
        flexDirection: 'row', alignItems: 'center'
    },
    formInputIcon: {
        color: '#919bb0', fontSize: 30, fontFamily: 'FontAwesome5ProLight', width: 30, textAlign: 'center', display: "none"
    },
    inputLabelContainer: {
        height: 80, flex: 1
    },
    inputLabel: {
        position: 'absolute', zIndex: 9999, left: 0, top: 20, fontSize: 16, color: colors.color6
    },
    formInput: {
        fontSize: 20, borderColor: 'transparent', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, paddingTop: 45, color: "#d9dadb", borderBottomColor: colors.color2, borderBottomWidth: 1
    },
    forgotRow: {
        position: 'absolute', left: 0, flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20, paddingHorizontal: 25
    },
    forgotBtnText: {
        color: colors.color3, fontSize: 16
    },
    loginBtn: {
        width: '100%', height: 50, borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.color1, display: 'flex', flexDirection: 'row'
    },
    loginBtnTxt: {
        fontSize: 30, fontFamily: 'FontAwesome5ProLight', color: '#fff'
    }
});


function mapStateToProps(state) {
    return {
        //stat: state,
        common: state.common,
        //user: state.common.user,
        tokens: state.tokens
    }
}

function mapDispatchToProps(dispatch) {
    return {
        signInUser: (_userData) => dispatch({ type: 'SIGN_IN_USER', userData: _userData }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);

// next button should transform to loader with a solid background covering the entire screen
// once logged in, transition to home screen