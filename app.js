// App dependencies
var express = require('express');
var async = require('async');
var http = require('http');
var path = require('path');
var __ = require('underscore');
var ejs = require("ejs");

// Models
var db = require('./models')

// Classes
var db_mysql = require('./classes/mysql');
var passport = require('./classes/passport');
var store = require('./classes/redis');

// Routes
var api = require('./routes/api');
var user = require('./routes/user');
var _event = require('./routes/event');
var emotion = require('./routes/emotion');
var picture = require('./routes/picture')
var contact = require('./routes/contact');
var allergy = require('./routes/allergy');
var question = require('./routes/question');
var position = require('./routes/position')

// Setting the app
var app = express();
var RedisStore = require("connect-redis")(express);

app.configure(function(){
  app.use(express.bodyParser({keepExtensions: true, uploadDir: __dirname + "/public/pictures"}));
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set("view engine", "ejs");
  app.engine("html", ejs.renderFile);
  app.use(express.logger('dev'));
  app.use(express.cookieParser("This is the answer you are looking for %&$!$%$"));
  app.use(express.session({ store: new RedisStore({client: store}) }));
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
  app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
});


/*
 * Static routes
 */

app.get('/', function(req, res) {
  if (req.isAuthenticated()) return res.render('index.html');
  res.redirect('/login');
});

app.get("/login", function (req, res) { return res.render("login.html"); });
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/logout', function (req, res) { req.logout(); res.redirect('/'); });


app.get('/dashboard', function(req,res){
  res.render('dashboard.html');
});

/*
 * API Endpoints
 */

// API listing
app.get('/api/v1', function(req, res){
  console.log(app.routes);
  res.json(__.map(app.routes, function(routeSet){
    return __.map(routeSet, function(route) {
      return {path: route.path, method:route.method}
    });
  }));
});


// Users
app.get('/api/v1/users', api.auth, user.query, api.json);
app.get('/api/v1/me', api.auth, user.me, api.json);
app.post('/api/v1/users', api.auth, user.create, api.json);

// User with id
app.get('/api/v1/users/:userId', api.auth, user.get, api.json);
app.del('/api/v1/users/:userId', api.auth, user.del, api.json);
app.put('/api/v1/users/:userId', api.auth, user.update, api.json);

// Questions
app.post('/api/v1/questions/:questionId', api.auth, question.answer, api.json)

// Emotions
app.post('/api/v1/emotions', api.auth, emotion.create, api.json);
app.get('/api/v1/users/:userId/emotions', api.auth, emotion.query, api.json);

// Pictures
app.get('/api/v1/pictures', api.auth, picture.query, api.json);
app.post('/api/v1/pictures', api.auth, picture.create, api.json);

// Allergies
app.post('/api/v1/allergies', api.auth, allergy.create, api.json);
app.del('/api/v1/users/:userId/allergies/:allergyId', api.auth, allergy.del, api.json);

// Contacts
app.post('/api/v1/contacts', api.auth, contact.create, api.json);
app.get('/api/v1/users/:userId/contacts', api.auth, contact.query, api.json);

// Events
app.post('/api/v1/events', api.auth, _event.create, api.json);

// Position
app.post('/api/v1/positions', api.auth, position.create, api.json)

/*
 * Setting up the database and adding mock data
 */

db
  .sequelize
  .sync({ force: true })
  .complete(function(err) {
    
    db.User.findOrCreate({
      username:"nicolagreco",
      password:"pass",
      name:"Nicola",
      surname:"Greco",
      email:"email@example.org",
      role: "patient",
      telephone:"07707760897"
    }).complete(function(err, user) {
      
      db.Patient.create({
        disability_level:1,
        understanding_level:2,
        communication_type:3,
        support_hours: 12
      }).success(function(patient) {
        patient.setUser(user);
        user.setPatient(patient)
      })

      db.Picture.create({url:'http://healthpassport.herokuapp.com/pictures/apple.jpg'}).success(function(picture1) {
        db.Question.create({title:"This is question one"}).success(function(question1) {
          question1.setPicture(picture1);
          user.addQuestion(question1);
        })
      });

      db.Picture.create({url:'http://healthpassport.herokuapp.com/pictures/apple.jpg'}).success(function(picture1) {
        db.Question.create({title:"This is question one"}).success(function(question1) {
          question1.setPicture(picture1);
          user.addQuestion(question1);
        })
      });

      db.Contact.create({
        "name": "Enrico",
        "surname": "Greco",
        "telephone": "07707760897",
        "description": "The father",
        "picture": null,
        "nickname": "Daddy",
        "kind": "relative"
      }).success(function(contact) {
        user.addContact(contact);
        db.Contact.create({
          "name": "Vittoria",
          "surname": "Pasceri",
          "telephone": "3286154544",
          "description": "The mother",
          "picture": null,
          "nickname": "Mommy",
          "kind": "doctor"
        }).success(function(contact) {
          user.addContact(contact);
          db.Contact.create({
            "name": "Raluca",
            "surname": "Cocioban",
            "telephone": "07766554433",
            "description": "School friend",
            "picture": null,
            "nickname": "Raluca",
            "kind": "friend"
          }).success(function(contact) {
            user.addContact(contact);
          });
        });
      });

      db.Picture.create({url:'http://healthpassport.herokuapp.com/pictures/bananas.jpg'}).success(function(picture1) {
        db.Question.create({title:"This is question one"}).success(function(question1) {
          question1.setPicture(picture1);
          user.addQuestion(question1);
        })
      });
    })
    
    // Finally running the server
    if (err) {
      throw err
    } else {
      http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
      });
    }
  })