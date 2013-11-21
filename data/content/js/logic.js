var GENERATOR_ID = 1;
var KEEPALIVE = 0;
var SERVER_IP = 0;


function bootstrap()
{
	$.getJSON("http://" + SERVER_IP + "/generator/register/" + GENERATOR_ID, function( data ) {
		$("#started").html("Registered as ID: " + GENERATOR_ID);
		var interval = setInterval(function(){
			KeepAlive(GENERATOR_ID);
		},30000);
	});
	window.dispatchEvent(new Event('app-done'));
}

	function KeepAlive(id)
	{
		$.getJSON("http://" + SERVER_IP + "/generator/ping/" + GENERATOR_ID, function( data ) {
			KEEPALIVE = KEEPALIVE + 1;
			$("keepalive").html("KEPT ALIVE:" + KEEPALIVE)
		});
	}


addEventListener('app-ready', function(e){
  var fs   = require('fs'),
      path = require('path'),
      cwd  = process.cwd(),
      ul   = document.getElementById('paths');


  fs.readFile('config', 'utf8', function (err, data) {
    if (err) throw err;
    GENERATOR_ID = JSON.parse(data).id;
    SERVER_IP = JSON.parse(data).server_ip;
    bootstrap();
  });

});

