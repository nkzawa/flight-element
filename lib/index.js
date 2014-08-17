define(function(require) {
  'use strict';

  var flightRegistry = require('flight/lib/registry');
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
     * teardown all child components
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

    var Component = definition.component;
    if (!Component) {
      throw new Error('Options missing required component property');
    }

    // ensure to mixin flight-element
    var mixedIn = Component.prototype.mixedIn || [];
    if (mixedIn.indexOf(element) < 0) {
      definition.component = Component = Component.mixin(element);
    }

    registry[name] = definition;

    // upgrade all existing nodes
    element.upgradeElement(document, name);

    return Component;
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

        attrs[key] = attr.value === '' ? true : attr.value;
      });

      definition.component.attachTo(e, attrs);
    });
  };

  return element;
});
