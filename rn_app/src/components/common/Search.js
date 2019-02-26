import React, { Component } from 'react';
import { View, Text, Keyboard, Platform, TextInput, Dimensions, Animated, Image, Easing } from 'react-native';
import { colors, sizes } from './Styles';
import { connect } from 'react-redux';
import storage from './../../utils/Storage';
import { config } from '../../../config';

const os = Platform.OS;
const { width, height } = Dimensions.get('window');
const animDuration = {
    xl: 600,
    lg: 400,
    md: 250,
    sm: 100
}

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = { term: '' }
        this.searchVisibility = new Animated.Value(0);
    }

    openSearch = () => {
        Animated.parallel([
            Animated.timing(this.searchVisibility, { toValue: 1, duration: 200 })
        ]).start();
        this.searchInput.focus();
    }

    closeSearch = () => {        
        Keyboard.dismiss();
        Animated.parallel([
            Animated.timing(this.searchVisibility, { toValue: 0, duration: 200 })
        ]).start();
        this.searchInput.clear();
    }

    search = () => {
        this.props.sort();
        this.props.setCategoryGuid();

        if (this.props.routes.active == 'ProductListing') {
            this.props.loadProducts([]);
            this.props.onSearch(); // defined in header.js
        } else {
            this.props.navTo("ProductListing");
        }
    }

    fetchSearchedProductsGUIDs = (searchTerm) => {
        let _searchTerm = searchTerm.toLocaleLowerCase();
        this.props.log(`search: ${_searchTerm}`);
        this.props.search(_searchTerm);
        this.props.setSearchedProductsGUIDs('');

        let _fetchSearchedProductsGUIDs = this.fetchSearchedProductsGUIDs;

        let headers = {
            "WebsiteGuid": config.ConfigSettings.Website_GUID,
            "LanguageGuid": config.ConfigSettings.Language_GUID,
            "Authorization": 'Bearer ' + this.props.tokens['SaaS_Product_Microservice'],
            "Content-Type": "application/json"
        }

        let fetchOptions = {
            method: 'GET',
            headers: headers
        }
        let uri = `${config.ConfigSettings.SaaS_Product_Microservice.url}/api/Products/GetSearchedProducts?searchText=${_searchTerm}`;

        fetch(uri, fetchOptions)
            .then(res => res.json())
            .then(res => {
                this.props.setSearchedProductsGUIDs(res.join(","));
                this.search();
            })
            .catch((error) => {
                console.log(uri);
                console.log(error);
                if (retry < 3) {
                    setTimeout(() => {
                        console.log("retry attempt" + retry);
                        _fetchSearchedProductsGUIDs(++retry, delay * 2);
                    }, delay);
                } else {
                    // listing fetch failed
                    // show error message
                }
            });
    }

    autocomplete = () => {

    }

    render() {

        let menuText = ["Home", "My Account", "Previous Catalogs", "View All Products", "Privacy Notice", "Terms of Use", "Logout"];
        menuText = menuText.map(m => m.toLocaleUpperCase());

        let bottom = this.searchVisibility.interpolate({
            inputRange: [0, 1],
            outputRange: [sizes.headerHeight * -1, 12]
        });

        return (
            <Animated.View style={{ ...styles.searchBox, bottom: bottom }}>
                <TextInput
                    ref={input => { this.searchInput = input }}
                    keyboardType="default"
                    style={styles.searchInput}
                    onSubmitEditing={(event) => this.fetchSearchedProductsGUIDs(event.nativeEvent.text)}
                    onChangeText={(text) => this.setState({ term: text })}
                    placeholder="search for products"
                    placeholderTextColor="#999" />
            </Animated.View>
        );
    }
}

let left = (os == 'ios') ? 90 : 55;
let searchWidth = width - left - 55;
const styles = {
    searchBox: {
        position: 'absolute',
        left: left,
        width: searchWidth
    },
    searchInput: {
        backgroundColor: colors.color4, color: '#fff', fontSize: 20, borderBottomWidth: 1, borderBottomColor: colors.color5, paddingBottom: 5
    },
    sidebarContainer: {
        backgroundColor: '#3c3c41', padding: 15, flexDirection: 'column', position: 'absolute', top: 0, width: width, height: height
    },
    menuButton: {
        flexDirection: 'row', height: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: "#333", transform: [{ translateX: 0 }]
    },
    menuItemText: {
        marginLeft: 15, fontSize: 18, fontWeight: 'bold', color: colors.color5
    },
    menuItemIcon: {
        color: colors.color2, fontSize: 24, fontFamily: 'FontAwesome5ProSolid', width: 24, textAlign: 'center'
    }
}

function mapStateToProps(state) {
    return {
        routes: state.routes,
        menuOpen: state.ui.menuOpen,
        tokens: state.tokens
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        setCategoryGuid: () => dispatch({ type: 'SET_LISTING_CATEGORY_GUID', guid: '' }),
        sort: () => dispatch({ type: 'SORT_BY', sortBy: '' }),
        setSearchedProductsGUIDs: (guids) => dispatch({ type: 'SET_SEARCHED_PRODUCTS_GUIDS', guids: guids }),
        loadProducts: (products) => dispatch({ type: 'LOAD_PRODUCTS', products: products }),
        search: (searchTerm) => dispatch({ type: 'SEARCH_BY_TEXT', searchTerm: searchTerm })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch, null, { withRef: true })(Search)