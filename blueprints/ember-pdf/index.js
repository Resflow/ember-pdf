module.exports = {

  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackageToProject('pdfjs-dist', '>=1.4.0');
  }

};
