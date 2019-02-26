import React from 'react';
import { View, ScrollView, Dimensions, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { config } from '../../../config';

import { colors, fonts } from '../common/Styles';
import { gqlOptions, gqlURI } from '../../utils/Fetch';
import Avatar from '../user/Avatar';

const { width, height } = Dimensions.get('window');
const dimensions = Dimensions.get('window');
const uploads = config.ConfigSettings.uploadsFolder;

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            status: false,
            text: '',
            modalVisible: false,
            comments: null,
            comment: ''
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
                _id
                comments {
                    comment, _id, time, user_id
                    user {
                        firstName, lastName, avatar, gender
                    }
                }
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
                    this.setState({ comments: res.data.media[0] })
                    console.log("comments set");
                    console.log(this.state.comments);
                }
            })
            .catch((error) => {
                console.log(`error in: ` + query);
                console.log(error);
            });
    }

    postComment = () => {
        if (this.state.comment.length > 4) {

            let query = `mutation {
                addComment (user_id: "${this.props.activeAccount.emp_id}", post_id:"${this.props.photo_id}", post_type:"media", comment:"${this.state.comment}") {
                    comment
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
                        console.log("comment posted");
                        this.commentInput.value = "";

                        let _comments = this.state.comments;
                        _comments.comments.push({
                            time: new Date().getTime(),
                            comment: this.state.comment,
                            user: this.props.activeAccount,
                            user_id: this.props.activeAccount.emp_id
                        })

                        this.mounted && this.setState({
                            comment: '',
                            comments: _comments
                        })
                        Keyboard.dismiss();
                    }
                })
                .catch((error) => {
                    console.log(`error in: ` + query);
                    console.log(error);
                });
        } else {
            Alert.alert(
                'No comment entered',
                'Comment should be more than 5 characters',
                [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false }
            )
        }
    }

    navigateTo = (route) => {
        this.props.navTo(route);
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


    render() {
        formatDate = (date) => {
            let n = parseInt(date);
            let d = new Date(n);
            return d.toDateString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        }

        return (
            <View style={{ backgroundColor: colors.color5, flex: 1, paddingBottom: 70 }}>
                {this.state.comments != null ?
                    <ScrollView>
                        <Text style={{ color: colors.color6, fontFamily: fonts.galano, fontSize: 24, padding: 15, paddingBottom: 0 }}>Comments ({this.state.comments.comments.length})</Text>
                        {this.state.comments.comments.map((c, k) => <View key={k} style={styles.commentBox}>
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <View style={{ paddingRight: 10, paddingTop: 10 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 100, borderWidth: 2, borderColor: colors.color6, overflow: 'hidden' }}>
                                        <Avatar gender={c.user.gender || ''} config={c.user.avatar || ''} bg={colors.color6} />
                                    </View>
                                </View>

                                <View style={styles.comment}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 0, color: colors.color1 }}>
                                        {c.user_id == this.props.activeAccount.emp_id ? "You" : `${c.user.firstName} ${c.user.lastName}`}
                                    </Text>

                                    <Text style={{ color: '#fff', marginVertical: 5 }}>{c.comment}</Text>
                                    <Text style={{ color: colors.color6 }}>{timeDifference(c.time)}</Text>
                                </View>
                            </View>

                        </View>)}
                    </ScrollView>
                    : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#fff" />
                        {/* <Text style={{color: colors.color6}}>Please wait</Text> */}
                    </View>
                }
                <View style={{ flexDirection: 'row', position: "absolute", bottom: 0, width: '100%' }}>
                    <TextInput ref={(ref) => this.commentInput = ref}
                        style={styles.formInput}
                        onSubmitEditing={this.postComment}
                        onChangeText={(text) => this.setState({ comment: text })}
                        placeholder="Write a comment..." returnKeyType="go" />
                    <TouchableOpacity onPress={() => this.postComment()} style={{ color: '#fff', backgroundColor: colors.color1, alignItems: 'center', justifyContent: 'center', width: 80 }}>
                        <Text style={{ color: '#fff' }}>Post</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

//cf71f2
const styles = {
    commentBox: {
        marginTop: 10, padding: 10
    },
    comment: {
        borderRadius: 10, overflow: 'hidden', backgroundColor: colors.color2, padding: 10, flex: 1
    },
    screen: {
        backgroundColor: "#d4d4d4", flex: 1, position: 'relative'
    },
    formInput: {
        flex: 1, backgroundColor: '#fff'
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

export default connect(mapStateToProps, mapPropsToDispatch)(Comments);