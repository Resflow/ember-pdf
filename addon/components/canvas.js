import Ember from 'ember';
import Component from '../runtime/component';

var computed = Ember.computed;
var get = Ember.get;

var CanvasComponent = Component.extend({
  tagName: 'canvas',
  classNames: ['ember-pdf-canvas'],
  attributeBindings: ['width', 'height'],

  renderingContext2d: computed('element', function () {
    if (get(this, 'element')) {
      return get(this, 'element').getContext('2d');
    }
  })
});

export default CanvasComponent;