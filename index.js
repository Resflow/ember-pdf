'use strict';

module.exports = {
  name: 'ember-pdf',
  included: function (app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/pdfjs-dist/web/compatibility.js');
    app.import(app.bowerDirectory + '/pdfjs-dist/build/pdf.js');

    // Styles are in `vendor` for now due to ember-cli bug:
    // https://github.com/stefanpenner/ember-cli/issues/2363
    app.import('vendor/ember-pdf/pdf-viewer.css');
    app.import('vendor/ember-pdf/pdf-toolbar.css');
    app.import('vendor/ember-pdf/pdf-page.css');
    app.import('vendor/ember-pdf/pdf-page-thumbnails.css');
    app.import('vendor/ember-pdf/pdf-page-thumbnail.css');

    app.import('vendor/polyfills/HTMLCanvasElement/mozPrintCallback.js');

    app.import('vendor/shims/pdfjs.amd.js', {
      exports: {
        'pdfjs': [
          'default',
          'getDocument'
        ]
      }
    });
  }
};
