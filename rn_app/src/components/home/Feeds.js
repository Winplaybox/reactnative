import React from 'react';
import { View, ScrollView, FlatList, RefreshControl, Dimensions, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import imageCacheHoc from 'react-native-image-cache-hoc';
import { config } from './../../../config';

import { colors, fonts } from '../common/Styles';
import { gqlOptions } from '../../utils/Fetch';

import Avatar from './../user/Avatar';

const width = Dimensions.get('window').width;
const dimensions = Dimensions.get('window');
const CacheableImage = imageCacheHoc(Image, { });
class Feed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            medias: []
        }
        this.mounted = true;
    }

    componentDidMount() {
        this.props.log(`feeds: ${this.props.feed.length}`)
        console.log(this.props.myUserData);
        if (this.props.feed.length == 0) {
            this.graphql();
        }


        if (this.mounted) {
            let offY = this.props.offY;
            if (this.scrollView != null) this.scrollView.scrollTo({ x: 0, y: offY, animated: false });
            setTimeout(() => {
                if (this.scrollView != null) this.scrollView.scrollTo({ x: 0, y: offY, animated: false })
            }, 10);
        }
    }

    _onLayout = () => {
        if (this.mounted) {
            let offY = this.props.offY;
            if (this.scrollView != null) this.scrollView.scrollTo({ x: 0, y: offY, animated: false })
        }
    }
    onMomentumScrollEnd = (e) => {
        if (this.mounted) {
            let { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            let pos = layoutMeasurement.height + contentOffset.y;
            let size = contentSize.height;
            if (size - pos < 200) {
                let _feedsCount = this.props.feedsCount;
                _feedsCount += 5;
                this.props.setFeedsCount(_feedsCount)
            }
            let scrollY = e.nativeEvent.contentOffset.y;
            this.props.setOffsetY(scrollY);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    graphql = () => {
        let query = `{ 
            media {
                _id, name, post_type, time, post_id, post_type, view_count, user_id
                author { firstName, lastName, avatar, gender },
                likes { _id, user_id },
                comments {
                    user_id
                }
            }
        }`;

        let fetchOptions = gqlOptions(query);
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    this.props.log(res);
                    this.props.updateFeed(res.data.media);
                    this.setState({ medias: res.data.media, refreshing: false })
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

    setPhotoId = (id) => {
        this.props.setPhotoId(id)
        this.props.navTo("photo");
    }

    openComments = (id) => {
        this.props.setPhotoId(id)
        this.props.navTo("comments");
    }

    _onRefresh = () => {
        if (this.mounted) this.setState({ refreshing: true });
        this.props.setFeedsCount(10)
        this.graphql();
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
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('delete ' + i);
                    console.log(res)
                    this.props.deletePhoto(i);
                }
            })
            .catch((error) => {
                this.props.log(error);
                if (this.mounted) this.setState({ refreshing: false });
            });
    }

    like = (user_id, post_id, i) => {
        let query = `
        mutation { 
            addLike (user_id: "${user_id}", post_id: "${post_id}", post_type: "media", value: 1) {
                _id
            } 
        }`;
        let fetchOptions = gqlOptions(query);
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('liked ' + user_id);
                    let feeds = [...this.props.feed];
                    let index = this.props.feed.length - i - 1;
                    feeds[index].likes.push({
                        user_id: user_id
                    })
                    this.props.updateFeed(feeds);
                }
            })
            .catch((error) => {
                this.props.log(`error in: ${query}`);
                this.props.log(error);
            });
    }

    unlike = (user_id, post_id, i) => {
        let query = `mutation { removeLike (user_id: "${user_id}", post_id: "${post_id}") { _id } }`;
        let fetchOptions = gqlOptions(query);
        this.props.log(fetchOptions)
        fetch(config.ConfigSettings.gqlURI, fetchOptions)
            .then(res => res.json())
            .then(res => {
                if (this.mounted) {
                    console.log('unliked ' + user_id);
                    let feeds = [...this.props.feed];
                    let feedIndex = this.props.feed.length - i - 1;
                    let likeArr = [...feeds[feedIndex].likes];
                    let _likeArr = likeArr.filter(l => l.user_id != user_id)
                    feeds[feedIndex].likes = _likeArr
                    this.props.updateFeed(feeds);
                }
            })
            .catch((error) => {
                this.props.log(error);
                if (this.mounted) this.setState({ refreshing: false });
            });
    }

    openProfile = (id) => {
        this.props.setUserProfile(id);
        this.props.navTo("userprofile");
    }

    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            // console.log(d)
            return <Text style={{ fontWeight: '200', fontSize: 12 }}>{d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
        }

        timeDifference = (date) => {
            var previous = new Date(parseInt(date))
            var current = new Date();
            var msPerMinute = 60 * 1000;
            var msPerHour = msPerMinute * 60;
            var msPerDay = msPerHour * 24;
            var msPerMonth = msPerDay * 30;
            var msPerYear = msPerDay * 365;

            var elapsed = current - previous;

            if (elapsed < msPerMinute) {
                return Math.round(elapsed / 1000) + ' seconds ago';
            }

            else if (elapsed < msPerHour) {
                return Math.round(elapsed / msPerMinute) + ' minutes ago';
            }

            else if (elapsed < msPerDay) {
                return Math.round(elapsed / msPerHour) + ' hours ago';
            }

            else if (elapsed < msPerMonth) {
                return Math.round(elapsed / msPerDay) + ' days ago';
            }

            else if (elapsed < msPerYear) {
                return Math.round(elapsed / msPerMonth) + ' months ago';
            }

            else {
                return Math.round(elapsed / msPerYear) + ' years ago';
            }
        }

        return (
            <View style={{ backgroundColor: colors.color5, flex: 1, borderRadius: 10 }} onLayout={() => this._onLayout()}>

                <ScrollView stlye={{ display: 'none' }} horizontal={false} ref={(ref) => this.scrollView = ref} onMomentumScrollEnd={event => this.onMomentumScrollEnd(event)} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    {this.props.feed.length > 0 ?
                        Array.from(this.props.feed).reverse().map((media, k) =>
                            k < this.props.feedsCount && <View style={styles.feeds} key={k}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10, alignItems: 'center', flex: 1 }}>
                                    <TouchableOpacity onPress={() => this.openProfile(media.user_id)} style={{ width: 40, height: 40, borderRadius: 100, borderWidth: 2, borderColor: colors.color6, overflow: 'hidden' }}>
                                        <Avatar gender={media.author.gender || ''} config={media.author.avatar || ''} bg={colors.color6} />
                                    </TouchableOpacity>
                                    <View style={{ paddingLeft: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontWeight: 'bold', marginBottom: 0, color: colors.color1 }}>
                                                {media.user_id == this.props.activeAccount.emp_id ? "You" : `${media.author.firstName} ${media.author.lastName}`}
                                            </Text>
                                            <Text style={{ color: colors.color6 }}>  uploaded this photo</Text>
                                        </View>
                                        <Text style={{ fontWeight: "bold", color: "#fff" }}>{timeDifference(media.time)}</Text>
                                    </View>

                                    {/* {this.props.activeAccount.emp_id == media.user_id && 0 == 1 &&
                                        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => this.deleteConfirmation(media._id, k)}>
                                            <Text style={{ fontFamily: fonts.iconLight, color: colors.color7, fontSize: 36 }}>&#xf00d;</Text>
                                        </TouchableOpacity>
                                    } */}

                                    <View style={{ marginLeft: 'auto' }}>
                                        {media.likes.filter(l => l.user_id == this.props.activeAccount.emp_id).length > 0
                                            ? <TouchableOpacity onPress={() => this.unlike(this.props.activeAccount.emp_id, media._id, k)}>
                                                <Text style={{ fontFamily: fonts.iconSolid, color: colors.color7, fontSize: 30 }}>&#xf004;</Text>
                                            </TouchableOpacity>
                                            : <TouchableOpacity onPress={() => this.like(this.props.activeAccount.emp_id, media._id, k)}>
                                                <Text style={{ fontFamily: fonts.iconLight, color: colors.color6, fontSize: 30 }}>&#xf004;</Text>
                                            </TouchableOpacity>}
                                    </View>
                                </View>

                                <TouchableOpacity onPress={() => this.setPhotoId(media._id)}>
                                    <CacheableImage
                                        style={styles.image} permanent={true}
                                        source={{ uri: config.ConfigSettings.uploadsFolder + media.name }}
                                        alt={media.name}
                                    />
                                </TouchableOpacity>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 5, alignItems: 'center' }}>
                                    <Text style={{ color: colors.color1, fontWeight: "bold" }}>{media.likes.length} Like{media.likes.length != 1}</Text>
                                    <Text style={{ color: colors.color6, fontWeight: "bold", marginRight: 'auto', paddingLeft: 20 }}>{media.view_count} View{media.view_count != 1 ? "s" : ""}</Text>
                                    <Text onPress={() => this.openComments(media._id)} style={{ color: colors.color6, paddingVertical: 5 }}>{media.comments.length} Comment{media.comments.length != 1 && "s"}</Text>
                                </View>
                            </View>)
                        : <View>
                            <Text>Loading Feed</Text>
                        </View>
                    }
                    <Text style={{ paddingBottom: 20 }}> </Text>
                </ScrollView>
            </View>
        );
    }
}

//cf71f2
const styles = {
    feeds: {
        /*backgroundColor: colors.color4,*/ marginBottom: 0, padding: 15, paddingBottom: 0, borderRadius: 10
    },
    image: {
        flex: 1,
        alignSelf: 'stretch',
        width: '100%',
        height: 150,
        borderRadius: 5
    },
    likeComment: {
        color: colors.color1
    }
}


function mapStateToProps(state) {
    return {
        feed: state.home.feed,
        myUserData: state.common.myUserData,
        activeAccount: state.common.activeAccount,
        offY: state.home.feedsOffsetY,
        feedsCount: state.home.feedsCount
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        setPhotoId: (_id) => dispatch({ type: 'SHOW_PHOTO_ID', id: _id }),
        deletePhoto: (i) => dispatch({ type: 'DELETE_PHOTO', index: i }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg }),
        updateFeed: (data) => dispatch({ type: 'UPDATE_FEED_DATA', data: data }),
        setOffsetY: (y) => dispatch({ type: 'SET_FEEDS_OFFSET_Y', y: y }),
        setFeedsCount: (count) => dispatch({ type: 'SET_FEEDS_COUNT', count: count }),
        setUserProfile: (id) => dispatch({ type: 'SET_USER_ID', id: id })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Feed);