var app = module.exports = require('appjs');
var fs = require('fs');
var http = require('http');
var io = require('socket.io-client');
var CasparCG = require("caspar-cg");

//config variables
var GENERATOR_ID, SERVER_IP, ADMIN_PORT, CASPAR_IP, CASPAR_PORT;

app.serveFilesFrom(__dirname + '/content');


var statusIcon = app.createStatusIcon({
  icon:'./data/content/icons/32.png',
  tooltip:'Dreamhack CasparCG Toolbox'
});

var window = app.createWindow({
  width  : 640,
  height : 200,
  icons  : __dirname + '/content/icons'
});

window.on('create', function(){
  console.log("Window Created");
  window.frame.show();
  window.frame.center();  

  fs.readFile('config', 'utf8', function (err, data) {
    if (err) throw err;
    GENERATOR_ID = JSON.parse(data).id;
    SERVER_IP = JSON.parse(data).server_ip;
    ADMIN_PORT = JSON.parse(data).admin_port;
    CASPAR_IP = JSON.parse(data).caspar_ip;
    CASPAR_PORT = JSON.parse(data).caspar_port;
  });

});

window.on('ready', function(){
  console.log("Window Ready");

  window.frame.minimize();
  window.process = process;
  window.module = module;

  window.addEventListener('app-done', function(e){
    var socket = io.connect('http://' + SERVER_IP + ':' + ADMIN_PORT);

    socket.on('connect', function () {

      socket.on('restart', function (data) {

        if(data.id == GENERATOR_ID)
        {
          console.log("Restarted server: " + CASPAR_IP);
          var ccg = new CasparCG(CASPAR_IP, CASPAR_PORT);
          ccg.connect(function () {
            ccg.sendCommand("RESTART");        
          });
        }

      });

      socket.on('reload', function (data) {

        if(data.id == GENERATOR_ID)
        {
          console.log("Reloaded template: " + data.template + " on server: " + CASPAR_IP);
          var ccg = new CasparCG(CASPAR_IP, CASPAR_PORT);
          ccg.connect(function () {
            ccg.loadTemplate("1-20", data.template, 1);
          });
        }

      });
    });


    var url = 'http://' + SERVER_IP + '/generator/startup/' + GENERATOR_ID;

    http.get(url, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var response = JSON.parse(body)
            var template = response[0].template;
            setTimeout(function(){
              var ccg = new CasparCG(CASPAR_IP, CASPAR_PORT);
              ccg.connect(function () {
                ccg.loadTemplate("1-20", template, 1);
                console.log("Loaded Template: " + template)
              });
            },20000);
        });
    }).on('error', function(e) {
          console.log("Got error: ", e);
    });

    startClient();
  });

  function F12(e){ return e.keyIdentifier === 'F12' }
  function Command_Option_J(e){ return e.keyCode === 74 && e.metaKey && e.altKey }

  window.addEventListener('keydown', function(e){
    if (F12(e) || Command_Option_J(e)) {
      window.frame.openDevTools();
    }
  });
});

window.on('close', function(){
  console.log("Window Closed");
});
