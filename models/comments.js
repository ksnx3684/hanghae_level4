'use strict';
const {
  Model
} = require('sequelize');
const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.Users, {
        targetKey: 'userId',
        foreignKey: 'userId',
      });

      this.belongsTo(models.Posts, {
        targetKey: 'postId',
        foreignKey: 'postId',
      });

    }
  }
  Comments.init({
    commentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};