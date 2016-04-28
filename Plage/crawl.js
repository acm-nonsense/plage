var fs = require("fs");
//https://piazza.com/class/hxmi9k2ekgy25x
console.log("Starting crawl...");
console.log("Getting data from "+process.argv[2]);

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;


var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();


displayed = false;
driver.get('https://piazza.com/');
driver.findElement(By.xpath('//*[@id="bs-example-navbar-collapse-1"]/ul[2]/li[2]/button')).click();
driver.wait(function () {
	driver.findElement(By.xpath('//*[@id="email_field"]')).isDisplayed().then(function(value){
        displayed = value;
    });
    return displayed;
}, 5000);
driver.findElement(By.xpath('//*[@id="email_field"]')).sendKeys(process.argv[3]);
driver.wait(function () {
	driver.findElement(By.xpath('//*[@id="password_field"]')).isDisplayed().then(function(value){
        displayed = value;
    });
    return displayed;
}, 5000);
driver.findElement(By.xpath('//*[@id="password_field"]')).sendKeys(process.argv[4]);
driver.findElement(By.xpath('//*[@id="login-form"]/div[2]/button[1]')).click().then(function () {
	driver.get(process.argv[2]);
	driver.sleep(2000);
	driver.findElement(By.id('total_posts_count')).getText().then(function (text) {
		postsToCapture = parseInt(text);
		process.stdout.write("total:");
		console.log(text);
		last_cid = JSON.parse(fs.readFileSync('./Plage.app/Contents/Resources/posts.json')).last_cid;
		crawl(last_cid);
		console.log("Starting from "+last_cid);
	});
});


var baseURL = process.argv[2]+'?cid=';
var postsToCapture = 0;

function crawl(i) {
	process.stdout.write("crawling:");
	console.log(i);
	driver.get(baseURL+i).then(function (code) {
		driver.switchTo().alert().thenCatch(function (e) {
			if (e.code !== 27) { throw e; }
			var post = {
				followup_text: "",
				folders: [],
				cid: i
			};
			var indetLengthItems = 2;
            var fieldsToCapture = indetLengthItems + 7;

			var terminateRequest = function () {
				fieldsToCapture -= 1;
				if (fieldsToCapture + indetLengthItems == 0) {
                    console.log(post);
					old_posts = JSON.parse(fs.readFileSync('./Plage.app/Contents/Resources/posts.json')).posts;
					old_posts.push(post);
					fs.writeFileSync('./Plage.app/Contents/Resources/posts.json', JSON.stringify({posts:old_posts, last_cid:i}));
					if (postsToCapture == 0) {
						driver.quit();
					}
				}
			};
			var terminateIndetRequest = function (numNewItems) {
				indetLengthItems -= 1;
				fieldsToCapture += numNewItems;
				terminateRequest();
			};
			driver.findElement(By.className('post_region_title')).then(function (element) {
				element.getAttribute('innerHTML').then(function (html) {
					post.title = html;
					terminateRequest();
				});
			});
			driver.findElement(By.id('questionText')).then(function (element) {
				element.getAttribute('innerHTML').then(function (html) {
					post.question = html;
					terminateRequest();
				});
			});
			driver.findElement(By.className('post_actions_number good_note')).then(function (element) {
				element.getAttribute('innerHTML').then(function (html) {
					post.good_note = parseInt(html);
					terminateRequest();
				});
			}).thenCatch(function (e) {
				post.good_note = 0;
				terminateRequest();
			});;
			driver.findElement(By.id('instructor_answer')).then(function (element) {
				element.findElement(By.className('post_region_text')).then(function (element) {
					element.getAttribute('innerHTML').then(function (html) {
						post.i_ans = html;
						terminateRequest();
					});
				}).thenCatch(function (e) {
					post.i_ans = "";
					terminateRequest();
				});
				element.findElement(By.className('post_actions_number good_answer')).then(function (element) {
					element.getAttribute('innerHTML').then(function (html) {
						post.i_thanks = parseInt(html);
						terminateRequest();
					});
				}).thenCatch(function (e) {
					post.i_thanks = 0;
					terminateRequest();
				});
			}).thenCatch(function (e) {
				post.i_ans = "";
				post.i_thanks = 0;
				terminateRequest();
				terminateRequest();
			});;
			driver.findElement(By.id('member_answer')).then(function (element) {
				element.findElement(By.className('post_region_text')).then(function (element) {
					element.getAttribute('innerHTML').then(function (html) {
						post.s_ans = html;
						terminateRequest();
					});
				}).thenCatch(function (e) {
					post.s_ans = "";
					terminateRequest();
				});
				element.findElement(By.className('post_actions_number good_answer')).then(function (element) {
					element.getAttribute('innerHTML').then(function (html) {
						post.s_thanks = parseInt(html);
						terminateRequest();
					});
				}).thenCatch(function (e) {
					post.s_thanks = 0;
					terminateRequest();
				});
			}).thenCatch(function (e) {
				post.s_ans = "";
				post.s_thanks = 0;
				terminateRequest();
				terminateRequest();
			});
			driver.findElement(By.className('all_replies')).then(function (element) {
				element.findElements(By.tagName('p')).then(function (elements) {
					terminateIndetRequest(elements.length);
					post.followups = elements.length;
					elements.forEach(function (element) {
						element.getAttribute('innerHTML').then(function (html) {
							post.followup_text += html;
							terminateRequest();
						});
					});
				});
			}).thenCatch(function (e) {
				post.followups = 0;
				post.followup_text = "";
				terminateIndetRequest(0);
			});
			driver.findElement(By.className('post_region_folders')).then(function (element) {
				element.findElements(By.className('tag folder')).then(function (elements) {
					terminateIndetRequest(elements.length);
					elements.forEach(function (element) {
						element.getAttribute('innerHTML').then(function (html) {
                           
							post.folders.push(html);
                           console.log(post);
							terminateRequest();
						});
					});
				});
			}).thenCatch(function (e) {
                 console.log("No folders for "+i);
				terminateIndetRequest(0);
			});
			crawl(i+1);
		}).then(function (alert) {
			// Nothing to see here
			if (alert) { alert.accept(); }
			crawl(i+1);
		});
	});
}