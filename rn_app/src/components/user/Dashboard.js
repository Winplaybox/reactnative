import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { points } from '../common/Values';
import { gqlOptions } from '../../utils/Fetch';
import storage from './../../utils/Storage';


import Avatar from './Avatar';

const { width, height } = Dimensions.get('window');
const uploads = config.ConfigSettings.uploadsFolder;
class ActsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            loading: true,
            imgLimit: 3
        }
        this.mounted = true;
        this.graphql();
    }

    componentDidMount() {
        this.props.log(`My user data exists: ${this.props.myUserData.length}`)
        if (this.props.myUserData.length == 0) {
            //this.graphql();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{ 
            users (id: "${this.props.activeAccount.emp_id}") { 
                firstName, lastName, gender, emp_id, _id, dob, avatar, 
                media { 
                    name, likes_count, view_count, _id
                    comments { _id }
                }, 
                comments { _id }, 
                acts { name, _id } 
            } 
        }`;
        let fetchOptions = gqlOptions(query);
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.props.log('user data loaded');
                    this.props.log(res);
                    this.props.setMyData(res.data.users);
                    this.setState({ userInfo: res.data.users, loading: false })
                    this.props.log(this.state.userInfo)
                }
            })
            .catch((error) => {
                this.props.log(`error in :${query}`);
                this.props.log(error);
            });
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    showActInfo = (id) => {
        this.props.showActInfo(id)
    }

    logout = () => {
        storage.remove("user", () => {
            this.props.log("removed user data from storage");
        })
        this.props.logout();
        this.props.clearHistory();
    }

    openPhoto = (id) => {
        this.props.setPhotoId(id)
        this.props.navTo("photo");
    }

    deleteConfirmation = (id, i) => {
        Alert.alert(
            'Delete confirmation',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Yes', onPress: () => this.deleteMedia(id, i) },
                { text: 'No', onPress: () => { }, style: 'cancel' },
            ],
            { cancelable: true }
        )
    }

    deleteMedia = (id, i) => {
        let query = `mutation { deletePhoto (id: "${id}") { name } }`;
        let fetchOptions = gqlOptions(query);
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('delete ' + i);
                    console.log(res)
                    console.log(this.state.userInfo)
                    let _userInfo = [...this.state.userInfo];
                    _userInfo[0].media.splice(i,1);
                    console.log(_userInfo)
                    this.graphql()
                }
            })
            .catch((error) => {
                this.props.log(error);
                if (this.mounted) this.setState({ refreshing: false });
            });
    }

    getAge = (dateString) => {
        var today = new Date();
        var birthDate = new Date(parseInt(dateString));
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    showActInfo = (id) => {
        console.log(`show act`)
        this.props.showActInfo(id);
        this.props.navTo("act");
    }

    getPointsCount = (media, comments) => {
        console.log('calc points tally')
        console.log(media)
        let count = comments.length * points.selfComment;
        media.map(m => {
            count += points.photoUpload;
            count += m.view_count * points.view;
            count += m.comments.length * points.comment;
            count += m.likes_count * points.like;
        })
        return count;
    }

    getLikesCount = (media) => {
        let count = 0;
        media.map(m => {
            count += m.likes_count;
        })
        return count;
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: colors.color5 }}>

                {
                    this.props.myUserData.length != 0 ?
                        this.props.myUserData.map((user, k) =>
                            <ScrollView key={k} style={styles.actContainer} showsVerticalScrollIndicator={false}>


                                <View style={{ flexDirection: "column", alignItems: 'center', justifyContent: "center", backgroundColor: colors.color2, paddingVertical: 20 }}>
                                    <Text style={{ color: '#fff', fontFamily: fonts.galano, fontSize: 24, textAlign: 'center' }}>My Profile</Text>
                                    <View style={{ width: width / 4, height: width / 4, overflow: 'hidden', borderRadius: width, borderWidth: 5, borderColor: colors.color6, marginVertical: 20 }}>
                                        <Avatar gender={user.gender} config={user.avatar} bg={colors.color6} />
                                    </View>
                                    <View style={{ justifyContent: 'center', marginTop: 5 }}>
                                        <Text style={styles.actName}>{user.firstName} {user.lastName}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: "center" }}>
                                            <Text style={{ ...styles.age }}>{user.gender == "male" ? "Male" : "Female"}, {this.getAge(user.dob)}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', backgroundColor: 'red', alignItems: 'center' }}>
                                    <View style={{ ...styles.highlight, backgroundColor: colors.color1 }}>
                                        <Text style={styles.highlightNum}>{this.getPointsCount(user.media, user.comments)}</Text>
                                        <Text style={{ ...styles.highlightLabel, color: '#fff' }}>Points</Text>
                                    </View>
                                    <View style={{ ...styles.highlight }}>
                                        <Text style={styles.highlightNum}>{user.media.length}</Text>
                                        <Text style={styles.highlightLabel}>Photos</Text>
                                    </View>
                                    <View style={{ ...styles.highlight, backgroundColor: colors.color5 }}>
                                        <Text style={styles.highlightNum}>{this.getLikesCount(user.media)}</Text>
                                        <Text style={styles.highlightLabel}>Likes</Text>
                                    </View>
                                </View>


                                <View style={{ backgroundColor: colors.color2, marginTop: 20, paddingBottom: 20, marginTop: 2 }}>
                                    {user.media.length > 0 ? <View>
                                        <Text style={{ ...styles.cw, marginTop: 50, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 }}>My Photos</Text>
                                        <Text style={{ color: colors.color6, paddingHorizontal: 15 }}>{user.media.length} photo(s) uploaded so far</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', backgroundColor: colors.color2 }}>
                                            {user.media.map((m, i) =>
                                                i < this.state.imgLimit && <View key={i} style={{ position: 'relative' }}>
                                                    <TouchableOpacity onPress={() => this.openPhoto(m._id)}>
                                                        <Image style={styles.photos} source={{ uri: uploads + m.name }} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.deleteConfirmation(m._id, i)} style={{ backgroundColor: colors.color5, position: 'absolute', top: 0, right: 0, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={{color: '#fff', fontFamily: fonts.iconLight, fontSize: 18}}>&#xf00d;</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                        {this.state.imgLimit != 9999 && <Text style={{ ...styles.cw, marginTop: 10, textAlign: "right", padding: 15, paddingVertical: 10 }} onPress={() => this.setState({ imgLimit: 9999 })}>View All</Text>}
                                    </View> : <View></View>}

                                    {user.acts.length > 0 ? <View>
                                        <Text style={{ ...styles.cw, marginTop: 30, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 }}>My Activities</Text>
                                        {/* <Text style={{ color: colors.color6, paddingHorizontal: 15 }}>Participant in {user.acts.length} act{user.acts.length != 1 && 's'}</Text> */}
                                        <View style={{ flexDirection: 'column', marginTop: 10, paddingHorizontal: 15 }}>
                                            {user.acts.map((a, i) =>
                                                <View key={i}>
                                                    <Text onPress={() => this.showActInfo(a._id)} style={{ color: colors.color6, fontFamily: fonts.galano }} key={i}>{i + 1}. {a.name}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View> : <View></View>}

                                </View>

                                <Text onPress={this.logout} style={{ marginTop: 30, fontWeight: "bold", fontSize: 18, marginBottom: 30, paddingHorizontal: 15, color: colors.color1 }}>Logout</Text>

                            </ScrollView>
                        )
                        : <View>
                            <Text>Loading user data {this.props.myUserData.length}</Text>
                        </View>
                }
            </View>
        );
    }
}

//cf71f2
const styles = {
    actContainer: {
        borderRadius: 10
    },
    actName: {
        fontSize: 30, color: colors.color1, fontFamily: fonts.galano
    },
    actType: {
        color: "#fff"
    },
    actTime: {
        color: "#fff"
    },
    age: {
        color: colors.color6, fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginTop: 5
    },
    cw: {
        color: "white"
    },
    photos: {
        width: width / 3, height: width / 3, borderWidth: 1, borderColor: colors.color2
    },
    highlight: {
        backgroundColor: colors.color3, height: 60, flex: 1, justifyContent: 'center', alignItems: 'center'
    },
    highlightNum: {
        color: '#fff', fontSize: 24, fontFamily: fonts.galano
    },
    highlightLabel: {
        color: '#ccc'
    }
}


function mapStateToProps(state) {
    return {
        act_id: state.acts.act_id,
        activeAccount: state.common.activeAccount,
        myUserData: state.common.myUserData
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        logout: () => dispatch({ type: 'SIGN_OUT' }),
        clearHistory: () => dispatch({ type: 'CLEAR_NAV_HISTORY' }),
        setMyData: (data) => dispatch({ type: 'LOAD_MY_USER_DATA', userData: data }),
        showActInfo: (id) => dispatch({ type: 'SHOW_ACT_INFO', id: id }),
        setPhotoId: (_id) => dispatch({ type: 'SHOW_PHOTO_ID', id: _id })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(ActsList);