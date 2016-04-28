var fs = require("fs");
var util = require('util')
var striptags = require('striptags')
var open = require('open')

var posts = JSON.parse(fs.readFileSync("./Plage.app/Contents/Resources/posts.json", "utf8")).posts;

var AlchemyAPI = require('./alchemyapi_node');
var alchemyapi = new AlchemyAPI();

function getPostText(post) {
	return [post.title,post.question,post.i_ans,post.s_ans,post.followup_text].join(' ');
}

postsText = striptags(posts.reduce(function (prev, curr, ci, arr) {
	return prev + getPostText(curr)
}));

var chunksize = 49000;
var stop = postsText.length;
var offset = 0;
var entitiesList = [];
var oreqs = parseInt(1+(stop-offset)/chunksize);

console.log("Getting sentiment data...");
console.log("Getting "+parseInt(1+(stop-offset)/chunksize)+" chunks.");
for (var i = offset; i < parseInt(1+(stop-offset)/chunksize); i++) {
	chunk = postsText.slice(offset+i*chunksize,offset+(i+1)*chunksize);
	console.log("Getting chunk for "+(offset+i*chunksize)+" to "+(offset+(i+1)*chunksize));
	alchemyapi.entities('text', chunk, {sentiment:1,disambiguate:0}, function(response) {
		entitiesList.push(response.entities);
		finish();
	});
}

function finish() {
	if (--oreqs == 0) {
		entities = collate(entitiesList);
		finalEnts = []
		entities.sort(compare).map(function (entity) {
			finalEnts.push({
				'subject': entity.text,
				'sentiment': entity.sentiment.type,
				'strength': entity.sentiment.score || 0
			});
		});
		console.log('Writing results...');
		fs.writeFileSync('./Plage.app/Contents/Resources/entities.json', JSON.stringify(finalEnts));
		part2();
	}
}

function collate(arr) {
	finalEntities = [];
	for (entityList of arr) {
		for (entity of entityList) {
			shouldAdd = true;
			for (finalEntity of finalEntities) {
				if (entity.text == finalEntity.text) {
					shouldAdd = false;
				}
			}
			if (shouldAdd) {
				finalEntities.push(entity);
			}
		}
	}
	return finalEntities;
}

