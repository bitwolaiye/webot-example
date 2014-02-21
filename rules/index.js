var crypto = require('crypto');

var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');

var _ = require('underscore')._;
var search = require('../lib/support').search;
var geo2loc = require('../lib/support').geo2loc;

var package_info = require('../package.json');

var base_url = 'http://107.170.45.79';

/**
 * 初始化路由规则
 */
module.exports = exports = function (webot) {

    webot.set('subscribe', {
        pattern: function(info) {
            return info.is('event') && info.param.event === 'subscribe';
        },
        handler: function(info) {
            return "欢迎关注好运三亚服务号";
        }
    });

    webot.set('click', {
        pattern: function(info) {
            return info.is('event') && info.param.event === 'click';
        },
        handler: function(info) {
            if (info.param.eventKey === "NEWS_OPEN_20140118"){
                return [{
                    title: '"好运三亚”游戏大厅盛大开业',
                    pic: base_url + '/images/wechat/logo.jpg',
                    url: base_url + '',
                    description: '首家“好运三亚”游戏大厅（大东海店）于2014年1月18日盛大开业。' +
                        '该游戏大厅位于三亚市榆亚路林达海景酒店3层，地处三亚湾核心区域，正对大东海广场，厅内面积1500平方米，' +
                        '布置百余台视频游戏终端机供参与者体验，开业初期营业时间为14:00-23:00（2014年1月31日-2月2日休息）。'
                },{
                    title: '“好运三亚”游戏介绍',
                    pic: base_url + '/images/wechat/game_1_1.jpg',
                    url: base_url + '/xiuxian.html',
                    description: '“好运三亚”旅游娱乐游戏是遵照国务院和海南省关于海南国际旅游岛建设相关政策精神，' +
                        '以丰富三亚旅游文化要素、带动三亚旅游新业态发展、拉动三亚旅游消费，促进三亚旅游市场淡旺季平衡、' +
                        '探索适合三亚特色的旅游营销新模式和旅游相关现代服务业转型升级新途径为宗旨，本着“先行先试”方针而开发，' +
                        '经行业主管部门许可合法经营的健康娱乐项目。'
                }];
            }else{
                return 'Thank you.';
            }
        }
    });

    var reg_help = /^(help|\?|Help|？)$/i
    webot.set({
        // name 和 description 都不是必须的
        name: 'hello help',
        description: '获取使用帮助，发送 help',
        pattern: function (info) {
            //首次关注时,会收到subscribe event
            return info.is('event') && info.param.event === 'subscribe' || reg_help.test(info.text);
        },
        handler: function (info) {
            var reply = {
                title: '感谢你关注好运三亚!',
                pic: base_url + '/images/wechat/logo.jpg',
                url: base_url,
                description: [
                    '你可以试试以下指令:',
                    'game : 查看游戏介绍',
                    'where : 查看游戏厅位置',
                    '重看请回复help或?',
                    '更多指令请回复more'
                ].join('\n')
            };
            // 返回值如果是list，则回复图文消息列表
            return reply;
        }
    });

    // 更简单地设置一条规则
    webot.set(/^m|More$/i, function (info) {
        var reply = _.chain(webot.gets()).filter(function (rule) {
            return rule.description;
        }).map(function (rule) {
                //console.log(rule.name)
                return '> ' + rule.description;
            }).join('\n').value();

        return '好运三亚欢迎您:\n' + reply;
    });


    webot.set('where', {
        description: '想知道怎么去吗? 发送: where',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /where|在哪|地点\?]+/i,
        handler: function (info){
            var reply = {
                title: '欢迎您来好运三亚!',
                pic: base_url + '/images/wechat/where.jpg',
                url: base_url + '/lx.html',
                description: '详细地址:\n' +
                    '三亚市大东海榆亚大道林达海景酒店3层'
            };
            return reply;
        }
    });

    webot.set('who_are_you', {
        description: '想知道我是谁吗? 发送: who',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /who|你是[谁\?]+/i,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['我是好运三亚客服.', '好运三亚客服为您服务!']
    });

    // 正则匹配后的匹配组存在 info.query 中
    webot.set('your_name', {
//        description: '自我介绍下吧, 发送: I am [enter_your_name]',
        pattern: /^(?:my name is|i am|我(?:的名字)?(?:是|叫)?)\s*(.*)$/i,

        // handler: function(info, action){
        //   return '你好,' + info.param[1]
        // }
        // 或者更简单一点
        handler: '你好,{1}'
    });

    // 简单的纯文本对话，可以用单独的 yaml 文件来定义
    require('js-yaml');
    webot.dialog(__dirname + '/dialog.yaml');



    var game_list_desc = '"好运三亚"游戏是针对三亚旅游人群和本地居民特别开发的大众型娱乐游戏。\n' +
        '它充分借鉴国内外竞猜游戏和彩票的先进理念与成功经验，紧密融合三亚的旅游元素，注重参与者的娱乐体验，游戏设计比肩国际，' +
        '旨在打造旅游娱乐游戏新概念。\n' +
        '首期投入运营的游戏产品包括：\n' +
        '1 - 电子即开娱乐类游戏\n' +
        '2 - 电子桌面互动类游戏\n' +
        '3 - 体育赛事竞猜类游戏';
    var game_1_1 = {
        title: '一件倾心',
        pic: base_url + '/images/wechat/game_1_1.jpg',
        url: base_url + '/xiuxian_yjqx.html',
        description: '一件倾心游戏介绍...balabala....\n' +
            '1 - 返回电子即开娱乐类游戏\n' +
            '0 - 返回所有游戏'
    };
    var game_1_2 = {
        title: '看我72变',
        pic: base_url + '/images/wechat/game_1_2.jpg',
        url: base_url + '/xiuxian_72bian.html',
        description: '看我72变游戏介绍...balabala....\n' +
            '1 - 返回电子即开娱乐类游戏\n' +
            '0 - 返回所有游戏'
    };
    var game_1_3 = {
        title: '缤纷假日',
        pic: base_url + '/images/wechat/game_1_3.jpg',
        url: base_url + '/xiuxian_binfen.html',
        description: '缤纷假日游戏介绍...balabala....\n' +
            '1 - 返回电子即开娱乐类游戏\n' +
            '0 - 返回所有游戏'
    };
    // 介绍游戏
    webot.set({
        description: '想好运三亚有那些游戏吧, 发送: game',
        pattern: /^g|Game$/i,
        handler: function (info) {
            info.wait('game_list');
            return game_list_desc;
        }
    });
    webot.waitRule('game_list', {
        '1': function (info){
            info.wait('game_1');
            return '好运三亚电子即开娱乐类游戏包括:\n' +
                '1 - 一件倾心\n' +
                '2 - 看我72变\n' +
                '3 - 缤纷假日';
        },
        '2': function (info) {
//            info.wait('game_2');
            return '敬请期待...';
        },
        '3': function (info) {
//            info.wait('game_3');
            return '敬请期待...';
        }
    });
    webot.waitRule('game_1', {
        '1': function (info) {
            info.wait('return_game_1');
            return game_1_1;
        },
        '2': function (info) {
            info.wait('return_game_1');
            return game_1_2;
        },
        '3': function (info) {
            info.wait('return_game_1');
            return game_1_3;
        }
    });
    webot.waitRule('return_game_1', {
        '1' : function (info) {
            if (info.text) {
                info.wait('game_1')
                return '好运三亚电子即开娱乐类游戏包括:\n' +
                    '1 - 一件倾心\n' +
                    '2 - 看我72变\n' +
                    '3 - 缤纷假日';
            }
        },
        '0' : function (info) {
            if (info.text) {
                info.wait('game_list')
                return game_list_desc;
            }
        }
    });

