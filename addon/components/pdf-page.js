import Ember from 'ember';
import Component from '../runtime/component';
import { DEFAULT_SCALE, MAX_AUTO_SCALE } from '../settings';
import layout from '../templates/components/pdf-page';

const { $, get, set, on, computed, observer } = Ember;
const { alias, reads } = computed;
let scheduleOnceInRunLoop = Ember.run.scheduleOnce;

/**
 * @module Ember.Component
 * @class PDFPageComponent
 */
let PDFPageComponent = Component.extend({
  layout: layout,
  canvasView: null,
  thumbnailView: null,
  classNames: ['ember-pdf-page'],
  show: reads('isSettled'),
  hasPendingChanges: true,
  scale: DEFAULT_SCALE,
  page: alias('promise'),
  width: reads('viewport.width'),
  height: reads('viewport.height'),
  canvasContext: reads('canvasView.renderingContext2d'),
  attributeBindings: ['style'],

  style: computed('width', 'height', 'show', function () {
    let styles = [
      'width: ' + get(this, 'width') + 'px',
      'height: ' + get(this, 'height') + 'px',
      'display: ' + (get(this, 'show') ? 'block' : 'none')
    ];

    return styles.join('; ');
  }),

  viewport: computed('content', 'isFulfilled', 'scaleValue', function () {
    if (get(this, 'isFulfilled') && get(this, 'content')) {
      return get(this, 'content').getViewport(get(this, 'scaleValue'));
    }
  }),

  registerWithDocumentView: on('init', function () {
    let pageViews = get(this, 'parentView.pageViews');
    if (pageViews instanceof Array) {
      pageViews.pushObject(this);
    }
  }),

  unregisterWithDocumentView: on('willDestroyElement', function () {
    let pageViews = get(this, 'parentView.pageViews');
    if (pageViews instanceof Array) {
      pageViews.removeObject(this);
    }
  }),

  withPage: function (callback) {
    let component = this;
    this.then(function (page) {
      callback.call(component, page);
    });
  },

  scheduleRenderPage: observer('viewport', on('willInsertElement', function () {
    if (get(this, 'viewport')) {
      scheduleOnceInRunLoop('render', this, 'renderPage', get(this, 'hasPendingChanges'));
    }
  })),

  renderPage: function (hasPendingChanges) {
    this.withPage(function (page) {
      let pageView = this;
      page.render({
        canvasContext: this.get('canvasContext'),
        viewport: this.get('viewport')
      }).then(function () {
        if (hasPendingChanges) {
          Ember.run(function () {
            pageView.trigger('canvasDidChange', pageView);
            set(pageView, 'hasPendingChanges', false);
          });
        }
      });
    });
  },

  setupResizeHandler: on('willInsertElement', function () {
    let component = this;
    $(window).on('resize.' + get(this, 'elementId'), function () {
       Ember.run.debounce(component, 'notifyPropertyChange', 'scaleValue', 500);
    });
  }),

  teardownResizeHandler: on('willDestroyElement', function () {
    $(window).off('resize.' + get(this, 'elementId'));
  }),

  scaleValue: computed('scale', function () {
    let scale = this.get('scale');
    let scaleValue = parseFloat(scale, 10);
    if (scaleValue > 0) {
      return scaleValue;
    } else {
      let parentElement = this.get('parentView.element');
      let defaultViewport = get(this, 'content').getViewport(1);

      let pageWidthScale = parentElement.clientWidth / defaultViewport.width;
      let pageHeightScale = parentElement.clientHeight / defaultViewport.height;

      switch (scale) {
        case 'page-actual':
          scaleValue = 1;
          break;
        case 'page-width':
          scaleValue = pageWidthScale;
          break;
        case 'page-height':
          scaleValue = pageHeightScale;
          break;
        case 'page-fit':
          scaleValue = Math.min(pageWidthScale, pageHeightScale);
          break;
        case 'auto':
          if (defaultViewport.width > defaultViewport.height) {
            scaleValue = Math.min(pageHeightScale, pageWidthScale);
          } else {
            scaleValue = pageWidthScale;
          }
          // Make sure we didn't just go over our max
          scaleValue = Math.min(MAX_AUTO_SCALE, scaleValue);
          break;
        default:
          Ember.assert('<pdf-page>: "' + scaleValue +'" is an unknown zoom value.');
          return;
        }

      return scaleValue;
    }
  }),

  beforePrint: function () {
    let pdfPage = get(this, 'content');

    let viewport = pdfPage.getViewport(1);
    // Use the same hack we use for high dpi displays for printing to get better
    // output until bug 811002 is fixed in FF.
    let PRINT_OUTPUT_SCALE = 2;
    let canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width) * PRINT_OUTPUT_SCALE;
    canvas.height = Math.floor(viewport.height) * PRINT_OUTPUT_SCALE;

    let printContainer = document.getElementById('ember-pdf-print-container');
    let canvasWrapper = document.createElement('div');

    canvasWrapper.appendChild(canvas);
    printContainer.appendChild(canvasWrapper);

    canvas.mozPrintCallback = function (obj) {
      let ctx = obj.context;

      ctx.save();
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.scale(PRINT_OUTPUT_SCALE, PRINT_OUTPUT_SCALE);

      let renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        intent: 'print'
      };

      pdfPage.render(renderContext).promise.then(function () {
        // Tell the printEngine that rendering this canvas/page has finished.
        obj.done();
      }, function (error) {
        Ember.assert(error);
        // Tell the printEngine that rendering this canvas/page has failed.
        // This will make the print proces stop.
        if ('abort' in obj) {
          obj.abort();
        } else {
          obj.done();
        }
      });
    };
  }
});

export default PDFPageComponent;
