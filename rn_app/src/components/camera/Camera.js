import React from 'react';
import {
    StyleSheet,
    View, Picker,
    Dimensions,
    Text, Image, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import { colors, fonts } from '../common/Styles';
import { connect } from 'react-redux';
import { config } from './../../../config';

import { processResponse, gqlOptions, gqlFetch, gqlURI } from '../../utils/Fetch';
const imPickerOptions = {
    title: 'Select Image',
    //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const { width, height } = Dimensions.get('window');
class Camera extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: '',
            exif: {},
            showCapturedImage: 'false',
            processing: false,
            orientation: 1,
            actId: ''
        }
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    navigateTo = (route) => {
        this.props.navTo(route);
    }

    choosePicture = () => {
        ImagePicker.launchImageLibrary(imPickerOptions, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let source = { uri: response.uri };
                // You can also display the image using data:
                //const source = { uri: 'data:image/jpeg;base64,' + response.data };

                // this.setState({
                //     avatarSource: source,
                // });
                this.setState({
                    image: response.data,
                    uri: response.uri,
                    exif: {},
                    processing: false,
                    orientation: {}
                })
            }
        });
    }

    takePicture = async function () {
        this.props.log('click pic')
        if (this.mounted) {
            this.setState({
                processing: true
            })
        }

        if (this.camera) {
            this.props.log('clicked pic')
            const options = { quality: 0.5, base64: true, fixOrientation: true, exif: true };
            const data = await this.camera.takePictureAsync(options);
            this.props.log('pic processed')
            if (this.mounted) {
                this.setState({
                    image: data.base64,
                    uri: data.uri,
                    exif: data.exif,
                    processing: false,
                    orientation: data.pictureOrientation
                })
            }
            this.props.log(data.exif)
            this.props.log(data.pictureOrientation)
            this.props.log(data.uri);
            this.props.log(data.base64);
        }
    };

    uploadPicture = () => {
        this.props.log('start upload');
        if (this.mounted) {
            this.setState({
                processing: true
            })
        }
        var data = new FormData();
        data.append('file', {
            uri: this.state.uri, // your file path string
            name: 'my_photo.jpg',
            type: 'image/jpg'
        });
        data.append('user_id', this.props.user.emp_id);
        data.append('post_id', this.state.actId);

        this.props.log(data);

        let fetchOptions = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            method: 'POST',
            body: data
        }

        fetch(config.ConfigSettings.serverURI + "media", fetchOptions)
            .then(response => {
                if (this.mounted) {
                    this.setState({ image: '', uri: '', processing: false })
                }
                this.props.log('uploaded')
                return response;
            })
            .catch(err => {
                this.props.log(err);
            })
    }

    closePreview = () => {
        if (this.mounted) {
            this.setState({
                image: '', processing: false
            })
        }
    }

    render() {
        return (
            <View style={styles.screen}>
                <View style={styles.container}>
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={styles.preview}
                        type={RNCamera.Constants.Type.back}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        permissionDialogTitle={'Permission to use camera'}
                        permissionDialogMessage={'We need your permission to use your camera phone'}
                        onGoogleVisionBarcodesDetected={({ barcodes }) => {
                            console.log(barcodes);
                        }}
                    />
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                            <Text style={{ fontSize: 30, color: '#fff', fontFamily: fonts.icon }}>&#xf030;</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.choosePicture()} style={styles.capture}>
                            <Text style={{ fontSize: 30, color: '#fff', fontFamily: fonts.icon }}>&#xf65e;</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {(this.state.processing || this.state.image != "") && <View style={{ backgroundColor: "rgba(0,0,0,0.9)", position: "absolute", width: "100%", height: "100%" }}>
                    <Image style={{ height: height, width: width }} resizeMode="contain" source={{ uri: 'data:image/jpeg;base64,' + this.state.image, }} />

                    {!this.state.processing && <TouchableOpacity onPress={this.closePreview} style={{ position: "absolute", left: 30, top: 15 }}>
                        <Text style={{ color: "#fff", fontFamily: fonts.iconLight, fontSize: 40 }}>&#xf00d;</Text>
                    </TouchableOpacity>}

                    {!this.state.processing && <TouchableOpacity onPress={this.uploadPicture} style={{ position: "absolute", right: 15, top: 15, backgroundColor: colors.color2, padding: 10, paddingHorizontal: 20, borderRadius: 5 }}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>UPLOAD</Text>
                    </TouchableOpacity>}

                    {!this.state.processing && <View style={{ position: "absolute", bottom: 20, flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                        <Text style={{ color: colors.color6 }}>Tag Event:</Text>
                        <Picker
                            selectedValue={this.state.actId}
                            style={{ height: 50, width: 300, color: '#fff' }}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ actId: itemValue })
                            }>
                            {this.props.actsList.map((a, k) => <Picker.Item style={{ color: '#fff' }} key={k} label={a.name} value={a._id} />)}
                        </Picker>
                    </View>}

                    {this.state.processing && <View style={{ position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>}
                </View>}
            </View>
        );
    }
}


const styles = {
    screen: {
        backgroundColor: 'red',
        width: width,
        flex: 1
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0, borderRadius: 100, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', margin: 20, width: 60, height: 60
    }
}


function mapStateToProps(state) {
    return {
        brands: state.home.brands,
        user: state.common.activeAccount,
        actsList: state.acts.actsList
    }
}

function mapPropsToDispatch(dispatch) {
    return {
        navTo: (route) => dispatch({ type: 'NAVIGATE_TO', route: route }),
        log: (msg) => dispatch({ type: 'RECORD', log: msg })
    }
}

export default connect(mapStateToProps, mapPropsToDispatch)(Camera);