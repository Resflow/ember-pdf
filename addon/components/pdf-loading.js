import Ember from 'ember';
import Component from '../runtime/component';
import template from '../templates/components/pdf-loading';

const { get, set, computed } = Ember;

let PDFLoadingComponent = Component.extend({
  classNames: ['ember-pdf-loading'],
  attributeBindings: ['style'],
  template: template,
  defaultMessage: 'Loading...',

  didInsertElement: function () {
    let parentElement = get(this, 'parentView.element');
    set(this, 'parentHeight', parentElement.clientHeight);
    set(this, 'parentWidth', parentElement.clientWidth);
  },

  componentWidth: computed('parentWidth', function () {
    let width = get(this, 'parentWidth');
    if (width > 0) {
      return width / 4;
    }
    return 0;
  }),

  componentHeight: computed('parentHeight', function () {
    let height = get(this, 'parentHeight');
    if (height > 0) {
      return height / 5;
    }
    return 0;
  }),

  marginLeft: computed('componentWidth', function () {
    let width = get(this, 'componentWidth');
    if (width > 0) {
      return width / 2;
    }
    return 0;
  }),

  marginTop: computed('componentHeight', function () {
    let height = get(this, 'componentHeight');
    if (height > 0) {
      return height / 2;
    }
    return 0;
  }),

  style: computed('componentWidth', 'componentHeight', 'marginLeft', 'marginTop', function () {
    let styles = [
      'width: ' + get(this, 'componentWidth') + 'px',
      'height: ' + get(this, 'componentHeight') + 'px',
      'margin-left: ' + '-' + get(this, 'marginLeft') + 'px',
      'margin-top: ' + '-' + get(this, 'marginTop') + 'px'
    ];

    return styles.join('; ');
  })

});

export default PDFLoadingComponent;
