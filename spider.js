var http = require('request');
var _ = require('lodash');
var cheerio = require('cheerio');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('yyets.db');
var fs = require('fs');
var async = require('async');




var sql = fs.readFileSync("./init.sql", "utf8");
db.exec(sql);

var config = fs.readFileSync("./config.json","utf8");
config = JSON.parse(config);


var url =  'http://www.yyets.com/resource/';
var task = [];

for(var i=0;i<config.count;i++){
	task.push(url+parseInt(config.start+i));
}
async.eachLimit(task,5,spider,function(err){
	console.log('all done');
});




// spider(url+i);

function removeEle(ele){
	ele.find('span').remove();
	ele.find('font').remove();
	ele.find('strong').remove();
}

function parseLink(page,filmId){
	var lis = page.find(".resod_list li");
	lis.each(function(){
		var _this = cheerio(this);
		var linkType = _this.find('.lks-0').text() || '';
		if(linkType == '游戏'){return true;}
		var link = _this.find(".lks-1>a").text() || '';
		var filmSize = _this.find(".lks-2").text() || '';
		var sql = "insert into films_link (filmId,link,linkType,filmSize) values (?,?,?,?)";

		async.waterfall([function(cb){
			db.run(sql,[filmId,link,linkType,filmSize],function(){
				cb(null,this.lastID);
			});
		},function(filmsLinkId,cb){
			sql = "insert into films_link_address (filmsLinkId,filmId,link,linkType) values (?,?,?,?)";
			var download = _this.find(".download a");
			download.each(function(){
				var _this = cheerio(this);
				linkType = _this.text();
				if(linkType == '字幕')return true;
				if(linkType == '电驴' || linkType == '免费盘'){
					link = _this.attr('href');
				}else if(linkType == '迅雷'){
					link = _this.attr('thunderhref');
				}else if(linkType == '旋风'){
					link = _this.attr('qhref');
				}else if(linkType == '小米'){
					link = _this.attr('xmhref');
				}
				db.run(sql,[filmsLinkId,filmId,link,linkType]);
			});
		}]);
		// db.run(sql,[filmId,link,linkType,filmSize],function(){
		// 	sql = "insert into films_link_address (filmsLinkId,filmId,link,linkType) values (?,?,?,?)";
		// 	var download = _this.find(".download a");
		// 	var filmsLinkId = this.lastID;
		// 	download.each(function(){
		// 		var _this = cheerio(this);
		// 		linkType = _this.text();
		// 		if(linkType == '字幕')return true;
		// 		if(linkType == '电驴' || linkType == '免费盘'){
		// 			link = _this.attr('href');
		// 		}else if(linkType == '迅雷'){
		// 			link = _this.attr('thunderhref');
		// 		}else if(linkType == '旋风'){
		// 			link = _this.attr('qhref');
		// 		}else if(linkType == '小米'){
		// 			link = _this.attr('xmhref');
		// 		}
		// 		db.run(sql,[filmsLinkId,filmId,link,linkType]);
		// 	});

		// });
	});
}


function spider(url,cb){
	http.get(url,function(error,response,body){
		var $;
		try{
			$ = cheerio.load(body);
		}catch(e){
			console.error('error at url:',url,'error msg is:',e);
			cb();
			return;
		}
		if($("#tipsMsg").text() == '资源不存在.页面将于3秒内自动跳转.'){
			console.log('not exist at url:',url);
			cb();
			return;
		}
		var page = $(".AreaLL");
		var title = page.find("h2>strong").text() || '';

		var info = page.find(".r_d_info>li");

		//播出：
		var channel = info.eq(0).find('strong').text() || '';
		removeEle(info.eq(0));
		//类型
		var category = info.eq(0).text() || '';

		//地区
		var area = info.eq(1).find('strong').text() || '';
		removeEle(info.eq(1));
		//制作公司
		var productCompany = info.eq(1).text() || '';

		//语言
		var language = info.eq(2).find('strong').text() || '';
		removeEle(info.eq(2));
		//首播日期
		var firstTime = info.eq(2).text() || '';

		//英文名称
		var enName = info.eq(3).find('strong').text() || '';

		//别名
		removeEle(info.eq(4));
		var enOtherName = info.eq(4).text() || '';

		//官网
		var officalWebsite = info.eq(6).find('a').attr('href') || '';

		//描述
		var filmDesc = info.last().find('p').text() + info.eq(7).find("div").text() || '';
		var imgSrc = page.find('.f_l_img>a').eq(0).find('img').attr('src') || '';
		// var imgName = imgSrc.substring(imgSrc.lastIndexOf('/')+1,imgSrc.length);
		// if(imgSrc)http(imgSrc).pipe(fs.createWriteStream('./img/'+imgName));

		_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
		var sql = "insert into films (title,channel,category,area,productCompany,language,firstTime,enName,enOtherName,officalWebsite,filmDesc,imgSrc,link)  values (?,?,?,?,?,?,?,?,?,?,?,?,? )";

		async.waterfall([function(cb){
			db.run(sql,
				[title.trim(),channel.trim(),category.trim(),area.trim(),productCompany.trim(),language.trim(),firstTime.trim(),enName.trim(),enOtherName.trim(),officalWebsite.trim(),filmDesc.trim(),imgSrc,url],
				function(){
					cb(null,this.lastID);
			});
		},function(id,cb){
			parseLink(page,id);
			cb(null);
		}],function(){
			console.log('done ,url:',url);
			cb();
		});
		// db.run(sql,[title.trim(),channel.trim(),category.trim(),area.trim(),productCompany.trim(),language.trim(),firstTime.trim(),enName.trim(),enOtherName.trim(),officalWebsite.trim(),filmDesc.trim(),imgSrc,url],function(){
		// 		var id = this.lastID;
		// 		parseLink(page,this.lastID,cb);
		// 		console.log(url,' done!');
		// 	});
	});
}