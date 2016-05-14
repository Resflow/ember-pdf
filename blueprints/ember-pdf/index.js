module.exports = {

  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackageToProject('pdfjs-dist', '>=1.4.0');
  },

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '');
    app.import(app.bowerDirectory + '');
  }

};
