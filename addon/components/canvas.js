import Ember from 'ember';
import Component from '../runtime/component';

const { get, set, on } = Ember;

/**
 * @module Ember.Component
 * @class CanvasComponent
 */
export default Component.extend({
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
