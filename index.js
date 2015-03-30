#!/usr/bin/env node
var git = require('gift');
var GitHubApi = require('github');
var http = require('http');
var request = require('request-promise');
var prompt = require('prompt');
var appRoot = require('app-root-path');
var promptSchema = require('./prompt-schema');
var gitAuto = require('./filewatcher');
var prompts = require('./prompts');
var gitAuth = require('./git-auth');
var repoRequests = require('./repo-requests');
var gitCommands = require('./git-create-repo');
var fs = require('fs');
var Q = require('q');

var currentDir = appRoot.path;
var repo = git(currentDir);
var github = new GitHubApi({
	version: "3.0.0"
});

var githubUsername, githubPassword, repositoryList, newRepoInfo; 

prompt.start();

prompts.userInfo()
	.then(function (results) {
		githubUsername = results.githubUsername;
		githubPassword = results.githubPassword
		return options = {
			uri: 'http://localhost:1337/api/cli/login',
			body: {
				username: githubUsername,
				password: results.codestreamPassword
			},
			json: true,
			resolveWithFullResponse: true
		}
	})
	.then(function (options) {
		var deferred = Q.defer();

		request.post(options, function (err, response, body) {
			deferred.resolve(response);
		});
		return deferred.promise;
	})
	.then(function (response) {
		repositoryList = response.body;
		console.log(repositoryList);
		sessionCookie = response.headers['set-cookie'][0]
		return prompts.chooseRepo();
	})
	.then(function (results) {
		return repoRequests.repoMatch(repositoryList, results, sessionCookie);
	})
	.then(function (response) {
		//To create a new repository
		if (response.newRepoName) {
			gitCommands.createRepo(response, githubUsername, githubPassword)
				.then(function (repoInfo) {
					newRepoInfo = repoInfo;
					return gitCommands.addHook(repoInfo, githubUsername, githubPassword);
				})
				.then(function (hookInfo) {
					return gitCommands.addRemoteToLocal(newRepoInfo.ssh_url, repo);
				})
				// .then(function () {
				// 	fs.writeFileSync('Readme.md', "File generated by Codestream CLI");
				// 	gitAuto.autoCommit("Readme.md", repo);
				// })
				.then(function () {
					return repoRequests.sendRepo(newRepoInfo, githubUsername, sessionCookie);
				})
				.then(function (response) {
					console.log("Your Lecture can be found at http://codestream.co/" + response.repoId);
					gitAuto.fileWatcher(currentDir, repo);

				});
		}
		//start watching files if a repo was matched
		else {
			console.log("Your lecture is starting at " + response.repoId);
			gitAuto.fileWatcher(currentDir, repo);
		}
	}).done();