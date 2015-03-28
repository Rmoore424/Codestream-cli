var GitHubApi = require('github');
var Q = require('q');

var github = new GitHubApi({
	version: "3.0.0"
});

var createRepo = function (data, username, password) {
	var deferred = Q.defer();

	github.authenticate({
		type: 'basic',
		username: username,
		password: password
	})

	github.repos.create({
		name: data.newRepoName
	}, function (err, repoInfo) {
		deferred.resolve(repoInfo);
	})
	return deferred.promise;
}

var addHook = function (repoInfo, username, password) {
	var deferred = Q.defer();

	github.authenticate({
		type: 'basic',
		username: username,
		password: password
	})

	github.repos.createHook({
		user: username,
		repo: repoInfo.name,
		name: 'web',
		config: {
			url: 'http:/localhost:4567/payload',
			content_type: 'application/json'
		}
	}, function (err, hookInfo) {
		deferred.resolve(hookInfo);
	})
	return deferred.promise;
}

var addRemoteToLocal = function (url, repo) {
	var deferred = Q.defer();
	repo.remote_add('origin', url, function (err) {
		if (err) console.log(err)
			deferred.resolve();
	})
	return deferred.promise;
}

module.exports = {
	createRepo: createRepo,
	addHook: addHook,
	addRemoteToLocal: addRemoteToLocal
}