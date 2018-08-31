const express = require('express');
const path = require('path');

const app = express();

app.use("/public", express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');

//ROUTING
app.get('/', function(req,res){
    res.render('index');
});
app.get('/login', function(req,res){
    res.render('login');
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});