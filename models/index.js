var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DATABASE_URL);
var basename = path.basename(module.filename);
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name.charAt(0).toUpperCase() + model.name.slice(1)] = model;
  });

Object.values(db).forEach(function(model) {
  if (model.associate) {
    model.associate(db);
  }
});

sequelize.sync(); // TODO: Use migrations instead

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