//  // 支持一次性加多个（方便后台数据库存储规则）
//  webot.set([{
//    name: 'morning',
//    description: '打个招呼吧, 发送: good morning',
//    pattern: /^(早上?好?|(good )?moring)[啊\!！\.。]*$/i,
//    handler: function(info){
//      var d = new Date();
//      var h = d.getHours();
//      if (h < 3) return '[嘘] 我这边还是深夜呢，别吵着大家了';
//      if (h < 5) return '这才几点钟啊，您就醒了？';
//      if (h < 7) return '早啊官人！您可起得真早呐~ 给你请安了！\n 今天想参加点什么活动呢？';
//      if (h < 9) return 'Morning, sir! 新的一天又开始了！您今天心情怎么样？';
//      if (h < 12) return '这都几点了，还早啊...';
//      if (h < 14) return '人家中午饭都吃过了，还早呐？';
//      if (h < 17) return '如此美好的下午，是很适合出门逛逛的';
//      if (h < 21) return '早，什么早？找碴的找？';
//      if (h >= 21) return '您还是早点睡吧...';
//    }
//  }, {
//    name: 'time',
//    description: '想知道几点吗? 发送: time',
//    pattern: /^(几点了|time)\??$/i,
//    handler: function(info) {
//      var d = new Date();
//      var h = d.getHours();
//      var t = '现在是服务器时间' + h + '点' + d.getMinutes() + '分';
//      if (h < 4 || h > 22) return t + '，夜深了，早点睡吧 [月亮]';
//      if (h < 6) return t + '，您还是再多睡会儿吧';
//      if (h < 9) return t + '，又是一个美好的清晨呢，今天准备去哪里玩呢？';
//      if (h < 12) return t + '，一日之计在于晨，今天要做的事情安排好了吗？';
//      if (h < 15) return t + '，午后的冬日是否特别动人？';
//      if (h < 19) return t + '，又是一个充满活力的下午！今天你的任务完成了吗？';
//      if (h <= 22) return t + '，这样一个美好的夜晚，有没有去看什么演出？';
//      return t;
//    }
//  }]);

