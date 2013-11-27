//
// Module Dependencies
//

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    utils = require('../lib/utils');

var login = function(req, res) {
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo);
        delete req.session.returnTo;
        return;
    };
    req.user.update();
    res.redirect('/app');
};

//
// Auth Callback
//

exports.authCallback = login;

//
// Show Login Form
//

exports.login = function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/app');
        return;
    }

    res.render('/', {
        title: 'Login',
        message: req.flash('error')
    });
};

//
// Show Sign Up Form
//

exports.signup = function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/app');
        return;
    }

    res.render('user/signup', {
        title: 'Sign Up',
        error: ''
    });
};

// Help
exports.help = function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/app');
        return;
    }

    res.render('user/help', {
        title: 'Help Page'
    });
};


//Forgot Password
exports.forgotPassword = function (req, res) {
  if (req.isAuthenticated()) {
        res.redirect('/app');
        return;
    }

    res.render('user/forgot-password', {
      title: 'Forgot Password'
    });
}

/**
 * Logout
 */

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
}

/**
 * Session
 */

exports.session = login

/**
 * Create user
 */

exports.create = function(req, res) {
    var user = new User(req.body)
    user.provider = 'local'
    user.save(function(err) {
        if (err) {
            return res.render('users/signup', {
                errors: utils.errors(err.errors),
                user: user,
                title: 'Sign up'
            })
        }

        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
            if (err) return next(err)
            return res.redirect('/app');
        })
    })
}

/**
 *  Show profile
 */

exports.show = function(req, res) {
    var user = req.profile
    res.render('users/show', {
        title: user.name,
        user: user
    })
}

/**
 * Find user by id
 */

exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err)
            if (!user) return next(new Error('Failed to load User ' + id))
            req.profile = user
            next()
        })
}