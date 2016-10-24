"use strict";
// var db = require("./database");
var models = {};

models.Achievement = require("./achievement");
models.AchievementCategory = require("./achievementCategory");
models.Auction = require("./auction");
models.AuctionHistory = require("./auctionHistory");
models.Battlepet = require("./battlepet");
models.BattlepetAbility = require("./battlepetAbility");
models.BattlepetAbilityJoin = require("./battlepetAbilityJoin");
models.Character = require("./character");
models.Faction = require("./faction");
models.Item = require("./item");
models.Mount = require("./mount");
models.Quest = require("./quest");
models.Realm = require("./realm");
models.Stat = require("./stat");
models.Title = require("./title");
models.User = require("./user");
models.UserCredentials = require("./userCredentials");

module.exports = models;