//  // 等待下一次回复
//  webot.set('guess my sex', {
//    pattern: /是男.还是女.|你.*男的女的/,
//    handler: '你猜猜看呐',
//    replies: {
//      '/女|girl/i': '人家才不是女人呢',
//      '/男|boy/i': '是的，我就是翩翩公子一枚',
//      'both|不男不女': '你丫才不男不女呢',
//      '不猜': '好的，再见',
//      // 请谨慎使用通配符
//      '/.*/': function reguess(info) {
//        if (info.rewaitCount < 2) {
//          info.rewait();
//          return '你到底还猜不猜嘛！';
//        }
//        return '看来你真的不想猜啊';
//      }
//    }

    // 也可以用一个函数搞定:
    // replies: function(info){
    //   return 'haha, I wont tell you'
    // }

    // 也可以是数组格式，每个元素为一条rule
    // replies: [{
    //   pattern: '/^g(irl)?\\??$/i',
    //   handler: '猜错'
    // },{
    //   pattern: '/^b(oy)?\\??$/i',
    //   handler: '猜对了'
    // },{
    //   pattern: 'both',
    //   handler: '对你无语...'
    // }]
//  });

//  // 定义一个 wait rule
//  webot.waitRule('wait_guess', function(info) {
//    var r = Number(info.text);
//
//    // 用户不想玩了...
//    if (isNaN(r)) {
//      info.resolve();
//      return null;
//    }
//
//    var num = info.session.guess_answer;
//
//    if (r === num) {
//      return '你真聪明!';
//    }
//
//    var rewaitCount = info.session.rewait_count || 0;
//    if (rewaitCount >= 2) {
//      return '怎么这样都猜不出来！答案是 ' + num + ' 啊！';
//    }
//
//    //重试
//    info.rewait();
//    return (r > num ? '大了': '小了') +',还有' + (2 - rewaitCount) + '次机会,再猜.';
//  });
//
//  webot.set('guess number', {
//    description: '发送: game , 玩玩猜数字的游戏吧',
//    pattern: /(?:game|玩?游戏)\s*(\d*)/,
//    handler: function(info){
//      //等待下一次回复
//      var num = Number(info.param[1]) || _.random(1,9);
//
//      verbose('answer is: ' + num);
//
//      info.session.guess_answer = num;
//
//      info.wait('wait_guess');
//      return '玩玩猜数字的游戏吧, 1~9,选一个';
//    }
//  });

//  webot.waitRule('wait_suggest_keyword', function(info, next){
//    if (!info.text) {
//      return next();
//    }
//
//    // 按照定义规则的 name 获取其他 handler
//    var rule_search = webot.get('search');
//
//    // 用户回复回来的消息
//    if (info.text.match(/^(好|要|y)$/i)) {
//      // 修改回复消息的匹配文本，传入搜索命令执行
//      info.param[0] = 's nodejs';
//      info.param[1] = 'nodejs';
//
//      // 执行某条规则
//      webot.exec(info, rule_search, next);
//      // 也可以调用 rule 的 exec 方法
//      // rule_search.exec(info, next);
//    } else {
//      info.param[1] = info.session.last_search_word;
//      // 或者直接调用 handler :
//      rule_search.handler(info, next);
//      // 甚至直接用命名好的 function name 来调用：
//      // do_search(info, next);
//    }
//    // remember to clean your session object.
//    delete info.session.last_search_word;
//  });
//  // 调用已有的action
//  webot.set('suggest keyword', {
//    description: '发送: s nde ,然后再回复Y或其他',
//    pattern: /^(?:搜索?|search|s\b)\s*(.+)/i,
//    handler: function(info){
//      var q = info.param[1];
//      if (q === 'nde') {
//        info.session.last_search_word = q;
//        info.wait('wait_suggest_keyword');
//        return '你输入了:' + q + '，似乎拼写错误。要我帮你更改为「nodejs」并搜索吗?';
//      }
//    }
//  });
//
//  function do_search(info, next){
//    // pattern的解析结果将放在param里
//    var q = info.param[1];
//    log('searching: ', q);
//    // 从某个地方搜索到数据...
//    return search(q , next);
//  }
//
//  // 可以通过回调返回结果
//  webot.set('search', {
//    description: '发送: s 关键词 ',
//    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
//    //handler也可以是异步的
//    handler: do_search
//  });
//
//
//  webot.waitRule('wait_timeout', function(info) {
//    if (new Date().getTime() - info.session.wait_begin > 5000) {
//      delete info.session.wait_begin;
//      return '你的操作超时了,请重新输入';
//    } else {
//      return '你在规定时限里面输入了: ' + info.text;
//    }
//  });
//
//  // 超时处理
//  webot.set('timeout', {
//    description: '输入timeout, 等待5秒后回复,会提示超时',
//    pattern: 'timeout',
//    handler: function(info) {
//      info.session.wait_begin = new Date().getTime();
//      info.wait('wait_timeout');
//      return '请等待5秒后回复';
//    }
//  });

