apiready= function () {
    var doc= new Vue({
        el: 'body',
        data: {
            dataList: [],
            connStatus: {
                isConn: false,
                loadFinish: false
            },
            pageCond: {
                start: 1,
                len: 20
            },
            bottomBarTxt: '加载中',
            showBottomBar: {
                showBar: false,
                showIcon: false
            }
        },
        compiled: function(){
            this.loadData(this.pageCond.start, this.pageCond.len);
        },
        events: {
            bottomLoadStart: function () {
                this.scrollBottom();
            },
            bottomLoadDone: function (rowNum) {
                if(rowNum<this.pageCond.len){
                    this.setBottomBar('finish');
                }else{
                    this.setBottomBar('hide');
                }
            },
            refreshLoadStart: function () {
                this.refreshData();
            },
            refreshLoadDone: function () {
                api.refreshHeaderLoadDone();
            }
        },
        methods: {
            loadData: function (start, len, doneEvName) {
                start= start || 0;
                len= len || 20;

                if(this.connStatus.isConn){
                    return ;
                }else{
                    this.connStatus.isConn= true;
                }

                var reqUrl= [
                    'http://app.jiupaicn.com/indexapp.php?m=content&c=wap&a=lists&json[secCode]=&json[reqType]=cnl',
                    '&json[channelId]=sypd',
                    '&json[columnId]=',
                    '&json[refreshId]=',
                    '&json[refreshDrec]=flip',//refresh
                    '&json[startRowNum]=', start,
                    '&json[pageRowLength]=', len,
                    '&json[orderBy]=pubDate&json[orderAsc]=desc&rdnum=', Math.random()
                ];

                api.ajax({
                    url: reqUrl.join(''),
                    method: 'get',
                    timeout: 50,
                    dataType: 'json',
                    returnAll: false
                }, function (ret, err){
                    // api.alert({
                    //     msg: ret
                    // });
                    if(ret && ret.txtCont instanceof Array){
                        doc.dataList= start==1? ret.txtCont: doc.dataList.concat(ret.txtCont);

                        if(doneEvName && doneEvName!==''){
                            doc.$emit(doneEvName, ret.txtCont.length);
                        }
                    }else if(ret && ret.txtCont==null){
                        if(doneEvName && doneEvName!==''){
                            doc.$emit(doneEvName, 0);
                        }
                    }else{
                        api.toast({
                            msg: err,
                            duration: 2000,
                            location: 'middle'
                        });
                    }
                    doc.connStatus.isConn= false;
                });
            },
            scrollBottom: function(){
                if(this.connStatus.loadFinish=== false && this.connStatus.isConn=== false){

                    this.setBottomBar('loading');
                    this.pageCond.start += this.pageCond.len;
                    this.loadData(this.pageCond.start, this.pageCond.len, 'bottomLoadDone');
                }
            },
            setBottomBar: function(barStatus){
                if(barStatus=='finish'){
                    this.connStatus.loadFinish= true;
                    this.bottomBarTxt= '没有更多信息了';
                    this.showBottomBar.showIcon= false;
                    this.showBottomBar.showBar= true;
                }else if(barStatus=='loading'){
                    this.showBottomBar.showIcon= true;
                    this.showBottomBar.showBar= true;
                }else{
                    this.showBottomBar.showBar= false;
                    this.showBottomBar.showIcon= false;
                }
            },
            refreshData: function () {
                this.pageCond.start= 1;
                this.loadData(this.pageCond.start, this.pageCond.len, 'refreshLoadDone');
            }
        }
    });

    api.setRefreshHeaderInfo({
        visible: true,
        // loadingImg: 'widget://image/refresh.png',
        bgColor: '#f7f7f9',
        textColor: '#999',
        textDown: '下拉刷新...',
        textUp: '松开刷新...',
        showTime: true
    }, function(ret, err){
        doc.$emit('refreshLoadStart');
    });

    api.addEventListener({
        name:'scrolltobottom',
        extra:{ threshold:100}
    }, function(ret, err){
        if(api.systemType=='ios'){
            setTimeout(function () {
                doc.$emit('bottomLoadStart');
            }, 300);
        }else{
            doc.$emit('bottomLoadStart');
        }
    });
};