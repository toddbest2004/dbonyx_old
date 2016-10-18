"use strict";
var db = require("./database");
var models = {};

models.Achievement = require("./achievement");
models.AchievementCategory = require("./achievementCategory");
models.Auction = require("./auction");
models.Item = require("./item");
models.Realm = require("./realm");

module.exports = models;