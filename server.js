var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app);

app.use(express.static(__dirname + ''));

app.get('/', function(request, response) {
    response.redirect('index.html');
});

server.listen(3000, function() {
    console.log("Listening on port 3000");
    
});
