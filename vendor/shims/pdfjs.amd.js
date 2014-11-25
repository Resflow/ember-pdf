/* global PDFJS */
define('pdfjs', [], function () {
  'use strict';
  return {
    'default': PDFJS,
    'getDocument': PDFJS.getDocument
  };
});
