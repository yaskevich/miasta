'use strict';
// https://www.npmjs.com/package/sqlite
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import fs from 'fs'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const polish = /^[A-ZĄĆĘŁŃÓŚŹŻ\s\-]+$/i; // RegExp for Polish words. No reason to do search on non-Polish entities
const LIM = 50; // hardcoded limit for quantity of output to avoid bloating up a map


(async () => {
    const db = await open({ filename: path.join(__dirname, 'polska.db'), driver: sqlite3.cached.Database })
	const app = express();
	const port = process.env.PORT || 3010;
	const index = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), {encoding:'utf8', flag:'r'}); 
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	app.set('trust proxy', true);
	
	app.post('/data.json', async(req,res) => {
		const query = req.body.q.trim();
		const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		let data = [];
		console.log(`[${ip}] ${query}`);
		if (query && polish.test(query)) {
			data = await db.all("SELECT * FROM polska where name LIKE '%" + query + "%' LIMIT " + LIM);	
		}
		res.json(data);
	});	
	
	app.get('/', async(req,res) => {
		res.send(index); // meaningless caching of everything :-)
	});

	app.listen(port);  
	console.log("Server started on port " + port);
})()