import React from 'react';
import { View, ScrollView, Dimensions, Text, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { connect } from 'react-redux';
import ImageZoom from 'react-native-image-pan-zoom';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { gqlOptions, gqlURI } from '../../utils/Fetch';
import renderIf from './renderif'

const { width, height } = Dimensions.get('window');
const dimensions = Dimensions.get('window');
const imgsrc = 'https://zeal-app.s3.amazonaws.com/uploads/images/';

class PhotoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: []
        }
        this.mounted = true;
        this.graphql();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `
        { 
            users (id: ${this.props.user.emp_id}) {
                media {
                    name
                    post_type
                }
            }
        }`;
        let fetchOptions = gqlOptions(query);

        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.setState({ photos: res.data.users[0].media })
                    this.props.log(this.res.data)
                }
            })
            .catch((error) => {
                this.props.log(error);
            });
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    toggleSelectMode = () => {

    }

    deletePhotosAlert = () => {

    }

    deletePhotos = () => {

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
                                source={{ uri: imgsrc + photo.name }} />
                        </ImageZoom>

                        <View style={{ position: "absolute", width: width, bottom: 0, left: 0, padding: 15, backgroundColor: "rgba(0,0,20,0.2)" }}>
                            <Text style={{ color: "white" }}>{photo.author.firstName} {photo.author.lastName}</Text>
                            <Text style={{ color: "white" }}>{formatDate(photo.time)}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', borderBottomColor: "#fff", borderBottomWidth: 1, paddingBottom: 15, marginVertical: 15 }}>
                                <Text style={{ color: "#fff" }}>{photo.likes.length} like{photo.likes.length > 0 && "s"}</Text>
                                <Text style={{ color: "#fff" }}>{photo.comments.length} Comment{photo.comments.length > 0 && "s"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ fontFamily: fonts.iconLight, fontSize: 24, color: "#fff" }}>&#xf164;</Text>
                                    <Text style={{ color: "#fff", paddingLeft: 5 }}>Like</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ fontFamily: fonts.iconLight, fontSize: 24, color: "#fff" }}>&#xf27a;</Text>
                                    <Text style={{ color: "#fff", paddingLeft: 5 }}>Comment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>)
                    : <View style={{ padding: 15 }}>
                        <Text>Loading photo</Text>
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
        user: state.common.activeAccount
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(PhotoList);