function compare(a,b) {
	if (a.relevance < b.relevance)
		return 1;
	else if (a.relevance > b.relevance)
		return -1;
	else
		return 0;
}
function part2() {
	var fs = require("fs");
var util = require('util')
var striptags = require('striptags')
var open = require('open')
	console.log("winning")
	var players = 0.0;
	var noobs = 0.0;
	entities = JSON.parse(fs.readFileSync('./Plage.app/Contents/Resources/entities.json', 'utf-8'));
	var setPostTopics = function (posts) {
		for (var post of posts) {
			post.topics = {};
			for (var entity of entities) {
				noobs++;
				if (entity.posts === undefined) {
					entity.posts = [post];
				}
				if (entity.interactions === undefined) {
					entity.interactions = 0;				
				}
				var occurrencesOfEntityInPost = getPostText(post).split(entity.subject).length - 1;
				if (occurrencesOfEntityInPost > 0) {
					entity.interactions += post.good_note + post.s_thanks + post.i_thanks + post.followups;
					entity.posts.push(post);
					post.topics[entity.subject] = occurrencesOfEntityInPost;
					players++;
				}
			}
		}
		for (var topic of entities) {
			topic.posts.sort(comparePosts).slice(0,5);
		}
		return posts;
	}

	var sentimentForTopic = function (aTopic) {
		for (var topic of entities) {
			if (aTopic == topic.subject) {
				return parseFloat(topic.strength);
			}
		}
		return 0;
	}


	var setPostSentiments = function (posts) {
		for (var post of posts) {
			var sumTopicOccurrences = 0;
			var sumSentiment = 0;
			for (var postTopic in post.topics) {
				sumTopicOccurrences += parseFloat(post.topics[postTopic]);
				sumSentiment += sentimentForTopic(postTopic);
			}
			if (sumTopicOccurrences == 0) {
				post.sentiment = 0;
			} else {
				post.sentiment = sumSentiment/sumTopicOccurrences;
			}
		}
		return posts;
	}

	topicdPosts = setPostTopics(posts);
	finalPosts = setPostSentiments(topicdPosts);

	var makeFolderArray = function (posts) {
		folders = {};
		for (var post of posts) {
			for (var folder of post.folders) {
				if (folders[folder] === undefined) {
					folders[folder] = {
						postCount: 1,
						sentiment: post.sentiment,
						interactions: post.good_note + post.s_thanks + post.i_thanks + post.followups,
						topics: [],
						posts: [post]
					};
					for (topic in post.topics) {
						folders[folder].topics.push(topic);
					}
				} else {
					folders[folder].postCount += 1;
					folders[folder].sentiment += post.sentiment;
					folders[folder].interactions += post.good_note + post.s_thanks + post.i_thanks + post.followups;
					folders[folder].posts.push(post);
					for (topic in post.topics) {
						if (folders[folder].topics.indexOf(topic) == -1) {
							folders[folder].topics.push(topic);
						}
					}
				}
			}
		}
		for (var folder in folders) {
			folders[folder].sentiment /= folders[folder].postCount;
			folders[folder].posts = folders[folder].posts.sort(comparePosts).slice(0,5);
		}
		return folders;
	}

	function comparePosts(a,b) {
		aint = a.good_note + a.s_thanks + a.i_thanks + a.followups
		bint = b.good_note + b.s_thanks + b.i_thanks + b.followups
		if (aint < bint)
			return 1;
		else if (aint > bint)
			return -1;
		else
			return 0;
	}


	var folders = makeFolderArray(finalPosts);
// console.log(folders);
// console.log(entities);

foldersString = "name,sentiment,interactions,title_0,cid_0,sentiment_0,title_1,cid_1,sentiment_1,title_2,cid_2,sentiment_2,title_3,cid_3,sentiment_3,title_4,cid_4,sentiment_4\n";
for (folder in folders) {
	f = folders[folder];
	foldersString += [folder,f.sentiment,f.interactions].join(',');
	for (var i = 0; i < 5; i++) {
		if (f.posts[i] === undefined) {
			foldersString += ",,"
		} else {
			foldersString += ','+f.posts[i].title+','+f.posts[i].cid+','+f.posts[i].sentiment;
		}
	}
	foldersString += '\n';
}
fs.writeFileSync('./Plage.app/Contents/Resources/folders.csv', foldersString);

var getEntityByName = function (aTopic) {
	for (var topic of entities) {
		if (aTopic == topic.subject) {
			return topic;
		}
	}
	return {};
}

for (folder in folders) {
	f = folders[folder];
	topicsString = "name,sentiment,interactions,title_0,cid_0,sentiment_0,title_1,cid_1,sentiment_1,title_2,cid_2,sentiment_2,title_3,cid_3,sentiment_3,title_4,cid_4,sentiment_4\n";
	for (topic of f.topics) {
		t = getEntityByName(topic);
		topicsString += [topic,t.strength,t.interactions].join(',');
		for (var i = 0; i < 5; i++) {
			if (t.posts[i] === undefined) {
				topicsString += ",,"
			} else {
				topicsString += ','+t.posts[i].title+','+t.posts[i].cid+','+t.posts[i].sentiment;
			}
		}
		topicsString += '\n';
	}
	fs.writeFileSync('./Plage.app/Contents/Resources/'+folder+'.csv', topicsString);
}

var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs")
port = process.argv[2] || 8888;

open('http://localhost:8888');
http.createServer(function(request, response) {

	var uri = url.parse(request.url).pathname
	, filename = path.join(path.join(process.cwd(),'Plage.app/Contents/Resources'), uri);

	fs.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}

		// if (fs.statSync(filename).isDirectory()) filename;
		console.log(filename)
		fs.readFile(filename, "binary", function(err, file) {
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}

			response.writeHead(200);
			response.write(file, "binary");
			response.end();
		});
	});
}).listen(parseInt(port, 10));
}