import Ember from 'ember';
import PDFJS from 'pdfjs';
import { getDocument as fetchPDF } from 'pdfjs';
import Component from '../runtime/component';
import { DEFAULT_SCALE } from '../settings';
import layout from '../templates/components/pdf-document';

PDFJS.workerSrc = PDFJS.workerSrc || '/assets/pdf.worker.js';

const { get, set, on, computed, observer, setProperties } = Ember;
const { alias } = computed;

/**
 * [extend description]
 * @module Ember.Component
 * @class PDFDocumentComponent
 */
let PDFDocumentComponent = Component.extend({
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
    let clean = {};
    let keys = ['url', 'data', 'password', 'httpHeaders'];
    let value;

    for (let i = 0, l = keys.length; i < l; i++) {
      value = get(this, keys[i]);

      if (value !== undefined && value !== null) {
        clean[keys[i]] = value;
      }
    }

    return clean;
  }),

  _updatePromise: observer('src', on('init', function () {
    let options = get(this, '_options');

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
  return computed(countKey, contextKey, function () {
    let items = Ember.A();
    let count = get(this, countKey);
    let context = get(this, contextKey);

    for (let i = 0; i < count; i++) {
      items.pushObject(callback.call(this, i, context));
    }

    return items;
  });
}
