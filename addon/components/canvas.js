import Ember from 'ember';
import Component from '../runtime/component';

var computed = Ember.computed;
var get = Ember.get;
var set = Ember.set
var on = Ember.on;

var CanvasComponent = Component.extend({
  tagName: 'canvas',
  classNames: ['ember-pdf-canvas'],
  attributeBindings: ['width', 'height'],
  renderingContext2d: null,

  setupRenderingContext2d: on('willInsertElement', function () {
    set(this, 'renderingContext2d', get(this, 'element').getContext('2d'));
  }),

  teardownRenderingContext2d: on('willDestroyElement', function () {
    set(this, 'renderingContext2d', null);
  })
});

export default CanvasComponent;