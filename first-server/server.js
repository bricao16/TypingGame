// build-in NodeJS modules
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3');
var md5   = require("blueimp-md5");

// downloaded NodeJS modules
var mime = require('mime-types');
var multiparty = require('multiparty');

var port = process.env.PORT || 80;
var public_dir = path.join(__dirname, 'public');
//var public_dir = path.join(__dirname, 'tmarrinan.github.io');
var db_filename = path.join(__dirname, 'db', 'login.sqlite3');

//
var bodyParser = require('body-parser');
var express = require('express');
var WebSocket = require('ws');
var app = express();


app.use(express.static(public_dir));
//app.use(bodyParser.urlencoded({ extended: true }));

var name = '';
var psw = '';
var points = 0;
	

var server = http.createServer((req, res) => {

    var req_url = url.parse(req.url);
    var filename = req_url.pathname.substring(1);
	console.log("REREWRERWRRERWR" + filename );
    if (req.method === 'GET') {


	var num = Number(filename.replace(/\D/g,''));
	var filename = filename.replace(/[0-9]/g, "");
	if( filename === 'stat.html' ){
		var ext = path.extname(filename);
		var type = mime.lookup(ext) || 'text/plain';
		fs.readFile(path.join(public_dir, filename), (err, data) => {
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('Oh no!!!! Could not find that page!'+data);
				res.end();
			}
			else {
				var con =0;
			var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
				
				db.all("SELECT * FROM STAT ORDER BY SCORE DESC LIMIT 10", [], (err, rows) => {
						if (err) {
							throw err;
						}
						var name ='';
						var point='';
						rows.forEach((row) => {
						con++;
							console.log(con+"="+num+"  : "+ row.NAME+" "+ row.SCORE);
						if(num == con){console.log("here"); name=row.NAME; point=row.SCORE; }
						});

			var h = "<h>" +name+"</h>";
			var h2 = "<h>"+ point +"</h>";
			res.writeHead(200, {'Content-Type': type});
			res.write('<!DOCTYPE html>\n');
			res.write('<html>\n');
			res.write('<head>\n');
			res.write('    <title>STAT</title>\n');
			res.write('</head>\n');
			res.write('<body>\n');
			res.write("STAT: ");
			res.write(h+" : ");
			res.write(h2);
			res.write('</body>\n');
			res.write('</html>');
			
			res.end();			
				});
			});

			}
		});

	
	}
	else {

	if(filename === ''){
		filename = 'login.html';
	}
        
	var ext = path.extname(filename);
	var type = mime.lookup(ext) || 'text/plain';
	fs.readFile(path.join(public_dir, filename), (err, data) => {
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Oh no!!!! Could not find that page!TT'+data);
			res.end();
		}
		else {
			res.writeHead(200, {'Content-Type': type});
			res.write(data);
			res.end();
		}
	});

	}

    }//GET
    else if (req.method === 'POST') {

	if(filename !== 'update' ){
            var body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                var data_arr = body.split('&');
                var i;
                var data = {};
                var key_val;
                for (i = 0; i < data_arr.length; i++) {
                    key_val = data_arr[i].split('=');
                    data[key_val[0]] = key_val[1];
                }
                name = data['userid'];
		psw = data['psw'];
            });
	}

	if (filename == 'update') {
            var body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                var data_arr = body.split('&');
                var i;
                var data = {};
                var key_val;
                for (i = 0; i < data_arr.length; i++) {
                    key_val = data_arr[i].split('=');
                    data[key_val[0]] = key_val[1];
                }
                points = data['points'];
		name  = data['username'];
	     });

		var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
			db.get("SELECT * FROM STAT WHERE NAME= '" + name + "'", (err, row)=>{
				if (err) {
					throw err;
				}
				if( points  > row.SCORE ){					
					db.run("UPDATE STAT SET SCORE= '"+points+"'"+ "WHERE NAME='" +name+"'" , (err, row)=>{
						if (err) { throw err; }
					});
				}
			});
		});
	}

	if (filename === 'game2') {
		
		filename = 'index.html';
		var ext = path.extname(filename);
		var type = mime.lookup(ext) || 'text/plain';				
		fs.readFile(path.join(public_dir, filename), (err, data) => {
		var  leaderboard ='';
		var link = "<a href='stat.html'>";//</a>
		if (err) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Oh no! Could not find that page!');
			res.end();
		} else {


		var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
		db.all("SELECT * FROM STAT ORDER BY SCORE DESC LIMIT 10", [], (err, rows) => {
			if (err) {
				throw err;
			}
			var leaderboard ='';
			var li = "<a href='stat";
			var num = 0;
			var nk = ".html'>";//</a>
			rows.forEach((row) => {
				num++;
				leaderboard += '<tr><td>' + li+String(num)+nk +row.NAME+ "</a>" + '</td><td>' + row.SCORE +"pts"+ '</td></tr>';
			});

			res.writeHead(200, {'Content-Type': type});
			res.write('<!DOCTYPE html>\n');
			res.write('<html>\n');
			res.write('<head>\n');
			res.write('    <title>Leader Board</title>\n');
			res.write('</head>\n');
			res.write('<body>\n');
			res.write('<div id="block2" style="float:right;">\n');
			res.write('<table><thead><th>Player</th><th>Score</th></thead>\n');
			res.write( leaderboard );
			res.write('</table></div>\n');
			res.write('</body>\n');
			res.write('</html>');
			res.write(data);
			res.end();			
			});
			});
		}
        	});//fs.readFile
    }


	var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
	    if (err) {
	        console.log('Error opening ' + db_filename + __dirname);
	    } else {
	        console.log('Now connected to ' + db_filename + ' file: '+__dirname +' html:'+ public_dir);
			var enc = md5(psw);	
			db.get("SELECT * FROM login WHERE username = '" + name + "'" +"AND password = '" + enc + "'", (err, row)=>{
				if(typeof row !== 'undefined') {//'sign in'

    				if (filename === 'game') {
        				filename = 'index.html';
    				}

        			var ext = path.extname(filename);
        			var type = mime.lookup(ext) || 'text/plain';
					//console.log("\nhere: "+path.join(public_dir, filename));
        			fs.readFile(path.join(public_dir, filename), (err, data) => {
						if (err) {
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.write('Oh no! Could not find that page!');
							res.end();
						}
						else {
		var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
		db.all("SELECT * FROM STAT ORDER BY SCORE DESC LIMIT 10", [], (err, rows) => {
			if (err) {
				throw err;
			}
			var leaderboard ='';
			var li = "<a href='stat";
			var num = 0;
			var nk = ".html'>";//</a>
			rows.forEach((row) => {
				num++;
				leaderboard += '<tr><td>' + li+String(num)+nk +row.NAME+ "</a>" + '</td><td>' + row.SCORE +"pts"+ '</td></tr>';
			});

			res.writeHead(200, {'Content-Type': type});
			res.write('<!DOCTYPE html>\n');
			res.write('<html>\n');
			res.write('<head>\n');
			res.write('    <title>Leader Board</title>\n');
			res.write('</head>\n');
			res.write('<body>\n');
			res.write('<div id="block2" style="float:right;">\n');
			res.write('<table><thead><th>Player</th><th>Score</th></thead>\n');
			res.write( leaderboard );
			res.write('</table></div>\n');
			res.write('</body>\n');
			res.write('</html>');
			res.write(data);
			res.end();			
			});
			});
						}
        			});

				} else if (filename === 'upload2') { //'signup'
					filename = 'login.html';
					var ext = path.extname(filename);
					var type = mime.lookup(ext) || 'text/plain';
					fs.readFile(path.join(public_dir, filename), (err, data) => {
					if (err) {
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.write('Oh no! Could not find that page!');
							res.end();
					} else {
						var enc = md5(psw);
						db.run('INSERT INTO login(username, password) VALUES(?, ?)', [name ,enc], (err) => {
							if(err) {
								return console.log(err.message); 
							}
						})
						db.run('INSERT INTO STAT(NAME, SCORE) VALUES(?, ?)', [name ,0], (err) => {
						if(err) {
							return console.log(err.message);
						}
						})
						res.writeHead(200, {'Content-Type': type});
						res.write('<!DOCTYPE html>\n');
						res.write('<html>\n');
						res.write('<head>\n');
						res.write('    <title>Thank You</title>\n');
						res.write('</head>\n');
						res.write('<body>\n');
						res.write('CREATED YOUR ACOUNT, NOW YOU CAN LOG IN');
						res.write('</body>\n');
						res.write('</html>');
						res.write(data);
						res.end();
							}
					});
				}else if (filename !== 'game2' && filename !== 'index.html' ) {
					filename = 'login.html';
					var ext = path.extname(filename);
					var type = mime.lookup(ext) || 'text/plain';
					//console.log("\nhere: "+path.join(public_dir, filename));
					
					fs.readFile(path.join(public_dir, filename), (err, data) => {
						if (err) {
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.write('Oh no! Could not find that page!');
							res.end();
						} else {
							res.writeHead(200, {'Content-Type': type});
							res.write(data);
							res.write('<!DOCTYPE html>\n');
							res.write('<html>\n');
							res.write('<head>\n');
							res.write('</head>\n');
							res.write('<body>\n');
							res.write(' or maybe Incorreect username or password');
							res.write('</body>\n');
							res.write('</html>');

							res.end();
						}
				});
		}
			});//db.get
		}//else
	});//db

	}//POST

});//server

