/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

import io from 'socket.io-client';

import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n\n' +
    'Win+D or shake for dev menu bla bla, \n' +
    '+ smth else and added button',
});

export default class App extends Component<{}> {

  state = {
    videoURL: null,
    isFront: true
  };

  componentDidMount() {
      const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
      const pc = new RTCPeerConnection(configuration);
      const { isFront } = this.state;

      MediaStreamTrack.getSources(sourceInfos => {
          console.log('MediaStreamTrack.getSources', sourceInfos);
          let videoSourceId;
          for (let i = 0; i < sourceInfos.length; i++) {
              const sourceInfo = sourceInfos[i];
              if (sourceInfo.kind === 'video' && sourceInfo.facing == (isFront ? 'front' : 'back')) {
                  videoSourceId = sourceInfo.id;
                  console.log('videoSourceId = ', videoSourceId);
              }
          }
          getUserMedia({
              audio: true,
              video: {
                  mandatory: {
                      minWidth: 100, // Provide your own width, height and frame rate here
                      minHeight: 100,
                      minFrameRate: 30
                  },
                  facingMode: (isFront ? 'user' : 'environment'),
                  optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
              }

          }, (stream) => {
              console.log('Streaming is Ok', stream);
              this.setState({
                  videoURL: stream.toURL()
              });
              pc.addStream(stream);
          }, error => {
              console.log('Oops, smth went wrong...');
              throw error;
          });
      });

      pc.createOffer((desc) => {
          pc.setLocalDescription(desc, () => {
              // Send pc.localDescription to peer
              console.log('setLocalDescription', desc);
          }, (e) => { throw e; });
      }, (e) => { throw e; });

      pc.onicecandidate = (event) => {
          // send event.candidate to peer
          console.log('onicecandidate', event);
      };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
            Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
            {instructions}
        </Text>
        <RTCView streamURL={this.state.videoURL}
                 style={styles.videoContainer}/>
        <Button onPress={onView}
                color='#ddd'
                title='View'>
        </Button>
      </View>
    );
  }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    videoContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f99',
        borderWidth: 1,
        borderColor: '#000'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#5aa',
        marginBottom: 5,
    },
});

const onView = () => {
    alert("Button works");
};