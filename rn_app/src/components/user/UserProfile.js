import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import imageCacheHoc from 'react-native-image-cache-hoc';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { points } from '../common/Values';
import { gqlOptions } from '../../utils/Fetch';
import storage from './../../utils/Storage';


import Avatar from './Avatar';

const { width, height } = Dimensions.get('window');
const uploads = config.ConfigSettings.uploadsFolder;
const CacheableImage = imageCacheHoc(Image, {});
class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: [],
            loading: true,
            imgLimit: 3
        }
        this.mounted = true;
    }

    componentDidMount() {
        this.mounted && this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{ 
            users (id: "${this.props.emp_id}") { 
                firstName, lastName, gender, emp_id, _id, dob, avatar, 
                media { 
                    name, likes_count, view_count, likes_count, _id
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

    openPhoto = (id) => {
        this.props.setPhotoId(id)
        this.props.navTo("photo");
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
                {this.state.userInfo.length != 0 ?
                    this.state.userInfo.map((user, k) =>
                        <ScrollView key={k} style={styles.actContainer} showsVerticalScrollIndicator={false}>


                            <View style={{ flexDirection: "column", alignItems: 'center', justifyContent: "center", backgroundColor: colors.color2, paddingVertical: 20 }}>
                                <Text style={{ color: '#fff', fontFamily: fonts.galano, fontSize: 24, textAlign: 'center' }}>User Profile</Text>
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
                                                    <CacheableImage style={styles.photos} source={{ uri: uploads + m.name }} />
                                                    <View style={{position: "absolute", left: 0, bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, alignItems:'center'}}>
                                                        <Text style={{color: '#ccc'}}><Text style={{color: '#fff', fontFamily: fonts.iconSolid}}>&#xf06e; </Text> {m.view_count}</Text>
                                                        <Text style={{color: colors.color1}}><Text style={{color: colors.color1, fontFamily: fonts.iconSolid}}>&#xf004; </Text> {m.likes_count}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                    {this.state.imgLimit != 9999 && <Text style={{ ...styles.cw, marginTop: 10, textAlign: "right", padding: 15, paddingVertical: 10 }} onPress={() => this.setState({ imgLimit: 9999 })}>View All</Text>}
                                </View> : <View></View>}

                                {user.acts.length > 0 ? <View>
                                    <Text style={{ ...styles.cw, marginTop: 30, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 }}>Activities</Text>
                                    <View style={{ flexDirection: 'column', marginTop: 10, paddingHorizontal: 15 }}>
                                        {user.acts.map((a, i) =>
                                            <View key={i}>
                                                <Text onPress={() => this.showActInfo(a._id)} style={{ color: colors.color6, fontFamily: fonts.galano }} key={i}>{i + 1}. {a.name}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View> : <View></View>}

                            </View>
                        </ScrollView>
                    )
                    : <View>
                        <Text>Loading user data</Text>
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
        width: width / 3, height: width / 3, borderWidth: 2, borderColor: colors.color2
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
        emp_id: state.user.userId
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        showActInfo: (id) => dispatch({ type: 'SHOW_ACT_INFO', id: id }),
        setPhotoId: (_id) => dispatch({ type: 'SHOW_PHOTO_ID', id: _id })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(UserProfile);