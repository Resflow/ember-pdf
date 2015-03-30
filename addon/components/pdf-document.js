import Ember from 'ember';
import PDFJS from 'pdfjs';
import { getDocument as fetchPDF } from 'pdfjs';
import Component from '../runtime/component';
import ProxyMixin from '../mixins/proxy';
import { DEFAULT_SCALE } from '../settings';
import layout from '../templates/components/pdf-document';

PDFJS.workerSrc = PDFJS.workerSrc || '/assets/pdf.worker.js';


var get = Ember.get;
var set = Ember.set;
var setProperties = Ember.setProperties;
var PromiseProxyMixin = Ember.PromiseProxyMixin;
var observer = Ember.observer;
var on = Ember.on;
var computed = Ember.computed;
var alias = computed.alias;

var PDFDocumentComponent = Component.extend(ProxyMixin, PromiseProxyMixin, {
  layout: layout,
  classNames: ['ember-pdf-document'],
  pageViews: null,
  src: null,
  data: null,
  password: null,
  httpHeaders: null,
  scale: DEFAULT_SCALE,
  url: alias('src'),
  document: alias('promise'),

  init: function () {
    this._super();
    set(this, 'pageViews', Ember.A());
  },

  pages: collectLoop('numPages', 'content', function (index, content) {
    return content.getPage(index + 1);
  }),

  _fetchPDF: fetchPDF,

  _options: computed('url', 'data', 'password', 'httpHeaders', function () {
    var clean = {};
    var keys = ['url', 'data', 'password', 'httpHeaders'];
    var value;

    for (var i = 0, l = keys.length; i < l; i++) {
      value = get(this, keys[i]);

      if (value !== undefined && value !== null) {
        clean[keys[i]] = value;
      }
    }

    return clean;
  }),

  _updatePromise: observer('src', on('init', function () {
    var options = get(this, '_options');

    if (options.url || options.data) {
      set(this, 'promise',
        this._fetchPDF(options)
      );
    } else {
      setProperties(this, {
        isFulfilled: false,
        isRejected: true,
        reason: '<pdf-document> missing a valid src or data attribute, so nothing to load.'
      });
    }
  }))
});

export default PDFDocumentComponent;

function collectLoop(countKey, contextKey, callback) {
  return Ember.computed(countKey, contextKey, function () {
    var items = Ember.A();
    var count = get(this, countKey);
    var context = get(this, contextKey);

    for (var i = 0; i < count; i++) {
      items.pushObject(callback.call(this, i, context));
    }

    return items;
  });
}