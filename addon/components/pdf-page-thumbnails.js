import Ember from 'ember';
import Component from '../runtime/component';
import layout from '../templates/components/pdf-page-thumbnails';

const { $, get, set, on, computed, getOwner } = Ember;
const { filter, filterBy } = computed;

let bindInRunLoop = Ember.run.bind;

let PDFPageThumbnailsComponent = Component.extend({
  layout: layout,
  classNames: ['ember-pdf-page-thumbnails'],
  attributeBindings: ['tabindex'],
  tabindex: 0,
  pageViews: null,
  'on-delete-pages': 'deletePages',

  thumbnailViewClass: computed(function () {
    return getOwner(this).lookup('component:pdf-page-thumbnail');
  }),

  thumbnailViews: filter('childViews', function (childView) {
    return (childView instanceof get(this, 'thumbnailViewClass'));
  }),

  selectedThumbnailViews: filterBy('thumbnailViews', 'isSelected'),
  selectedPageIndices: computed.mapBy('selectedThumbnailViews', 'pageView.pageIndex'),
  selectedPageNumbers: computed.mapBy('selectedThumbnailViews', 'pageView.pageNumber'),

  canSelectMultipleThumbnails: false,

  setupKeyboardListeners: on('willInsertElement', function () {
    $(document).on('keydown.' + get(this, 'elementId'), bindInRunLoop(this, 'keyDown'));
    $(document).on('keyup.' + get(this, 'elementId'), bindInRunLoop(this, 'keyUp'));
  }),

  teardownKeyboardListeners: on('willDestroyElement', function () {
    $(document).off('keydown.' + get(this, 'elementId'));
    $(document).off('keyup.' + get(this, 'elementId'));
  }),

  keyDown: function (event) {
    set(this, 'canSelectMultipleThumbnails', event.shiftKey || event.metaKey);

    if (get(this, 'hasFocus')) {
      switch (event.keyCode) {
        // Backspace (But is Delete on some Macs!)
        case 8:
        // Delete
        case 46:
          event.preventDefault();
          console.log('delete');
          this.sendAction('on-delete-pages', get(this, 'selectedPageNumbers'));
      }
    }
  },

  keyUp: function (event) {
    set(this, 'canSelectMultipleThumbnails', event.shiftKey || event.metaKey);
  },

  focusIn: function () {
    set(this, 'hasFocus', true);
    this.teardownKeyboardListeners();
  },

  focusOut: function () {
    set(this, 'hasFocus', false);
    this.setupKeyboardListeners();
  },

  actions: {
    thumbnailViewWasSelected: function (thumbnailView) {
      if (get(this, 'canSelectMultipleThumbnails') === false) {
        get(this, 'selectedThumbnailViews').without(thumbnailView).setEach('isSelected', false);
        thumbnailView.scrollIntoViewIfNeeded({ top: -20 });
        get(thumbnailView, 'pageView').scrollIntoView();
      }
    }
  }
});

export default PDFPageThumbnailsComponent;
