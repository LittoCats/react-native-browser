import Browser from './browser'

function SourceValidation(props, propName, componentName) {
  var prop = props[propName];

  if (!/^[a-z]+:\/\/[\S]+/.test(prop.uri)) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.\n' + prop.uri
      );  
  }
}

function BrowserValidation(props, propName, componentName) {
  if (props[propName] instanceof Browser) {}
  else{
    throw new Error(
      'Invalid prop `' + propName + '` supplied to' +
      ' `' + componentName + '`. Validation failed.'
    );
  }
}

const PropTypes = {
  source: SourceValidation,
  browser: BrowserValidation
}

// Module Management
var __PreLoadedModules = {
  'react': require('react'),
  'react-native': require('react-native'),
  'react-native-browser': Browser
}

var PreLoadedModules = {};

var CachedModules = {};

function RequireFn(moduleName) {
  var module = CachedModules[moduleName] || PreLoadedModules[moduleName] || __PreLoadedModules[moduleName];
  if (module instanceof Module) module = module.exports;
  return module;
}

class Module {
  constructor(script) {
    this.script = script;
    this.exports = {};
  }

  async compile() {
    new Function('require', 'exports', 'module', this.script).call({}, RequireFn, this.exports, this);
    this.compile = ()=>undefined
    return this;
  }

  registerAs(name) {
    CachedModules[name] = this;
  }

  unregister() {
    for (var name in Object.keys(CachedModules)) {
      if (CachedModules[name] === this) {
        delete CachedModules[name];
      }
    }
  }

  static register(name, module) {
    if (module instanceof Module) {
      throw new Error('Forbid to register an dymic module as preload-module.');
    }
    PreLoadedModules[name] = module;
  }

  static unregister(name) {
    if (typeof name === 'string') {
      delete PreLoadedModules[name];
    }else{
      for (var key in Object.keys(PreLoadedModules)) {
        if (PreLoadedModules[key] === name) {
          delete PreLoadedModules[key];
        }
      }
    }
  }
}

export default Module

export {
  PropTypes
}