var page = require('webpage').create();
page.onConsoleMessage = function(msg) {
  console.log('Page title is ' + msg);
};
page.open('http://localhost:8080/', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    page.evaluate(function(){
    	// console.log(page.content)
    });
    console.log(page.content)
  		phantom.exit();
  }
});

