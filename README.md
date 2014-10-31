yyets
=====

yyets's spider


http://www.yyets.com/
影视资源要关闭了,写了个小爬虫爬下资源,基于nodejs练手.


使用
=====

1. `mkdir img`
2. `npm install`
3. `vi config.json` 修改max,定义爬虫爬多少部电影,默认从id为20002爬起.
4. `node spider.js`
5. 生成的图片在img目录下,当前目录生成的yyets.sqlite为sqlite3数据库.表定义查看init.sql

changlog
=====

version:0.0.2
1. 修复了次数过多时导致的out of memory.
2. 采用node-async模块来异步执行.