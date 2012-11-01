var static = require("node-static"),
	fs = require('fs'),
	qs = require('querystring'),
	file = new(static.Server)('./public');

var app = require('http').createServer(function (request, response) {
	if (request.url === '/image') {
		if (request.method == 'POST') {
			var post  = '';
			request.on('data', function (data) {
				post += data;
			});
			request.on('end', function () {	
				postData = qs.parse(post);
				var filename = 'public/tmp/'+postData['name']+'.jpg';			

				var decodedImage = new Buffer(postData['image'], 'base64');
				var dataBuffer = new Buffer(decodedImage, 'base64');				
				fs.writeFile(filename, dataBuffer);
				response.writeHead(200, {
				  "Content-Type": "application/json"
				});
				response.write(JSON.stringify({image: postData['name']}));
				response.end();
			});
		}
	}else{
	  request.addListener('end', function () {
		file.serve(request, response)
	  })
	}
});


var io = require("socket.io").listen(app)
io.sockets.on("connection", function(socket){
  socket.on("message",function(message){
    console.log(message);
    socket.broadcast.emit("message", message)
  })
})

io.configure( function(){
	io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.enable('browser client gzip');          // gzip the file
	io.set('log level', 1);                    // reduce logging
	io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	    'websocket'
	  , 'flashsocket'
	  , 'htmlfile'
	  , 'xhr-polling'
	  , 'jsonp-polling'
	]);
});


app.listen(8080);
