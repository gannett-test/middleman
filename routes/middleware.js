/**
 * This file contains the common middleware used by your routes.
 * 
 * Extend or replace these functions as your application requires.
 * 
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require('lodash'),
    config = require('config');


/**
	Initialises the standard view locals
	
	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {
	
	var locals = res.locals;
	
	locals.navLinks = [
		{
            label: 'Home',
            key: 'home',
            href: '/'
        }
	];
	
	locals.user = req.user;
    
    if (req.user && req.user.services.github.isConfigured) {
        locals.navLinks.push({
            label: 'My Organizations',
            key: 'manage',
            href: '/manage/' + req.user.services.github.username
        })
    }
    
    
    if (req.user && req.user.isAdmin) {
        _.forEach(config.get('github.organizations'), function(org) {
            locals.navLinks.push({
                label: org.name,
                key: 'members/' + org.name,
                href: '/members/' + org.name 
            }); 
        });
    }
	
	next();
	
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {
	
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	
	res.locals.messages = _.some(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
	
	next();
	
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {

	if (!req.user) {
		res.redirect('/auth/saml');
	} else {
		next();
	}
	
};

/**
	Prevents people from accessing protected pages when they're not signed in with github
 */

exports.requireGithubAuthentication = function(req, res, next) {

	if (!req.user.services.github.isConfigured) {
		res.redirect('/');
	} else {
		next();
	}
	
};

/**
	Prevents people from accessing protected pages when they're not signed in with an admin account
 */

exports.requireAdminUser = function(req, res, next) {

	if (!req.user.isAdmin) {
		res.redirect('/');
	} else {
		next();
	}
	
};