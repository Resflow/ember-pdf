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
    var documentContainerView = get(this, 'documentContainerView');
    set(this, 'documentContainerHeight', documentContainerView.element.clientHeight);
    set(this, 'documentContainerWidth', documentContainerView.element.clientWidth);
  },

  componentWidth: computed('documentContainerWidth', function () {
    var width = get(this, 'documentContainerWidth');
    if (width > 0) {
      return width / 4;
    } 
    return 0;
  }),

  componentHeight: computed('documentContainerHeight', function () {
    var height = get(this, 'documentContainerHeight');
    if (height > 0) {
      return height / 2;
    }
    return 0;
  }),

  marginLeft: computed('componentWidth', function () {
    var width = get(this, 'componentWidth');
    if (width > 0) {
      return width / 2;
    }
    return 0;
  }),

  marginTop: computed('componentHeight', function () {
    var height = get(this, 'componentHeight');
    if (height > 0) {
      return height / 2;
    }
    return 0;
  }),

  displayType: computed('isVisible', function () {
    if (get(this, 'isVisible')) {
      return 'inline';
    }
    return 'none';
  }),

  style: computed('componentWidth', 'componentHeight', function () {
    var styles = [
      'width: ' + get(this, 'componentWidth') + 'px',
      'height: ' + get(this, 'componentHeight') + 'px',
      'top: ' + '50%',
      'left: ' + '50%',
      'margin-left: ' + '-' + get(this, 'marginLeft') + 'px',
      'margin-top: ' + '-' + get(this, 'marginTop') + 'px',
      'position: ' + 'absolute',
      'z-index: ' + '999',
      'background-color: ' + 'rgb(0,0,170)',
      'opacity: ' + '0.9',
      'display: ' + get(this, 'displayType')
    ];

    return styles.join('; ');
  })

});

export default PDFLoadingComponent;
