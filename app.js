var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var apn = require('apn');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


setTimeout(function(){
    initializeApn();
}, 2000);


function initializeApn() {

    var options = {
        cert:'certificates/fake_cert.pem',
        key:'certificates/fake_key.pem',
        passphrase:"somepassphrase",
        production:true
    };

    var service = new apn.Connection(options);

    service.on("connected", function() {
        console.log("Connected");
    });

    service.on("transmitted", function(notification, device) {
        console.log("Notification transmitted to:" + device.token.toString("hex"));
    });

    var token = '84f4ca53f514fcaf8077afsdfsdf2f1182698b2e5sdff5304f34f968c53ee10e58';

    var myDevice = new apn.Device(token);

    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
    note.payload = {'messageFrom': 'Master Blaster'};

    service.pushNotification(note, myDevice);

    var feedbackOpts = {
        "batchFeedback": true,
        "interval": 300
    };

    var feedback = new apn.Feedback(feedbackOpts);
    feedback.on("feedback", function(devices) {
        devices.forEach(function(item) {
            console.log("Device: " + item.device + " Time: " + item.time());
        });
    });
}


module.exports = app;
