apiready= function () {
    var store= {
        hintInfoList: [
            '长按说话，松开搜索', '时间太短啦', '请讲话，我在听', '没办法识别，再试试', '正在解读'
        ],
        recoginzeStatus: false,
        speechRecognizer: api.require('speechRecognizer')
    };
    var doc= new Vue({
        el: 'body',
        data: {
            hintTittle: store.hintInfoList[0],
            showLoading: false
        },
        compiled: function(){
            api.setFullScreen({
                fullScreen: true
            });
        },
        events: {
        },
        methods: {
            tapMic: function (e) {
                this.hintTittle= store.hintInfoList[1];
            },
            longPressUpMic: function () {
                this.hintTittle= store.hintInfoList[3];
            },
            panMic: function () {
                this.hintTittle= store.hintInfoList[0];
            },
            closeFrm: function () {
                api.setFullScreen({
                    fullScreen: false
                });
                api.closeFrame({
                    name: api.frameName
                });
            },
            startRecord: function () {
                this.hintTittle= store.hintInfoList[2];
                store.recoginzeStatus= true;
                store.speechRecognizer.record({
                    vadbos:5000,
                    vadeos:5000,
                    rate:16000,
                    asrptt:0
                    // audioPath:'fs://speechRecogniser/speech.mp3'
                }, this.showRecoRs);
            },
            showRecoRs: function(ret,err){
                store.recoginzeStatus= false;
                this.showLoading= false;
                store.speechRecognizer.stopRecord();
                if(ret.status){
                    var rTxt= ret.wordStr;
                    if(rTxt && rTxt!=''){
                        this.hintTittle= ret.wordStr;
                    }else{
                        this.hintTittle= store.hintInfoList[3];
                    }
                } else {
                    this.hintTittle= err.msg;
                }
            },
            finishRecord: function () {
                if(store.recoginzeStatus){
                    this.showLoading= true;
                    this.hintTittle= store.hintInfoList[4];
                }else{
                    this.hintTittle= store.hintInfoList[0];
                    store.speechRecognizer.stopRecord();
                }
            }
        }
    });
};
