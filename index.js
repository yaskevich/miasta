'use strict';
// https://www.npmjs.com/package/sqlite
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const polish = /^[A-ZĄĆĘŁŃÓŚŹŻ\s\-]+$/i; // RegExp for Polish words. No reason to do search on non-Polish entitities
const LIM = 50; // hardcoded limit for quantity of output to avoid bloating up a map


(async () => {
    const db = await open({ filename: path.join(__dirname, 'polska.db'), driver: sqlite3.cached.Database })
	const app = express();
	const port = process.env.PORT || 3010;
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	
	app.post('/data.json', async(req,res) => {
		const query = req.body.q.trim();
		let data = [];
		console.log(query);
		if (query && polish.test(query)) {
			data = await db.all("SELECT * FROM polska where name LIKE '%" + query + "%' LIMIT " + LIM);	
		}
		res.json(data);
	});	
	
	app.get('/', async(req,res) => {
		res.sendFile(path.join(__dirname, 'public', 'index.html'));
	});

	app.listen(port);  
	console.log("Running at Port "+ port);
})()