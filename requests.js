var request = require('request-promise');
var prompts = require('./prompts');
var Q = require('q');

var loginUser = function (username, password) {
	var deferred = Q.defer();
	var options = {
		uri: 'http://localhost:1337/api/cli/login',
		body: {
			username: username,
			password: password
		},
		json: true,
		resolveWithFullResponse: true
	}
	request.post(options, function (err, response, body) {
		if (err) console.log(err);
		deferred.resolve(response);
	});
	return deferred.promise;
}

var getRepos = function (userId, cookie) {
	var deferred = Q.defer();
	var options = {
		uri: 'http://localhost:1337/api/cli/repos/user/' +userId,
		headers: {
			'Cookie': cookie
		}
	}
	request.get(options, function (err, response, body) {
		if (err) console.log(err);
		deferred.resolve(JSON.parse(body));
	})
	return deferred.promise;
}


var getRepo = function (repoName, cookie) {
	var deferred = Q.defer();
	var options = {
		uri: 'http://localhost:1337/api/cli/repos/' + repoName,
		headers: {
			'Cookie': cookie
		}
	}
	request.get(options, function (err, response, body) {
		if(err) console.log(err);	
		deferred.resolve(body);
	})
	return deferred.promise;
}

var createRepo = function (repoName, username, password, cookie) {
	var deferred = Q.defer();
	var options = {
		uri: 'http://localhost:1337/api/cli/repos/create',
		body: {
			repository: repoName,
			username: username,
			password: password
		},
		json: true,
		headers: {
			'Cookie': cookie
		}
	}
	request.post(options, function (err, response, body) {
		if (err) console.log(err);		
		deferred.resolve(body);
	});
	return deferred.promise;
}

module.exports = {
	loginUser: loginUser,
	getRepos: getRepos,
	getRepo: getRepo,
	createRepo: createRepo
}