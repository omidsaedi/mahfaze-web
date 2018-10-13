module.exports = function(sequelize, DataTypes) {
  var Note = sequelize.define('note', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    paranoid: true
  });
  
  Note.beforeSave(function(note, options) {
    if (options.overwriteTimestamps) {
      Object.keys(options.overwriteTimestamps).filter(function(key) {
        return key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt';
      }).forEach(function(key) {
        note.setDataValue(key, options.overwriteTimestamps[key]);
      });
    }
  });

  Note.associate = function(models) {
    Note.belongsTo(models.User);
  }
  
  return Note;
};