var wss = new WebSocket.Server({server: server});
var clients = {};
var client_count = 0;
var client_id2 ='';
function UpdateClientCount() {
    var message = {msg: 'client_count', data: client_count};
    Broadcast(JSON.stringify(message));
}
function Broadcast(message) {
    var id;

    for (id in clients) {
        if (clients.hasOwnProperty(id)) {
		/*if( id === client_id2){
			
			console.log("YES");
			console.log("ID COUNT: "+ client_count);
		}*/
            clients[id].send(message);
        }
    }
}

wss.on('connection', (ws) => {
    var client_id = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
	client_id2 = client_id;
    //console.log('New connection: ' + client_id);
    client_count++;
    clients[client_id] = ws;
	//console.log("clientid: "+ client_id);

/*for(var i = 0; i < myArray.length; i++) {
    for(var j = 0; j < myArray[i].length; j++) {
        console.log(myArray[i][j]);
    }
}*/
    ws.on('message', (message) => {
        //console.log('Message from ' + client_id + ': ' + message);
        var chat = {msg: 'text', data: message};
        Broadcast(JSON.stringify(chat));
    });
    ws.on('close', () => {
        //console.log('Client disconnected: ' + client_id);
        delete clients[client_id];
        client_count--;
        UpdateClientCount();
    });

    UpdateClientCount();
});

console.log('Now listening on port ' + port);
server.listen(port, '0.0.0.0');
