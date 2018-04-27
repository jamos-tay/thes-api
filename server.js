var express = require('express');
var app = express();
var fs = require("fs");
var port = process.env.PORT || 3000;

var words;
var mapping;


const sqlite3 = require('sqlite3').verbose();

var dbs = [];

for(var i = 0; i < 16; i++){
    dbs[i] = new sqlite3.Database('./words-' + i + '.db', sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the words database.');
    });
}



app.get('/:word', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
    var word = req.params.word;
    var crypto = require('crypto');
    var definitions = {};
    var index = parseInt(crypto.createHash('md5').update(word).digest("hex")[0], 16);
    dbs[index].serialize(() => {
        console.log("Word: " + word + ", index: " + index);
        dbs[index].each("select * from definitions d join synonyms s on d.key = s.key where d.word = ?", req.params.word, (err, row) => {
            if (err) {
              console.error(err.message);
            }
            
            if(!(row.definition in definitions)){
                definitions[row.definition] = {};
            }
            definitions[row.definition][row.synonym] = row.similarity;

            /*
           for(var l in mapping){
               var synonym = {};
               synonym["definition"] = words[l["def"]];
               synonym["words"] = {}
               for(var w in l["words"]){
                   synonym["words"][mapping[w]] = l["words"][w];
               }
               reply.push(synonym);
           }
           */
        }, function(){ 
            res.send(JSON.stringify(definitions));
        });
       
    });

})

/*
app.post('/addItem', function (req, res) {
   items[req.body.name] = {
       "price" : req.body.price
   };
   fs.writeFile('data.json', items, 'utf8', function(err, data) { console.log("Written"); });
   res.send(JSON.stringify(items));
})
*/

var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})