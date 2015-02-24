"use strict";
module.exports = function(sequelize, DataTypes) {
  var game = sequelize.define("game", {
    title: DataTypes.STRING,
    game_id: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.game.belongsTo(models.user)
      }
    }
  });
  return game;
};