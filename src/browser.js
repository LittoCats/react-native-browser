'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  Navigator
} from 'react-native';

import Module, {PropTypes} from './module'
import Frame from './frame'

class Browser extends Component {
  static propTypes = {
    ... View.PropTypes,
    source: PropTypes.source,
    resolveSource: React.PropTypes.func,
    onRequireClose: React.PropTypes.func.isRequired
  };

  static Module = Module;

  constructor(props) {
    super(props);
  
    var viewProps = {
      ... this.props
    };
    delete viewProps.source;

    this.state = {
      viewProps,
      source: this.props.source
    };
  }

  render() {
    return (
      <Navigator
        {... this.state.viewProps}
        ref='navigator'
        initialRoute={{... this.state.source}}
        renderScene={(route, navigator)=>(<Frame source={{... route}} browser={this}/>)}
      />
    );
  }

  open(source) {open.call(this, source);}

  load(source) {load.call(this, source);}

  reload() {reload.call(this);}

  goback() {goback.call(this);}

  close() {close.call(this);}
}

const styles = StyleSheet.create({

});

function open(source) {
  source = (this.props.resolveSource || resolveSource)(source);
  this.setState({
    ... this.state,
    source
  });
}

function load(source) {
  source = (this.props.resolveSource || resolveSource)(source, this.state.source)
  this.refs.navigator.push(source);
}

function reload() {
  var routes = this.refs.navigator.getCurrentRoutes();
  this.refs.navigator.replace({... routes[routes.length - 1]})
}

function goback() {
  
  if (this.refs.navigator.getCurrentRoutes().length > 1) {
    this.refs.navigator.pop();
  }else{
    this.close();
  }
}

function close() {
  this.props.onRequireClose();
}

function resolveSource(source, parent) {
  var regex = /^[a-z]+:\/\/[\S]+/;
  if (!parent || regex.test(source.uri)) return source;
  return {
    ... source,
    uri: parent.uri.match(/^[a-z]+:\/\/[^\s\/?#]+/)[0]+'/'+source.uri
  }
}

export default Browser;
export {Module}