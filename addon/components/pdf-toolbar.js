import Component from '../runtime/component';
import layout from '../templates/components/pdf-toolbar';

var PDFToolbarComponent = Component.extend({
  layout: layout,
  classNames: ['ember-pdf-toolbar']
});

export default PDFToolbarComponent;