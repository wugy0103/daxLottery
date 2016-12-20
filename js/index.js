/**
 * Created by wugy on 2016/12/19.
 */
$(function () {
    (function () {
        //背景图显示大小
        var setBackgroundSize = function () {
            var scale = $(window).width() / $(window).height();
            if (scale < 1.7777) {
                $('body').css('background-size', 'auto 100%');
            } else {
                $('body').css('background-size', '100% auto');
            }
        };
        //初始化
        var init = function () {

            $(window).resize(function () {
                setBackgroundSize();
            });

            var isChrome = window.navigator.userAgent.indexOf("Chrome") !== -1;
            if (!isChrome) {
                $("body").prepend('<div id="nohtml5"><div>由于您正在使用非chrome浏览器,大屏幕的体验处于不佳状态,建议您立刻更换浏览器,以获得更好的用户体验。<br/>下载浏览器:<a href="http://www.chromeliulanqi.com/" target="blank"><img src=" ' + $('#config>#FileWebHost').val() + '/ScreenTheme/default/images/chrome.jpg"> chrome浏览器</a></div></div>');
            }
            //模拟select
            $(".select").click(function (event) {
                event.stopPropagation();
                if (!$(this).parent().hasClass('disabled')) {
                    $(".select_option").slideUp();
                    if ($(this).next(".select_option").css("display") == "none") {
                        $(this).next(".select_option").css({
                            left: $(this).position().left,
                            top: $(this).position().top + 35
                        });
                        $(this).next(".select_option").slideDown("fast");
                    }
                    else {
                        $(this).next(".select_option").slideUp();
                    }
                }
                $(document).bind("click", function () {
                    $(".select_option").slideUp();
                });
            });


            //绑定开启活动按钮的点击事件
            $('#index>#code>a.clickBtn').on('click', function () {
                //移除活动准备开始界面
                $("#index").remove();

                //成操作按钮
                $('.moduleBtn').each(function (i, e) {
                    $('#btn_change').append($(e).html());
                });
                $('.moduleBtn').remove();

                //绑定模块操作按钮点击事件
                $('#btn_change>li:not([data-name="messagewalldanmu"])').on('click', function () {
                    var $this = $(this);
                    //触发当前激活模块变化事件
                    $('body').triggerHandler('modulechange', [$this.data('name')]);
                });

                //绑定所有操作按钮鼠标滑过事件
                $('#btn_change>li').hover(function () {
                    moduleCommon.showTips(this);
                }, function () {
                    moduleCommon.removeTips();
                });

                //显示操作按钮
                $('#btn_change').show();

                //在body上触发active事件
                $('body').triggerHandler('active');
                //在body上触发active事件
                $('body').triggerHandler('modulechange', [$('#btn_change>li:not(.btn_fullscreen):eq(0)').data('name')]);

            });

            $('body').on('modulechange', function (e, moduleName) {
                if (moduleName != 'qrcode') {
                    //隐藏二维码大图
                    $('#activityCode>#showCode').hide();
                }
                else {
                    //显示二维码大图
                    $('#activityCode>#showCode').show();
                }
            });
        };



    //    ---------------------------------------------------------------------------------
        var selfModuleName = 'slotmachine';
        //var moduleCommon = require('common');
        var fireWork = require('firework');
        var moduleID = $('[data-modulename=' + selfModuleName + ']').data('moduleid');
        var scrollTime = 500; //滚动速度
        var IntervalTimer = parseInt(Math.random() * 500);//间隔时间
        var scrollNumber = 5;//滚动列数,默认有5个
        var prizeID = 0; //奖品ID
        var prizeNumber = 10; //抽奖人数
        var isLotteryArray = []; //中奖用户
        var userArray = []; //用户列表
        var isLotteryScrollID = 0; //中奖名单滚动设置
        var sotpTime = 3000; //停止抽奖时间
        var prizeUserStr = '';
        var tigerUserLiWidth = 90;
        var tigerUserUlWidth = 830;
        var ulHeight = 250;
        var ulHeightHalf = 125;
        exports.init = function () {
            $('body').on('active', function () {
                $('#option_slotNumber a').click(function () {
                    selectLotteryNumber($(this));
                });
                $('body').on('click', '#tigerUserBox>ul>li>a', function () {
                    var dataLevel = $(this).parent().data('level');
                    $(this).parent().remove();
                    $('#option_slotPrize a[data-prizeid=' + dataLevel + '] label').html(parseInt($('#option_slotPrize a[data-prizeid=' + dataLevel + '] label').html()) + 1);
                    $('#tigerUserBox ul').width($('#tigerUserBox ul li').size() * tigerUserLiWidth);
                });
                $('.beginTiger').click(function () {
                    if (!$(this).hasClass('beginTiger_on')) {
                        beginTiger();
                    } else {
                        stopTiger();
                    }
                });
                $('.tiger_hidden').click(function () {
                    if ($(this).hasClass('on')) {
                        $('#tigerUser').show();
                        $(this).removeClass('on');
                    } else {
                        $('#tigerUser').hide();
                        $(this).addClass('on');
                    }
                });
                $('.tiger_submit').click(function () {
                    SubmitSlotMachineFans();
                });
                $('#tigerUser a.left').mousedown(function () {
                    isLotteryScrollID = Math.max(0, isLotteryScrollID - 1);
                    $('#tigerUserBox ul').stop().animate({'left': Math.min(0, -isLotteryScrollID * tigerUserUlWidth)});
                });
                $('#tigerUser a.right').click(function () {
                    isLotteryScrollID = Math.min(Math.ceil($("#tigerUserBox ul").width() / tigerUserUlWidth) - 1, isLotteryScrollID + 1);
                    $('#tigerUserBox ul').stop().animate({'left': -tigerUserUlWidth * isLotteryScrollID});

                });

            });
            $('body').on('modulechange', function (e, moduleName) {
                if (moduleName == selfModuleName) {
                    $('#slotmachine').show();
                    GetSlotMachineFans();
                    GetSlotMachinePrize();
                } else {
                    $('#slotmachine').hide();
                }
            });
        };

        //获取奖品信息
        var GetSlotMachinePrize = function () {
            $.extendGetJSON("/style/json/GetSlotMachinePrize.json", {}, function (data) {
                if (data.length > 0) {
                    $('#option_slotPrize').empty();
                    $(data).each(function (index, element) {
                        $('#option_slotPrize').append('<a data-prizeid="' + element.Id + '" data-prizename="' + element.Name + '" data-amount="' + element.Count + '"><div>' + element.Name + '</div> <span>剩<label>' + element.Count + '</label>名</span></a>');
                    });
                }
                $('#option_slotPrize a').click(function () {
                    selectPrize($(this));
                });
            }, function () {
                moduleCommon.showInfo("加载失败,请重试!");
                moduleCommon.loaded();
            });
        };
        //获取用户
        var GetSlotMachineFans = function () {
            moduleCommon.loading('数据加载中,请稍后');
            userArray = [];
            $('#tigerUserBox ul').html('');
            $.extendGetJSON("/style/json/GetSlotMachineFans.json", {}, function (data) {
                if (data.length > 0) {
                    userArray = data;
                    setScrollDiv();
                }

                moduleCommon.loaded();
            }, function () {
                luckUl.html("");
                moduleCommon.showInfo("加载失败,请重试!");
                moduleCommon.loaded();
            });
        }

        //初始化滚动界面
        var setScrollDiv = function () {
            if (prizeNumber <= 5) {  //设置要出现的列数
                scrollNumber = prizeNumber;
                $('.tigerMain').addClass('oneTiger');
            } else {
                $('.tigerMain').removeClass('oneTiger');
                scrollNumber = Math.ceil(prizeNumber / 2);
            }

            if (userArray.length <= 5 && prizeNumber > userArray.length) {
                scrollNumber = userArray.length;
                $('.tigerMain').addClass('oneTiger');
            }

            $('.tigerMain').html('');   //添加列
            for (var i = 0; i < scrollNumber; i++) {
                $('.tigerMain').append('<div class="tigerList"><div><ul></ul></div></div>');
            }
            if (prizeNumber > 5 && prizeNumber < 10) {
                $('.tigerList').each(function () {
                    if ($(this).index() > prizeNumber - scrollNumber - 1) {
                        $(this).addClass('oneUser');
                    }
                });
            }

            var maxNumber = 0;
            for (var i = 0; i < userArray.length; i++) { //把用户列表装入列
                if (maxNumber == scrollNumber) {
                    maxNumber = 0;
                }
                $('.tigerList').eq(maxNumber).find('ul').append('<li data-headpath="' + userArray[i].HeadPath + '" data-userid="' + userArray[i].Id + '" data-nickname="' + userArray[i].NickName + '" data-headpath="' + userArray[i].HeadPath + '"><img onError="imgError(this)" src="' + userArray[i].Head + '"/></li>');
                maxNumber++;
            }

            $('.tigerList').each(function () {  //复制列表，循环滚动
                var ul = $($(this).find('ul'));
                if (ul.children().size() > 1) {
                    ul.append(ul.html());
                    ul.css('top', -ul.height() + ulHeight + 'px');
                } else {
                    ul.css('top', '0');
                }
            });
        };

        //开始摇奖
        var beginTiger = function () {
            prizeUserStr = '';
            if (prizeID == 0) {
                moduleCommon.showInfo("请选择奖项!");
                return false;
            }
            if (prizeNumber > userArray.length) {
                moduleCommon.showInfo("抽奖人数不够!");
                return false;
            }
            if (prizeNumber == 0) {
                moduleCommon.showInfo("已经没有奖品了!");
                return false;
            }
            if (prizeNumber > $('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html()) {
                moduleCommon.showInfo("奖品数量不够哒!");
                return false;
            }
            $('.beginTiger').html('停止抽奖').addClass('beginTiger_on');
            $('.tigerList').each(function (i) {
                var ulBox = $(this).find('ul');
                var _height = ulBox.children().size() * ulHeightHalf;
                ulBox.height(_height);
                if (ulBox.children().size() > 2) { //本列人数大于2的时候才滚动
                    setTimeout(function () {
                        beginScroll(ulBox, _height, scrollTime * (scrollNumber / 2));
                    }, IntervalTimer * i);
                } else if (ulBox.children().size() == 0) { //本列人数等于0的时候移除
                    ulBox.parent().remove();
                }
            });
        };

        //滚动
        var beginScroll = function (obj, height, timer) {
            obj.animate({'top': -height / 2 + ulHeightHalf + 'px'}, timer, 'linear', function () {
                obj.css('top', -(height - ulHeight) + 'px');
                beginScroll(obj, height, timer);
            });
        };

        var stopTiger = function () {
            $('.beginTiger').html('开始抽奖').removeClass('beginTiger_on');
            isLotteryArray = [];
            var allNumber = 0;
            $('.tigerList').each(function (i) {
                var ulBox = $(this).find('ul');
                var _height = ulBox.height();
                setTimeout(function () {
                    ulBox.stop();
                    var _top = Math.ceil(parseInt(ulBox.css('top')) / ulHeightHalf) * ulHeightHalf; //向上取整，让它滚动到正确位置;
                    ulBox.animate({'top': _top}, function () {
                        var userID; //中奖人信息
                        var userHead;
                        var userHeadPath;
                        var userNickName;
                        //根据不同的状态获取中奖人，1：只有一行，2：两行满的，3：一行两行都有
                        if ($('.oneTiger').size() > 0) {
                            ulBox.children('li').each(function () {
                                if ($(this).position().top == -_top) {
                                    userID = $(this).data('userid')
                                    userHead = $(this).html();
                                    userNickName = $(this).data('nickname');
                                    userHeadPath = $(this).data('headpath')
                                    isLotteryArray.push(userID);
                                    prizeUserStr += '<li data-level="' + prizeID + '" data-headpath="' + userHeadPath + '" data-nickname="' + userNickName + '" data-isluck="' + userID + '">' + userHead + '<span>' + userNickName + '</span></li>';
                                    $('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html(parseInt($('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html()) - 1);
                                }
                            });
                        } else {
                            ulBox.children('li').each(function () {
                                if (ulBox.parent().parent().hasClass('oneUser')) {
                                    if ($(this).position().top == -_top) {  //本列只中一个人
                                        userID = $(this).data('userid')
                                        userHead = $(this).html();
                                        userHeadPath = $(this).data('headpath');
                                        userNickName = $(this).data('nickname');
                                        isLotteryArray.push(userID);
                                        prizeUserStr += '<li data-level="' + prizeID + '" data-headpath="' + userHeadPath + '" data-nickname="' + userNickName + '" data-isluck="' + userID + '">' + userHead + '<span>' + userNickName + '</span></li>';
                                        $('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html(parseInt($('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html()) - 1);
                                    }
                                } else {
                                    if ($(this).position().top == -_top || $(this).position().top == -_top + ulHeightHalf) { //本列中两个人
                                        userID = $(this).data('userid')
                                        userHead = $(this).html();
                                        userHeadPath = $(this).data('headpath');
                                        userNickName = $(this).data('nickname');
                                        isLotteryArray.push(userID);
                                        prizeUserStr += '<li data-level="' + prizeID + '" data-headpath="' + userHeadPath + '" data-nickname="' + userNickName + '" data-isluck="' + userID + '">' + userHead + '<span>' + userNickName + '</span></li>';
                                        $('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html(parseInt($('#option_slotPrize a[data-prizeid=' + prizeID + ']').find('label').html()) - 1);
                                    }
                                }
                            });
                        }
                        isLotteryScrollID = 0;
                        allNumber++;
                        if (allNumber == $('.tigerList').size()) {
                            $('.beginTiger').removeClass('beginTiger_on'); //改变摇杆样式
                            showLuckAnimate();
                        }
                    });
                }, IntervalTimer * (i + 3));
            });
        };

        //提交中奖名单
        var SubmitSlotMachineFans = function () {
            var submitCount = $("#tigerUserBox li[data-hasluck!=1]").size();
            if ($("#tigerUserBox li[data-hasluck!=1]").size() == 0) {
                moduleCommon.showInfo('还没有中奖人');
                return false;
            }
            moduleCommon.loading("正在提交，请稍后");
            var submitForm = $('<form/>');
            $("#tigerUserBox li[data-hasluck!=1]").each(function (index, element) {
                submitForm.append('<input name="[' + index + '].PrizeId" type="hidden" value="' + $(element).data('level') + '" />');
                submitForm.append('<input name="[' + index + '].FansId" type="hidden" value="' + $(element).data('isluck') + '" />');
                submitForm.append('<input name="[' + index + '].FansNickName" type="hidden" value="' + $(element).data('nickname') + '" />');
                submitForm.append('<input name="[' + index + '].FansHead" type="hidden" value="' + $(element).data('headpath') + '" />');
            });
            $.extendPost(moduleCommon.httpURL + $("#SubmitSlotMachineFans").val() + '?moduleId=' + moduleID, submitForm.serializeArray(), "json", function (data) {
                moduleCommon.loaded();
                if (data.ResultType == 1) {
                    moduleCommon.showInfo("提交成功", 1);
                    $("#tigerUserBox li[data-hasluck!=1]").attr('data-hasluck', 1);
                } else {
                    moduleCommon.showInfo(data.Message);
                }
            });
        }
        //模拟select效果
        var selectPrize = function (v) {
            $(v).parent().prev().find("a").html($(v).find("div").html());
            $(v).parent().prev().find("a").attr({
                "data-prizeid": $(v).data("prizeid"),
                "data-amount": $(v).data("amount")
            });
            $(v).parent().siblings(".select_option").find(".newNumber").remove();
            prizeID = $(v).data('prizeid');
            var _num = $(v).find("label").html();
            $(v).parent().next(".select").find("a").attr("data-number", Math.min(10, _num)).html(Math.min(10, _num));
            prizeNumber = Math.min(10, _num);
            if (prizeNumber > 0) {
                setScrollDiv();
            }
            $(v).parent().siblings(".select_option").find("a").each(function (index, element) {
                if ($(this).data("number") > _num) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
        var selectLotteryNumber = function (v) {
            $(v).parent().prev().find("a").html($(v).find("div").html());
            $(v).parent().prev().find("a").attr({"data-number": $(v).data("number")});
            prizeNumber = $(v).data("number");
            setScrollDiv();
        }

        //显示抽奖动画
        var showLuckAnimate = function () {
            fireWork.show();
            var className = '';
            $('body').append('<div class="light"></div>');
            if (prizeNumber <= 3) {
                className = 'bigImg';
            } else if (prizeNumber > 3 && prizeNumber < 7) {
                className = 'normalImg';
            }
            $('body').append('<div id="showPrizeUser"><ul class="' + className + '">' + prizeUserStr + '</ul></div>');
            $('#showPrizeUser li').each(function () {
                $('body').append('<div data-level="' + $(this).data('level') + '" data-headpath="' + $(this).data('headpath') + '" data-nickname="' + $(this).data('nickname') + '" data-isluck="' + $(this).data('isluck') + '" style="left:' + $(this).offset().left + 'px;top:' + $(this).offset().top + 'px" class="tigerUser ' + className + '">' + $(this).html() + '</div>');
                $(this).css('opacity', 0);
            });
            $("#slotmachineFlash").css('opacity', 1).show();
            var _left = $('#tigerUserBox').offset().left;
            var _top = $('#tigerUserBox').offset().top;
            setTimeout(function () {
                $('.tigerUser').each(function (index) {
                    var _this = $(this);
                    setTimeout(function () {
                        _this.animate({
                            'left': _left + 'px',
                            'top': _top + 'px',
                            'width': '70px',
                            'height': '70px'
                        }, 'slow', function () {
                            $('#tigerUserBox ul').prepend('<li data-level="' + _this.data('level') + '" data-headpath="' + _this.data('headpath') + '" data-nickname="' + _this.data('nickname') + '" data-isluck="' + _this.data('isluck') + '" >' + _this.html() + '<a>x</a></li>');
                            $('#tigerUserBox ul').width($('#tigerUserBox ul li').size() * tigerUserLiWidth).css('left', 0);
                            _this.remove();
                        });
                    }, index * 100);
                });
            }, 2500);
            setTimeout(function () {
                fireWork.hide();
                $(".light").animate({"opacity": "0"}, "slow", function () {
                    $(".light").remove();
                });
                $('#showPrizeUser').animate({'opacity': '0'}, 'slow', function () {
                    $('#showPrizeUser').remove();
                });
            }, 3000);
            if (isLotteryArray.length > 0) { //移除已中奖人
                for (var i = 0; i < isLotteryArray.length; i++) {
                    $('.tigerMain li[data-userid=' + isLotteryArray[i] + ']').remove();
                    for (var j = 0; j < userArray.length; j++) {
                        if (isLotteryArray[i] == userArray[j].Id) {
                            userArray.splice(j, 1);
                        }
                    }
                }
            }
            setScrollDiv();
        }
    })()
})