import Ember from 'ember';
import Component from '../runtime/component';
import template from '../templates/components/pdf-loading';

var computed = Ember.computed;
var get = Ember.get;
var set = Ember.set;


var PDFLoadingComponent = Component.extend({
  classNames: ['ember-pdf-loading'],
  attributeBindings: ['style'],
  template: template, 
  defaultMessage: 'Loading...',

  didInsertElement: function () {
    var parentView = get(this, 'parentView');
    set(this, 'parentHeight', parentView.element.clientHeight);
    set(this, 'parentWidth', parentView.element.clientWidth);
  },

  width: computed('parentWidth', function () {
    var width = get(this, 'parentWidth');
    if (width > 0) {
      return width / 4;
    } 
    return 0;
  }),

  height: computed('parentHeight', function () {
    var height = get(this, 'parentHeight');
    if (height > 0) {
      return height / 2;
    }
    return 0;
  }),

  marginLeft: computed('width', function () {
    var width = get(this, 'width');
    if (width > 0) {
      return width / 2;
    }
    return 0;
  }),

  marginTop: computed('height', function () {
    var height = get(this, 'height');
    if (height > 0) {
      return height / 2;
    }
    return 0;
  }),

  style: computed('width', 'height', function () {
    var styles = [
      'width: ' + get(this, 'width') + 'px',
      'height: ' + get(this, 'height') + 'px',
      'top: ' + '50%',
      'left: ' + '50%',
      'margin-left: ' + '-' + get(this, 'marginLeft') + 'px',
      'margin-top: ' + '-' + get(this, 'marginTop') + 'px',
      'position: ' + 'absolute',
      'z-index: ' + '999',
      'background-color: ' + 'rgb(255,0,255)',
      'opacity: ' + '0.5'
    ];

    return styles.join('; ');
  }),

});

export default PDFLoadingComponent;
