const path = require('path');
var express  = require('express');
var app      = express();                               
var morgan = require('morgan');            
var bodyParser = require('body-parser');    
var cors = require('cors');
 
app.use(morgan('dev'));                                        
app.use(bodyParser.urlencoded({'extended':'true'}));            
app.use(bodyParser.json());                                     
app.use(cors());
app.options('*', cors());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './build', 'index.html'));
  });
 
app.use(express.static('build'));
app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});