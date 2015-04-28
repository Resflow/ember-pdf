import Ember from 'ember';
import CanvasComponent from './canvas';

var get = Ember.get;
var set = Ember.set;
var on = Ember.on;
var observer = Ember.observer;
var computed = Ember.computed;
var reads = computed.reads;

var PDFPageThumbnailComponent = CanvasComponent.extend({
  'on-select': 'thumbnailViewWasSelected',
  classNames: ['ember-pdf-page-thumbnail'],
  classNameBindings: ['isSelected:ember-pdf-page-thumbnail-selected'],

  isSelected: false,
  width: 100,
  height: 129,

  pageView: null,
  
  pageCanvas: computed('pageView.canvasView', function () {
    return get(this, 'pageView.canvasView.element');
  }),

  _updateHeightToMatchPage: observer('pageView.height', 'width', function () {
    var originalWidth = get(this, 'pageView.width');
    var originalHeight = get(this, 'pageView.height');
    var height = (originalHeight / originalWidth) * get(this, 'width');
    height = Math.round(height);

    if (height !== get(this, 'height')) {
      set(this, 'height', height);
    }
  }),

  _mirrorPageCanvas: function () {
    var pageCanvas = get(this, 'pageCanvas');
    var width = get(this, 'pageView.width');
    var height = get(this, 'pageView.height');
    var targetWidth = get(this, 'width');
    var targetHeight = get(this, 'height');
    var thumbCtx = get(this, 'renderingContext2d');
    var scalingCanvas = document.createElement('canvas');
    var scalingCtx = scalingCanvas.getContext('2d');

    scalingCanvas.width = width;
    scalingCanvas.height = height;
    scalingCtx.drawImage(pageCanvas, 0, 0, width, height);

    // Gradually scale it down by halfs because the browser does a crappy
    // job of antialiasing
    while (width > targetWidth) {
      scalingCtx.drawImage(scalingCanvas,
                           0, 0, width, height,
                           0, 0, width >> 1, height >> 1);
      width >>= 1;
      height >>= 1;
    }

    thumbCtx.drawImage(scalingCanvas,
                       0, 0, width, height,
                       0, 0, targetWidth, targetHeight);
  },

  selectedStatusDidChange: observer('isSelected', function () {
    if (get(this, 'isSelected')) {
      this.sendAction('on-select', this);
    }
  }),

  _setupPageViewListener: on('init', function () {
    var pageView = get(this, 'pageView');
    set(pageView, 'thumbnailView', this);
    pageView.on('canvasDidChange', this, '_mirrorPageCanvas');
  }),

  _teardownPageViewListener: on('willDestroy', function () {
    var pageView = get(this, 'pageView');
    set(pageView, 'thumbnailView', null);
    pageView.off('canvasDidChange', this, '_mirrorPageCanvas');
  }),
  
  click: function () {
    this.toggleProperty('isSelected');
  }
});

export default PDFPageThumbnailComponent;