(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("flight")["registry"]);
	else if(typeof define === 'function' && define.amd)
		define(["flight/lib/registry"], factory);
	else if(typeof exports === 'object')
		exports["flight-element"] = factory(require("flight")["registry"]);
	else
		root["flight-element"] = factory(root["flight"]["registry"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(require) {
  'use strict';

  var flightRegistry = __webpack_require__(1);
  var registry = {};

  function element() {
    this.renderContent = function(content) {
      if (!this.$contents) {
        this.$contents = this.$node.contents();
      }
      // keep original elements
      this.$contents.detach();

      // cleanup and remove all other descendant elements
      teardownDescendants(this.$node);
      this.$node.empty();

      var $contentWrapper = $('<div/>').append(content);

      // insert original contents to <xxx f-is="content" f-select=".target"/>
      $contentWrapper.find('[' + createAttr('is') + '=content]').each(function(i, e) {
        var $e = $(e);
        var select = $e.attr(createAttr('select'));

        // Note: select can only select elements which are immediate children of the host node.
        var $c = select ? this.$contents.filter(select) : this.$contents;
        if ($c.length) {
          $e.replaceWith($c);
        } else {
          $e.remove();
        }
      }.bind(this));

      var $content = $contentWrapper.contents();
      this.$node.append($content);
      element.upgradeElement($content);
    };

    this.upgradeElement = function(name) {
      element.upgradeElement(this.attr[name] || this.$node);
    }

    /**
     * teardown all children components
     */
    this.before('teardown', function() {
      var instanceInfo = flightRegistry.findInstanceInfo(this);
      if (!instanceInfo) return;

      teardownDescendants(this.$node);
    });
  }

  function teardownDescendants(node) {
    var selector = '[' + createAttr('is') + ']';
    $(node).find(selector).each(function(i, e) {
      flightRegistry.findInstanceInfoByNode(e).forEach(function(instanceInfo) {
        instanceInfo.instance.teardown();
      });
    });
  }

  function createAttr(name) {
    return (element.prefix ? element.prefix + '-' : '') +  name;
  }

  element.prefix = 'f';

  element.registerElement = function(name, options) {
    var definition = options || {};

    if (name.indexOf('-') < 0) {
      throw new Error('registerElement: first argument (\'name\') must contain a dash (\'-\'). Argument provided was \'' + String(name) + '\'.');
    }
    if (registry[name]) {
      throw new Error('DuplicateDefinitionError: a type with name \'' + String(name) + '\' is already registered');
    }
    if (!definition.component) {
      throw new Error('Options missing required component property');
    }

    // ensure to mixin flight-element
    definition.component = definition.component.mixin(element);

    registry[name] = definition;

    // upgrade all existing nodes
    element.upgradeElement(document, name);

    return definition.component;
  };

  element.upgradeElement = function(el, name) {
    var isAttr = createAttr('is');
    var attrPrefix = element.prefix ? element.prefix + '-' : '';

    var v = [isAttr];
    if (name) v.push(name);
    var selector = '[' + v.join('=') + ']';

    $(el).find(selector).addBack(selector).each(function(i, e) {
      var _name = name || $(e).attr(isAttr);
      var definition = registry[_name];
      if (!definition) return;

      var nodeName = definition.extends;
      if (nodeName && nodeName.toLowerCase() !== e.nodeName.toLowerCase()) {
        // doesn't match with the specified tag
        return;
      }

      var attrs = {};
      $.each(e.attributes, function(j, attr) {
        if (!attr.specified) return;
        if (attr.name.indexOf(attrPrefix) !== 0) return;
        if (attr.name === isAttr) return;

        var key = attr.name.substr(attrPrefix.length);
        if (!key) return;

        attrs[key] = attr.value;
      });

      definition.component.attachTo(e, attrs);
    });
  };

  return element;
}.call(exports, __webpack_require__, exports, module)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
