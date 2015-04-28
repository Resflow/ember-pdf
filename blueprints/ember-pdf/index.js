var path = require('path');

module.exports = {

  normalizeEntityName: function () {},

  afterInstall: function () {
    var bowerJsonPath = path.join(__dirname, '..', '..', 'bower.json');
    var bowerJson =  require(bowerJsonPath);

    return this.addBowerPackageToProject('pdfjs-dist', bowerJson.dependencies['pdfjs-dist']);
  }

};

