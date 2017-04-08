'use strict';

import React, { Component } from 'react';

import {
  PixelRatio,
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  ReactElement,
  TouchableWithoutFeedback
} from 'react-native';

import Browser from './browser'
import Module, {
  PropTypes
} from './module'

class Frame extends Component {
  static propTypes = {
    source: PropTypes.source,
    browser: PropTypes.browser
  }

  constructor(props) {
    super(props);
  
    this.state = {
      scene: ActivityIndicator
    };
  }

  async componentDidMount() {
    var scene, script, module;
    try {
      script = await loadSource(this.props.source);
      module = await new Module(script).compile();
      scene = module.exports.__esModule ? module.exports.default : module.exports;
    }catch (error){
      if (__DEV__) console.warn(error);
      script = script || error.message;
      try {scene = this.props.browser.renderError(error);} catch(e) {}
    }
    if (!isValidComponent(scene)) scene = createErrorScene(script);
    this.setState({
      ... this.state,
      scene
    });
  }

  render() {
    return (
      <this.state.scene 
        style={styles.frame} 
        browser={this.props.browser}
        location={this.props.source.uri}
      />
    );
  }
}

async function loadSource(source) {
  var response = await fetch(source.uri);
  if (/^text/.test(response.headers.get('content-type'))) {
    return await response.text();  
  }else{
    throw new Error('Invalid content.');
  }
}

const styles = StyleSheet.create({
  frame: {
    ... StyleSheet.absoluteFillObject,
    backgroundColor:'#F5FCFF'
  }
});

function isValidComponent(type) {
  return typeof type === 'function' && type.prototype instanceof Component;
}

function createErrorScene(message){
  return class extends Component {
    render() {
      return (
        <View style={[this.props.style, {padding: 22}]}>
          <Text style={{color: 'red', fontSize: 17}} allowFontScale={false}>Load Error</Text>
          <Text style={{color: '#00D6FD', fontSize: 15, marginVertical: 7}} allowFontScale={false}>{this.props.location}</Text>
          <ScrollView
            style={{borderWidth: 1/PixelRatio.get(), borderColor: 'gray', padding: 3}}
          ><Text style={{flex: 1, fontSize: 13, color: 'gray'}}>{message}</Text></ScrollView>
          <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems: 'center', height: 44}}>
            <Text style={{color: '#2087FB'}} allowFontScale={false} onPress={e=> this.props.browser.goback()}>Goback</Text>
            <Text style={{color: '#2087FB'}} allowFontScale={false} onPress={e=> this.props.browser.reload()}>Refresh</Text>
          </View>
        </View>
      );
    }
  };
}

export default Frame;