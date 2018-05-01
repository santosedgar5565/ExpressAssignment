var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;

var path = require("path");
var fs = require("fs");
var bodyParser = require("body-parser");

app.use(bodyParser.json());

app.get("/survey", function(req, res) {
  res.sendFile(path.resolve(process.cwd(), "app", "public", "survey.html"));
});

app.get("/api/friends", function(req, res) {
  fs.readFile(path.resolve(process.cwd(), "app", "data", "friends.js"), function(err, data){
    if (err) return res.send("Error happened", err.message);
    var friends = JSON.parse(data.toString());
    res.json(friends);
  });
});

app.post("/api/friends", function(req, res){
  fs.readFile(path.resolve(process.cwd(), "app", "data", "friends.js"), function(err, data){
    if (err) return res.send("Error happened", err.message);
    var friends = JSON.parse(data.toString());
    //req.body - the response from ajax request
    //friends - the previous responses by other people
    var bestFriend = friends[0];
    var smallestDifference = getFriendDifferences(req.body, friends[0]);
    for (var i = 1; i < friends.length; i++) {
      var difference = getFriendDifferences(req.body, friends[i])
      if (difference < smallestDifference) {
        bestFriend = friends[i];
        smallestDifference = difference;
      }
    }
    friends.push(req.body);
    fs.writeFile(path.resolve(process.cwd(), "app", "data", "friends.js"), JSON.stringify(friends), function(err){
      if (err) return res.send("Error happened", err.message);
      res.json({
        name: bestFriend.name,
        photo: bestFriend.photo
      });
    })
  });
});

function getFriendDifferences(friend1, friend2) {
  var difference = 0;
  for (var i = 0; i < friend1.scores.length; i++) {
    difference += Math.abs(friend1.scores[i] - friend2.scores[i]);
  }
  return difference;
}

app.get("*", function(req, res) {
  res.sendFile(path.resolve(process.cwd(), "app", "public", "home.html"));
});

app.listen(PORT, function() {
  console.log("Listening on " + PORT);
});

