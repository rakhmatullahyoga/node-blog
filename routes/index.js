var express = require('express');
var router = express.Router();

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.render('login');
  } else {
    next();
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var collection = db.get('post');
    collection.find({},{},function(e,docs){
        res.render('index', {
            "postlist" : docs
        });
    });
});

router.get('/admin', function(req, res) {
    res.redirect('/dashboard');
});

router.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/');
});

router.post('/login', function (req, res) {
    var db = req.db;
    var collection = db.get('user');
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert')
    var ObjectId = require('mongodb').ObjectID;
    var url = 'mongodb://localhost:27017/blogdata';
    collection.findOne(
        { "username" : req.body.username, "password" : req.body.password },
        function (err, doc) {
            if (err) {
                res.send("There was a problem during authentication");
            }
            else {
                if (!doc) {
                    res.send("Username or password incorrect!");
                }
                else {
                    req.session.user_id = req.body.username;
                    res.redirect('/dashboard');
                }
            }
        }
    );
});

router.get('/newpost', checkAuth, function(req, res) {
    res.render('newpost');
});

router.get('/delete/:postid', checkAuth, function(req, res) {
    var db = req.db;
    var collection = db.get('post');
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert')
    var ObjectId = require('mongodb').ObjectID;
    var url = 'mongodb://localhost:27017/blogdata';
    collection.remove(
        { _id : ObjectId(req.params.postid )},
        function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem deleting the information from the database.");
            }
            else {
                // And forward to success page
                res.redirect('/dashboard');
            }
        }
    );
});

router.post('/addpost', checkAuth, function(req, res) {
    var db = req.db;
    var judul = req.body.Judul;
    var konten = req.body.Konten;
    var collection = db.get('post');
    collection.insert(
        {"judul" : judul, "konten" : konten, "tag" : "", "comments" : []},
        function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.redirect('/dashboard');
            }
        }
    );
});

/* GET admin page. */
router.get('/dashboard', checkAuth, function(req, res) {
    var db = req.db;
    var collection = db.get('post');
    collection.find({},{},function(e,docs){
        res.render('dashboard', {
            "postlist" : docs
        });
    });
});

module.exports = router;
