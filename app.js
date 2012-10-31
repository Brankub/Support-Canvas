var static = require("node-static");
var file = new(static.Server)('./public');
var fs = require('fs');
var qs = require('querystring');

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



app.listen(8080);
