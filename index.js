var express = require('express');

var bgg = require('bgg');

var session = require('express-session');

var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');

var flash = require('connect-flash');

var db = require('./models/');

var app = express();


app.set('view engine','ejs');


app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
    secret: 'board game',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use(function(req, res, next) {
    req.getUser = function() {
        return req.session.user || false;
    }
    next();
});


app.get("*", function(req, res, next) {
     var alerts = req.flash();
     res.locals.alerts = alerts;
     res.locals.user = req.getUser();
     next();
});



app.get('/', function(req,res){
    res.render('index');
});


app.get('/auth/signup', function(req,res) {
    res.render('signup');
});


app.post('/auth/signup', function(req,res) {

    // res.send(req.body);

    db.user.findOrCreate({
        where: {
            'email':req.body.email
        },
        defaults: {
            'email':req.body.email,
            'fullName': req.body.fullName.toUpperCase(),
            'password': req.body.password
        }
    })
    .spread(function(user,created){
        res.redirect('/auth/login');
    })
    .catch(function(error) {
        if(error && Array.isArray(error.errors)) {
            error.errors.forEach(function(errorItem) {
                req.flash('danger',errorItem.message);
            });
        }
        else {
            req.flash('danger','Unknown error');
        }
        res.redirect('/auth/signup');
    })
});


app.get('/auth/login', function(req,res){
    var user = req.getUser();

    if(user) {
        res.redirect('/added');
    }
    else {
        res.render('login');
    }
});


app.post('/auth/login', function(req,res) {


    db.user.find({where: {'email':req.body.email}}).then(function(userObj) {
        if(userObj) {
            bcrypt.compare(req.body.password, userObj.password, function(err, match) {
                if (match == true) {
                    req.session.user = {
                        'id': userObj.id,
                        'email': userObj.email,
                        'fullName': userObj.fullName
                    };
                    res.redirect('/added');
                }
                else {
                    req.flash('danger', 'invalid password');
                    res.redirect('/auth/login');
                }
            })
        }
        else {
            req.flash('danger','Unknown user.');
            res.redirect('/auth/login');
        }
    })
});


var lastSearch = '';

app.get('/results', function(req,res){

    var user = req.getUser();

    var searchTerm = req.query.title;

    if(user) {
        bgg('search', {query: searchTerm})
          .then(function(results){
            // res.send(results);
            var content = results.items.item;

            // res.send(content)
            lastSearch = searchTerm;
            res.render('results',{'content':content || [] });
        });
    }
    else {
        res.redirect('/auth/login');
    }
});


app.get('/games/:id', function(req,res) {

    var user = req.getUser();

    var gameId = req.params.id;

    if(user) {
        bgg('thing', {id: gameId})
          .then(function(results){



            db.game.find({
                where:{
                    'game_id':gameId,
                    'userId':user.id
                }
            }).then(function(userHasGame){

                // res.send(results);


                var objData = results.items.item;


                var title="unknown";


                if(Array.isArray(objData.name)){
                    objData.name.forEach(function(item){
                        if(item.type=='primary'){
                            title=item.value;
                        }
                    });
                }else{
                    title=objData.name.value
                }

                console.log('objData',objData);

                res.render('games',{
                    'gameId': objData.id,
                    'thumbnail': objData.thumbnail,
                    'title': title,
                    'year': objData.yearpublished.value,
                    'playTime': objData.playingtime.value,
                    'minPlayers': objData.minplayers.value,
                    'maxPlayers': objData.maxplayers.value,


                    'userHasGame':!!userHasGame,
                    'previousSearch':lastSearch
                });
            }).catch(function(err){
                if(err) throw err;
            })

        });
    }
    else {
        res.redirect('/auth/login');
    }
});


app.post('/added', function(req,res) {



    var user = req.getUser();

    if(user) {

        db.game.findOrCreate({
            where:{
                'game_id':req.body.game_id,
                'userId':user.id
            },
            defaults:{
                'game_id':req.body.game_id,
                'title':req.body.title,
                'userId':user.id
            },
        }).spread(function(gameInfo,created){
            console.log('found or created',gameInfo,created);
            res.send({'data':gameInfo,'created':created});
        }).catch(function(err) {
            if(err) throw err;
        });


    }
    else {
        res.redirect('/auth/login');
    }
});



app.get('/added', function(req,res) {

    var user = req.getUser();

    if(user) {
        db.game.findAll({where: {'userId':user.id},order: 'id DESC'}).then(function(data) {
            res.render('added',{'allData':data});
        })
        .catch(function(err){
            if(err) throw err
        })
    }
    else {
        res.redirect('/auth/login');
    }

});


app.get('/random/game', function(req,res) {
    var user = req.getUser();

    if(user) {
        db.game.find({where:{'userId':user.id},order:'random()',limit:20}).then(function(games){

            // res.send(games)

            res.render('gameselector',{'allGames':games});

        });
    }
    else {
        res.redirect('/auth/login');
    }
});



app.delete('/added/:tag', function(req,res) {

    var user = req.getUser()

    if(user) {
        db.game.destroy({where: {'id':req.params.tag}}).then(function(data) {
            res.send({'delete':data});
        })
    }
    else {
        res.redirect('/auth/login');
    }
});



app.get('/auth/logout', function(req,res) {

    // res.send('logged out');
    delete req.session.user;
    req.flash('info','You have been logged out');
    res.redirect('/');
})



app.use(function(req,res) {
    res.status(404);
    res.render('error404');
});











app.listen(3000);



