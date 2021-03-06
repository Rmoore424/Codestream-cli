var watch = require('watch'); // need to edit watch main.js(handle double event)
var chalk = require('chalk');
var Q = require('q');

var autoCommit = function (file, repo, repoId) {
	var deferred = Q.defer()
	repo.add(file, function (err) {
		if (err) console.log(chalk.red("Error adding file to local repository", err));
		repo.commit("auto committed by Codestream", function (err) {
			if (err) console.log(chalk.red("Error commiting files: Nothing to commit"));
			else console.log(chalk.green("New local commit created"));
			repo.remote_push('codestream', 'master', function (err) {
				if (err) console.log(chalk.red("Error pushing to remote", err));
				else console.log(chalk.green("Commit pushed to remote repository"));
				if (repoId) {
					deferred.resolve(repoId);
				}
				else deferred.resolve();
			});
		});
	});
	return deferred.promise;
}

//add comment
var fileWatcher = function (directory, repo) {
			//watch for modified or create files and auto add, commit, push to the remote
			watch.createMonitor(directory, {ignoreDotFiles: true, ignoreDirectoryPattern: /(node_modules)|(bower_components)/}, function (monitor) {
				console.log(chalk.yellow('Files are now being watched'));
				monitor.on('created', function (file, stat) {
					if (!stat.isDirectory()) {
						autoCommit(file, repo);
					}
				});

				monitor.on('changed', function (file, curr, prev) {
					autoCommit(file, repo);
				});

				monitor.on('removed', function (file, stat) {
					if (!stat.isDirectory()) {
						autoCommit(file, repo);
					}
				});
			});			
		}

module.exports = {
	fileWatcher: fileWatcher,
	autoCommit: autoCommit
}