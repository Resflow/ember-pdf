import Ember from 'ember';
import Component from '../runtime/component';
import { DEFAULT_SCALE } from '../settings';
import layout from '../templates/components/pdf-viewer';

var $ = Ember.$;
var get = Ember.get;
var set = Ember.set;
var bindInRunLoop = Ember.run.bind;
var throttleInRunLoop = Ember.run.throttle;
var on = Ember.on;
var reads = Ember.computed.reads;

var PDFViewerComponent = Component.extend({
  layout: layout,
  classNames: ['ember-pdf-viewer'],
  src: null,
  scale: DEFAULT_SCALE,
  'on-delete-pages': 'deletePages',
  'on-close-viewer': 'closeViewer',

  zoomOptions: [{
    label: 'Automatic Zoom',
    scale: 'auto'
  }, {
    label: 'Page Width',
    scale: 'page-width'
  }, {
    label: '50%',
    scale: 0.5
  }, {
    label: '75%',
    scale: 0.75
  }, {
    label: '100%',
    scale: 1
  }, {
    label: '125%',
    scale: 1.25
  }, {
    label: '150%',
    scale: 1.5
  }, {
    label: '200%',
    scale: 2
  }, {
    label: '300%',
    scale: 3
  }, {
    label: '400%',
    scale: 4
  }],
  pageThumbnailsView: null,
  documentContainerView: null,
  documentView: reads('documentContainerView.documentView'),
  pageViews: reads('documentView.pageViews'),
  isPDFLoading: reads('documentView.isPending'),

  actions: {
    deleteSelectedPages: function () {
      this.send('deletePages', get(this, 'pageThumbnailsView.selectedPageNumbers'));
    },

    deletePages: function (pageNumbers) {
      var pageCount = get(this, 'documentView.numPages');
      this.sendAction('on-delete-pages', pageNumbers, pageCount);
    },

    close: function () {
      this.sendAction('on-close-viewer');
    },

    print: function () {
      window.print();
    }
  },

  selectCurrentPageViewThumbnail: function () {
    var visibleViews = findVisibleViews(get(this, 'pageViews'));
    if (get(visibleViews, 'length') !== 0) {
      set(visibleViews, 'lastObject.thumbnailView.isSelected', true);
    }
  },

  setupDocumentScrollListener: on('didInsertElement', function () {
    var viewer = this;
    get(this, 'documentContainerView').$().on('scroll.' + get(this, 'elementId'), function () {
      throttleInRunLoop(viewer, 'selectCurrentPageViewThumbnail', 300, false);
    });
  }),

  teardownDocumentScrollListener: on('willDestroyElement', function () {
    get(this, 'documentContainerView').$().off('scroll.' + get(this, 'elementId'));
  }),

  beforePrint: function () {
    get(this, 'pageViews').invoke('beforePrint');
    var body = document.querySelector('body');
    body.setAttribute('data-mozPrintCallback', true);
    var div = document.getElementById('ember-pdf-print-container');
    body.appendChild(div);
  },

  afterPrint: function () {
    var body = document.querySelector('body');
    body.removeAttribute('data-mozPrintCallback');

    var div = document.getElementById('ember-pdf-print-container');
    while (div.hasChildNodes()) {
      div.removeChild(div.lastChild);
    }

    get(this, 'pageViews').invoke('scheduleRenderPage');
  },

  setupPrintListeners: on('willInsertElement', function () {
    $(window).on('beforeprint.' + get(this, 'elementId'), bindInRunLoop(this, 'beforePrint'));
    $(window).on('afterprint.' + get(this, 'elementId'), bindInRunLoop(this, 'afterPrint'));
  }),

  teardownPrintListeners: on('willDestroyElement', function () {
    $(window).off('beforeprint.' + get(this, 'elementId'));
    $(window).off('afterprint.' + get(this, 'elementId'));
  })
});

export default PDFViewerComponent;

function findVisibleViews(views) {
  if (!views || get(views, 'length') === 0) {
    return [];
  }

  var scrollEl = get(views.objectAt(0), 'element').offsetParent;
  var top = scrollEl.scrollTop, bottom = top + scrollEl.clientHeight;
  var left = scrollEl.scrollLeft, right = left + scrollEl.clientWidth;

  var visible = [], view, element;
  var currentHeight, viewHeight, hiddenHeight, percentHeight;
  var currentWidth, viewWidth;

  for (var i = 0, ii = views.length; i < ii; ++i) {
    view = views[i];
    element = get(view, 'element');
    currentHeight = element.offsetTop + element.clientTop;
    viewHeight = element.clientHeight;

    if ((currentHeight + viewHeight) < top) {
      continue;
    }

    if (currentHeight > bottom) {
      break;
    }

    currentWidth = element.offsetLeft + element.clientLeft;
    viewWidth = element.clientWidth;

    if ((currentWidth + viewWidth) < left || currentWidth > right) {
      continue;
    }

    hiddenHeight = Math.max(0, top - currentHeight) + Math.max(0, currentHeight + viewHeight - bottom);
    percentHeight = ((viewHeight - hiddenHeight) * 100 / viewHeight) | 0;

    visible.pushObject({
      view: view,
      percent: percentHeight
    });
  }

  visible.sort(function (a, b) {
    return a.percent - b.percent;
  });

  return visible.map(function (item) {
    return item.view;
  });
}