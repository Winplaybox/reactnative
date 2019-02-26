import React from 'react';
import { View, Text, Image, Platform } from 'react-native';

const settings = require('./avatars.json');

class Avatar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            loading: true
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    assetPath = (assetName) => {
        let path = Platform.OS == 'ios' ? assetName : `asset:/avatar/${assetName}.png`;
        //console.log(path);
        return path;
    }

    randomNum = (max) => {
        return Math.floor((Math.random() * max) + 1);
    }

    generateConfig = (gender) => {
        let eyes = this.randomNum(settings[gender][0].count);
        let head = this.randomNum(settings[gender][1].count);
        let mouth = this.randomNum(settings[gender][2].count);
        let clothes = this.randomNum(settings[gender][3].count);
        let face = this.randomNum(settings[gender][4].count);

        return `${eyes}:${head}:${mouth}:${clothes}:${face}`
    }

    buildAvatar = (config = '1', gender = 'male') => {
        config = config == null ? "1" : config;
        gender = gender == null ? "male" : gender;
        //console.log(config);
        //console.log(gender);

        config = config.length <= 1 ? this.generateConfig(gender) : config;

        let _config = config.split(':');
        let eyes = parseInt(_config[0]);
        let head = parseInt(_config[1]);
        let mouth = parseInt(_config[2]);
        let clothes = parseInt(_config[3]);
        let face = parseInt(_config[4]);

        eyes = Math.min(eyes, settings[gender][0].count);
        head = Math.min(head, settings[gender][1].count);
        mouth = Math.min(mouth, settings[gender][2].count);
        clothes = Math.min(clothes, settings[gender][3].count);
        face = Math.min(face, settings[gender][4].count);

        let view = <View style={{flex: 1, position: 'relative'}}>
            <Image style={styles.img} resizeMode="stretch" source={{ uri: this.assetPath(`${gender}_face_${face}`) }} />
            <Image style={styles.img} resizeMode="stretch" source={{ uri: this.assetPath(`${gender}_clothes_${clothes}`) }} />
            <Image style={styles.img} resizeMode="stretch" source={{ uri: this.assetPath(`${gender}_eye_${eyes}`) }} />
            <Image style={styles.img} resizeMode="stretch" source={{ uri: this.assetPath(`${gender}_head_${head}`) }} />
            <Image style={styles.img} resizeMode="stretch" source={{ uri: this.assetPath(`${gender}_mouth_${mouth}`) }} />
        </View>

        //console.log(view);

        return view;
    }

    render() {
        return (
            <View style={{ flex: 1, position: 'relative', backgroundColor: this.props.bg || 'transparent' }}>
                {this.buildAvatar(this.props.config, this.props.gender)}
            </View>
        );
    }
}

const styles = {
    img: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
    }
}

export default Avatar;