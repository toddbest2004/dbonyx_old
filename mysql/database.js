"use strict";
var mysql = require('mysql'),
	knex = require("knex")({
		client: 'mysql',
		connection: {
			host     : process.env.DATABASE_HOST,
			user     : process.env.DATABASE_USER,
			password : process.env.DATABASE_PASS,
			database : process.env.DATABASE_NAME,
			charset: 'utf8'
		}
	}),
	bookshelf = require('bookshelf')(knex);

	bookshelf.plugin('registry');
	
module.exports = bookshelf;