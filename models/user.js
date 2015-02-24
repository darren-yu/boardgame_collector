"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {

    fullName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5,60],
          msg: 'Please enter your full first and last name.'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'Pleae enter a valid email address.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5,100],
          msg: 'Please enter a password longer than 5 characters.'
        }
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.game)
      }
    },
    hooks: {

      beforeCreate: function(data, notUsed, sendback) {

        var pwdToEncrypt = data.password;

        bcrypt.hash(pwdToEncrypt, 11, function(error, hash) {
          data.password = hash;
          sendback(null, data);
        })

      }
    }
  });
  return user;
};