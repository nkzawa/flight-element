define(function(require) {
  'use strict';

  var element = require('lib/index');
  var registry = require('flight/lib/registry');

  function generateType() {
    return 'x-foo' + Math.floor(Math.random() * 1e10);
  }

  function findComponent(el) {
    var info = registry.findInstanceInfoByNode(el[0] || el);
    return info.length ? info[0].instance : null;
  }

  describeMixin('lib/index', function() {
    describe('registerElement', function() {
      it('should return component constructor', function() {
        var Component = element.registerElement(generateType(), {
          component: this.Component
        });
        expect(Component).to.be.a('function');
        expect(Component.attachTo).to.be.a('function');
      });

      it('should upgrade all elements', function() {
        var type = generateType();
        this.$node = $('<div/><div/>').attr('f-is', type).appendTo('body');

        element.registerElement(type, {
          component: this.Component
        });

        this.$node.toArray().forEach(function(el) {
          expect(findComponent(el)).to.be.a(this.Component);
        }, this);
      });

      it('should throw when name includes no dash', function() {
        expect(function() {
          element.registerElement('foo');
        }).to.throwException();
      });

      it('should throw when component property is missing', function() {
        expect(function() {
          element.registerElement(generateType(), {component: null});
        }).to.throwException();
      });

      it('should throw when name is duplicated', function() {
        var type = generateType();
        var self = this;

        function register() {
          element.registerElement(type, {component: self.Component});
        }

        register();
        expect(register).to.throwException();
      });
    });

    describe('upgradeElement', function() {
      it('should upgrade all elements', function() {
        var type = generateType()
        element.registerElement(type, {
          component: this.Component
        });

        this.$node = $('<div/><div/>').attr('f-is', type).appendTo('body');
        element.upgradeElement(document);

        this.$node.toArray().forEach(function(el) {
          expect(findComponent(el)).to.be.a(this.Component);
        }, this);
      });

      it('should upgrade all elements of a name', function() {
        var type = generateType()
        element.registerElement(type, {
          component: this.Component
        });

        var $type1 = $('<div/><div/>').attr('f-is', type);
        var $type2 = $('<div/><div/>').attr('f-is', generateType());
        this.$node = $type1.add($type2).appendTo('body');

        element.upgradeElement(document, type);

        $type1.toArray().forEach(function(el) {
          expect(findComponent(el)).to.be.a(this.Component);
        }, this);

        $type2.toArray().forEach(function(el) {
          expect(registry.findInstanceInfoByNode(el)).to.be.empty();
        }, this);
      });

      it('should append attributes', function() {
        var type = generateType()
        element.registerElement(type, {
          component: this.Component.mixin(function() {
            this.attributes({ foo: null, bar: null });
          })
        });

        this.$node = $('<div f-foo="hi" f-bar="42"/>').attr('f-is', type).appendTo('body');
        element.upgradeElement(document);
        expect(findComponent(this.$node).attr).to.eql({ foo: 'hi', bar: '42' });
      });

      it.only('should append attributes as boolean', function() {
        var type = generateType()
        element.registerElement(type, {
          component: this.Component.mixin(function() {
            this.attributes({ foo: false });
          })
        });

        this.$node = $('<div f-foo/>').attr('f-is', type).appendTo('body');
        element.upgradeElement(document);
        expect(findComponent(this.$node).attr).to.eql({ foo: true });
      });

      it('should upgrade only specified tags by extends option', function() {
        var type = generateType()
        element.registerElement(type, {
          component: this.Component,
          extends: 'span'
        });

        var $type1 = $('<div/>').attr('f-is', type);
        var $type2 = $('<span/>').attr('f-is', type);
        this.$node = $type1.add($type2).appendTo('body');

        element.upgradeElement(document);
        expect(findComponent($type1)).not.to.be.ok();
        expect(findComponent($type2)).to.be.ok();
      });
    });

    describe('prefix', function() {
      beforeEach(function() {
        this.originalPrefix = element.prefix;
      });

      afterEach(function() {
        element.prefix = this.originalPrefix;
      });

      it('should upgrade a custom element', function() {
        element.prefix = null;

        var type = generateType();
        this.$node = $('<div/>').attr('is', type).appendTo('body');

        element.registerElement(type, {
          component: this.Component
        });

        expect(findComponent(this.$node)).to.be.a(this.Component);
      });
    });

    describe('#renderContent', function() {
      it('should render html', function() {
        setupComponent();
        this.component.renderContent('<div class="foo"/>');
        expect(this.component.$node.find('.foo')).to.have.length(1);
      });

      it('should render element', function() {
        setupComponent();
        this.component.renderContent($('<div class="foo"/>')[0]);
        expect(this.component.$node.find('.foo')).to.have.length(1);
      });

      it('should render origin content instead of content element', function() {
        setupComponent('<div class="foo"/>');
        this.component.renderContent('<div f-is="content"/>');
        expect(this.component.$node.find('.foo')).to.have.length(1);
        expect(this.component.$node.find('[f-is=content]')).to.be.empty();
      });

      it('should render only selected content', function() {
        setupComponent('<div class="foo"/><div class="bar"/>');
        this.component.renderContent('<div f-is="content" f-select=".foo"/>');
        expect(this.component.$node.find('.foo')).to.have.length(1);
        expect(this.component.$node.find('.bar')).to.be.empty();
      });

      it('should re-render origin content', function() {
        setupComponent('<div class="foo"/>');
        this.component.renderContent('<div f-is="content"/>');
        this.component.renderContent('<div f-is="content"/>');
        expect(this.component.$node.find('.foo')).to.have.length(1);
      });

      it('should upgrade child component', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent();
        this.component.renderContent($('<div class="foo"/>').attr('f-is', type));
        var childComponent = findComponent(this.component.$node.find('.foo'));
        expect(childComponent).to.be.a(this.Component);
      });

      it('should upgrade child component derived from original content', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent($('<div class="foo"/>').attr('f-is', type));
        this.component.renderContent($('<div f-is="content"/>'));
        var childComponent = findComponent(this.component.$node.find('.foo'));
        expect(childComponent).to.be.a(this.Component);
      });

      it('should teardown old child component', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent();
        this.component.renderContent($('<div class="foo"/>').attr('f-is', type));
        var $foo = this.component.$node.find('.foo');
        this.component.renderContent($('<div/>'));
        expect(findComponent($foo)).not.to.be.ok();
      });

      it('should keep component derived from original content', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent($('<div class="foo"/>').attr('f-is', type));
        this.component.renderContent($('<div f-is="content"/>'));
        var childComponent1 = findComponent(this.component.$node.find('.foo'));
        this.component.renderContent($('<div f-is="content"/>'));
        var childComponent2 = findComponent(this.component.$node.find('.foo'));
        expect(childComponent1).to.be(childComponent2);
      });
    });

    describe('#upgradeElement', function() {
      it('should upgrade child component', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent($('<div class="foo"/>').attr('f-is', type));
        this.component.upgradeElement();
        var childComponent = findComponent(this.component.$node.find('.foo'));
        expect(childComponent).to.be.ok();
      });

      it('should upgrade only selected child component', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        this.Component = this.Component.mixin(function() {
          this.attributes({ foo: '.foo' });
        });

        setupComponent($('<div class="foo"/><div class="bar"/>').attr('f-is', type));
        this.component.upgradeElement('foo');
        var childComponent1 = findComponent(this.component.$node.find('.foo'));
        var childComponent2 = findComponent(this.component.$node.find('.bar'));
        expect(childComponent1).to.be.ok();
        expect(childComponent2).not.to.be.ok();
      });
    });

    describe('#teardown', function() {
      it('should teardown all child components', function() {
        var type = generateType();
        element.registerElement(type, {
          component: this.Component
        });

        setupComponent();
        this.component.renderContent($('<div class="foo"/><div class="bar"/>').attr('f-is', type));
        this.component.teardown();
        var childComponent1 = findComponent(this.component.$node.find('.foo'));
        var childComponent2 = findComponent(this.component.$node.find('.bar'));
        expect(childComponent1).not.to.be.ok();
        expect(childComponent2).not.to.be.ok();
      });
    });
  });
});
