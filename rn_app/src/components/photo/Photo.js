import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { connect } from 'react-redux';
import ImageZoom from 'react-native-image-pan-zoom';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { gqlOptions, gqlURI } from '../../utils/Fetch';
import renderIf from './renderif'

const { width, height } = Dimensions.get('window');
const dimensions = Dimensions.get('window');
const uploads = config.ConfigSettings.uploadsFolder;

class PhotoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            status: false,
            text: '',
            like: false,
            modalVisible: false
        }
        this.mounted = true;
        this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{ 
            media(id: "${this.props.photo_id}") {
                _id, name, time, post_type, likes_count, likes { user_id }
                comments {
                    comment, _id
                    user {
                        firstName, lastName
                    }
                }
                author{firstName,lastName}
            } 
        }`;
        let fetchOptions = gqlOptions(query);
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => {
                return res.json()
            })
            .then(res => {
                console.log(res);
                if (this.mounted) {
                    let liked = res.data.media[0].likes.filter(l => l.user_id == this.props.activeAccount.emp_id) > 0;
                    this.setState({ photos: res.data.media, like: liked })
                    console.log("media set");
                    console.log(this.state.photos);
                }
            })
            .catch((error) => {
                console.log(`error in: ` + query);
                console.log(error);
            });
    }

    like = (post_id) => {
        let query = `
        mutation { 
            addLike (user_id: "${this.props.activeAccount.emp_id}", post_id: "${post_id}", post_type: "media", value: 1) {
                _id
            } 
        }`;
        let fetchOptions = gqlOptions(query);
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('liked ' + this.props.activeAccount.emp_id);
                    this.setState({ like: true })
                    this.props.log(res)
                }
            })
            .catch((error) => {
                this.props.log(`error in: ${query}`);
                this.props.log(error);
            });
    }

    unlike = (post_id) => {
        let query = `mutation { removeLike (user_id: "${this.props.activeAccount.emp_id}", post_id: "${post_id}") { _id } }`;
        let fetchOptions = gqlOptions(query);
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('unliked ' + this.props.activeAccount.emp_id);
                    this.setState({ like: false })
                    this.props.log(res)
                }
            })
            .catch((error) => {
                this.props.log(error);
                if (this.mounted) this.setState({ refreshing: false });
            });
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            return d.toDateString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        }
        formatDate1 = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        }

        return (
            <View style={{ backgroundColor: colors.color5, flex: 1 }}>
                {this.state.photos.length > 0 ?
                    this.state.photos.map((photo, k) => <View key={k} style={{ flex: 1 }}>
                        <ImageZoom cropWidth={Dimensions.get('window').width}
                            cropHeight={Dimensions.get('window').height}
                            imageWidth={width}
                            imageHeight={height}>
                            <Image
                                enableHorizontalBounce={true}
                                style={{
                                    width: width,
                                    height: height
                                }}
                                resizeMode="contain"
                                source={{ uri: uploads + photo.name }} />
                        </ImageZoom>

                        <View style={{ position: "absolute", width: width, bottom: 0, left: 0, padding: 15, backgroundColor: "rgba(0,0,20,0.2)" }}>
                            <Text style={{ color: "white" }}>{photo.author.firstName} {photo.author.lastName}</Text>
                            <Text style={{ color: "white" }}>{formatDate(photo.time)}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', borderBottomColor: "#fff", borderBottomWidth: 1, paddingBottom: 15, marginVertical: 15 }}>
                                <Text style={{ color: "#fff" }}>{photo.likes_count} Like{photo.likes_count != 1 && "s"}</Text>
                                <Text style={{ color: "#fff" }} onPress={() => this.props.navTo("comments")}>{photo.comments.length} Comment{photo.comments.length != 1 && "s"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                                {this.state.like
                                    ? <TouchableOpacity onPress={() => this.unlike(photo._id)} style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={{ fontFamily: fonts.iconSolid, fontSize: 26, color: "#fff" }}>&#xf004;</Text>
                                        <Text style={{ color: "#fff", paddingLeft: 5 }}>Remove Like</Text>
                                    </TouchableOpacity>
                                    : <TouchableOpacity onPress={() => this.like(photo._id)} style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={{ fontFamily: fonts.iconLight, fontSize: 26, color: "#fff" }}>&#xf004;</Text>
                                        <Text style={{ color: "#fff", paddingLeft: 5 }}>Like</Text>
                                    </TouchableOpacity>
                                }

                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => this.props.navTo("comments")}>
                                    <Text style={{ fontFamily: fonts.iconLight, fontSize: 24, color: "#fff" }}>&#xf27a;</Text>
                                    <Text style={{ color: "#fff", paddingLeft: 5 }}>Comment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>)
                    : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                }
            </View>
        );
    }
}

//cf71f2
const styles = {
    screen: {
        backgroundColor: "#d4d4d4", flex: 1, position: 'relative'
    },
    title: {
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, backgroundColor: "#f6f7f9", width: dimensions.width
    },
    image: {
        flex: 1,
        alignItems: 'center',
        width: width,
        height: height,
        backgroundColor: "#000"
    },
    col6: {
        width: "50%"
    },
    comment: {
        backgroundColor: "#f2f2f2", padding: 10, color: "#000", borderBottomWidth: 1, borderColor: '#d4d4d4'
    }
}


function mapStateToProps(state) {
    return {
        photo_id: state.photos.photo_id,
        activeAccount: state.common.activeAccount
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(PhotoList);