//  /**
//   * Wait rules as lists
//   *
//   * 实现类似电话客服的自动应答流程
//   *
//   */
//  webot.set(/^ok webot$/i, function(info) {
//    info.wait('list');
//    return '可用指令：\n' +
//           '1 - 查看程序信息\n' +
//           '2 - 进入名字选择';
//  });
//  webot.waitRule('list', {
//    '1': 'webot ' + package_info.version,
//    '2': function(info) {
//      info.wait('list-2');
//      return '请选择人名:\n' +
//             '1 - Marry\n' +
//             '2 - Jane\n' +
//             '3 - 自定义'
//    }
//  });
//  webot.waitRule('list-2', {
//    '1': '你选择了 Marry',
//    '2': '你选择了 Jane',
//    '3': function(info) {
//      info.wait('list-2-3');
//      return '请输入你想要的人';
//    }
//  });
//  webot.waitRule('list-2-3', function(info) {
//    if (info.text) {
//      return '你输入了 ' + info.text;
//    }
//  });


//  //支持location消息 此examples使用的是高德地图的API
//  //http://restapi.amap.com/rgeocode/simple?resType=json&encode=utf-8&range=3000&roadnum=0&crossnum=0&poinum=0&retvalue=1&sid=7001&region=113.24%2C23.08
//  webot.set('check_location', {
//    description: '发送你的经纬度,我会查询你的位置',
//    pattern: function(info){
//      return info.is('location');
//    },
//    handler: function(info, next){
//      geo2loc(info.param, function(err, location, data) {
//        location = location || info.label;
//        next(null, location ? '你正在' + location : '我不知道你在什么地方。');
//      });
//    }
//  });

//  //图片
//  webot.set('check_image', {
//    description: '发送图片,我将返回其hash值',
//    pattern: function(info){
//      return info.is('image');
//    },
//    handler: function(info, next){
//      verbose('image url: %s', info.param.picUrl);
//      try{
//        var shasum = crypto.createHash('md5');
//
//        var req = require('request')(info.param.picUrl);
//
//        req.on('data', function(data) {
//          shasum.update(data);
//        });
//        req.on('end', function() {
//          return next(null, '你的图片hash: ' + shasum.digest('hex'));
//        });
//      }catch(e){
//        error('Failed hashing image: %s', e)
//        return '生成图片hash失败: ' + e;
//      }
//    }
//  });

//  // 回复图文消息
//  webot.set('reply_news', {
//    description: '发送news,我将回复图文消息你',
//    pattern: /^news\s*(\d*)$/,
//    handler: function(info){
//      var reply = [
//        {title: '微信机器人', description: '微信机器人测试帐号：webot', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'https://github.com/node-webot/webot-example'},
//        {title: '豆瓣同城微信帐号', description: '豆瓣同城微信帐号二维码：douban-event', pic: 'http://i.imgur.com/ijE19.jpg', url: 'https://github.com/node-webot/weixin-robot'},
//        {title: '图文消息3', description: '图文消息描述3', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'http://www.baidu.com'}
//      ];
//      // 发送 "news 1" 时只回复一条图文消息
//      return Number(info.param[1]) == 1 ? reply[0] : reply;
//    }
//  });

    // 可以指定图文消息的映射关系
    webot.config.mapping = function (item, index, info) {
        //item.title = (index+1) + '> ' + item.title;
        return item;
    };

    //所有消息都无法匹配时的fallback
    webot.set(/.*/, function (info) {
        // 利用 error log 收集听不懂的消息，以利于接下来完善规则
        // 你也可以将这些 message 存入数据库
        log('unhandled message: %s', info.text);
        info.flag = true;
        return '你发送了「' + info.text + '」,可惜我太笨了,听不懂. 发送: help 查看可用的指令';
    });


};
