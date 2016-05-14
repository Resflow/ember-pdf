import Ember from 'ember';
import CanvasComponent from './canvas';

const { get, set, on, observer, computed } = Ember;

let PDFPageThumbnailComponent = CanvasComponent.extend({
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
    let originalWidth = get(this, 'pageView.width');
    let originalHeight = get(this, 'pageView.height');
    let height = (originalHeight / originalWidth) * get(this, 'width');
    height = Math.round(height);

    if (height !== get(this, 'height')) {
      set(this, 'height', height);
    }
  }),

  _mirrorPageCanvas: function () {
    let pageCanvas = get(this, 'pageCanvas');
    let width = get(this, 'pageView.width');
    let height = get(this, 'pageView.height');
    let targetWidth = get(this, 'width');
    let targetHeight = get(this, 'height');
    let thumbCtx = get(this, 'renderingContext2d');
    let scalingCanvas = document.createElement('canvas');
    let scalingCtx = scalingCanvas.getContext('2d');

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
    let pageView = get(this, 'pageView');
    set(pageView, 'thumbnailView', this);
    pageView.on('canvasDidChange', this, '_mirrorPageCanvas');
  }),

  _teardownPageViewListener: on('willDestroy', function () {
    let pageView = get(this, 'pageView');
    set(pageView, 'thumbnailView', null);
    pageView.off('canvasDidChange', this, '_mirrorPageCanvas');
  }),

  click: function () {
    this.toggleProperty('isSelected');
  }
});

export default PDFPageThumbnailComponent;
