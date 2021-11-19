const express = require("express");
var request = require("request");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
const cors = require('cors');
global.document = document;
var $ = jQuery = require('jquery')(window);

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(cors());


app.get("/", (req, res) => {
  var data = new Object();
  const regex = /\t/g;
  const regex2 = /\n/g;
  const regex3 = /\r/g;
  const regex4 = /<li><dl>/g;
  const regex5 = /.</g;
	request({
		uri: "https://apiv2.corona-live.com/domestic-init.json"
	}, function(error, response, body) {
		var result = JSON.parse(body.toString());
		data.cases = result.stats.cases[0];
		data.deaths = result.stats.deaths[0];
		data.severe = result.stats.patientsWithSevereSymptons[0];
		data.newSevere = result.stats.patientsWithSevereSymptons[1];
		request({
			uri: "https://api.corona-19.kr/korea/beta/?serviceKey=5d4143bd958c16e18abe1acef5386c12d"
		}, function(error, response, body) {
			var result2 = JSON.parse(body.toString());
			data.updateTime = result2.API.updateTime.replace('코로나바이러스감염증-19 국내 발생현황 (', '').replace(')', '');
			data.cure = result2.korea.recCnt;
      data.newCases = result2.korea.incDec;
			data.localConfirmed = result2.korea.inDecK;
			data.abroadConfirmed = result2.korea.incDecF;

        request({
          uri: "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=11&ncvContSeq=&contSeq=&board_id=&gubun="
        }, function(error, response, body) {
          var result4 = body;
           //사망
           var dataIndex_d = result4.toString().indexOf('<strong class="ca_top">사망</strong>');
           var dataIndexEnd_d = result4.toString().indexOf('<strong class="ca_top">재원 위중증</strong>');
           var resPart_d = result4.toString().substring(dataIndex_d, dataIndexEnd_d).replace('<strong class="ca_top">사망</strong>','').replace('<ul class="ca_body">', '').replace('<li>', '').replace('<dl>', '').replace('</li>', '').replace('</ul>', '').replace('</dl>', '').replace('</div>', '').replace('<div>', '').replace('<dt class="ca_subtit">일일</dt>', '');
           var dataIndex_d_ = resPart_d.toString().indexOf('<dd class="ca_value">');
           var dataIndexEnd_d_ = resPart_d.toString().indexOf('<dt class="ca_subtit">인구 10만명당</dt>');
           var deaths = resPart_d.substring(dataIndex_d_, dataIndexEnd_d_).replace('<dd class="ca_value">', '').replace('</dd>', '').replace(")", "").replace(/\s/g,'');
           data.newDeaths = deaths.replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "").replace(regex4, "").replace(regex5, "");
      
           //신규 입원 환자
           var dataIndex_h = result4.toString().indexOf('<strong class="ca_top">신규입원</strong>');
           var dataIndexEnd_h = result4.toString().indexOf('<strong class="ca_top">확진</strong>');
           var resPart_h = result4.toString().substring(dataIndex_h, dataIndexEnd_h).replace('<strong class="ca_top">신규입원</strong>','').replace('<ul class="ca_body">', '').replace('<li>', '').replace('<dl>', '').replace('</li>', '').replace('</ul>', '').replace('</dl>', '').replace('</div>', '').replace('<div>', '').replace('<dt class="ca_subtit">일일</dt>', '');
           var dataIndex_h_ = resPart_h.toString().indexOf('<dd class="ca_value">');
           var dataIndexEnd_h_ = resPart_h.toString().indexOf('<dt class="ca_subtit">인구 10만명당</dt>');
           var hospitalized = resPart_h.substring(dataIndex_h_, dataIndexEnd_h_).replace('<dd class="ca_value">', '').replace('</dd>', '').replace(")", "");
           data.newHospitalization = hospitalized.replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "").replace(regex4, "").replace(regex5, "");
           
             request({
              uri: "http://ncov.mohw.go.kr/"
            }, function(error, response, body) {
              var result6 = body;
              //백신
              var dataIndex_v = result6.toString().indexOf('<li class="item">1차접종</li>');
           var dataIndexEnd_v = result6.toString().indexOf('</div><!-- vaccineNum -->');
           var resPart_v = result6.toString().substring(dataIndex_v, dataIndexEnd_v).replace('<li class="item">1차접종</li>','').replace('<ul class="ca_body">', '').replace('<li>', '').replace('<dl>', '').replace('</li>', '').replace('</ul>', '').replace('</dl>', '').replace('</div>', '').replace('<div>', '').replace('<dt class="ca_subtit">일일</dt>', '');
           var dataIndex_v1_ = resPart_v.toString().indexOf('<li class="percent">');
           var dataIndexEnd_v1_ = resPart_v.toString().indexOf('<li class="item">접종완료</li>');
            data.first_vaccine = resPart_v.substring(dataIndex_v1_, dataIndexEnd_v1_).replace('<li class="percent">', '').replace('<span>%</span>', '/').replace(/<ul>/g, '').replace(/<li class="person"><span>/g, '').replace(/<span>/g, '').replace(/<div class="box">/g, '').replace(/<ul>/, '').replace('누적</span>', '').replace('신규</span>', '').replace(' <img src="/static/image/main/vaccin_up_icon1.png" alt=""></li>', '').replace('</ul>', '').replace(/<li>/g, '/').replace(/(\s*)/g, "").replace('li>', '').replace('<', '').split('/');
            var dataIndex_v2_ = resPart_v.toString().indexOf('<li class="item">접종완료</li>');
            var dataIndexEnd_v2_ = resPart_v.toString().indexOf('<li class="item">추가접종</li>');
            data.second_vaccine = resPart_v.substring(dataIndex_v2_, dataIndexEnd_v2_).replace('<li class="item">접종완료</li>', '').replace('<span>%</span>', '/').replace(/<ul>/g, '').replace(/<li class="person"><span>/g, '').replace(/<span>/g, '').replace(/<div class="box">/g, '').replace(/<ul>/, '').replace('누적</span>', '').replace('신규</span>', '').replace(' <img src="/static/image/main/vaccin_up_icon1.png" alt=""></li>', '').replace('</ul>', '').replace(/<li>/g, '/').replace(/(\s*)/g, "").replace('li>', '').replace('<liclass="percent">', '').replace(/</g, '').replace(/>/g, '').replace('li', '').replace('ul', '').replace('div!--', '').replace('//', '/').split('/').splice(0, 3)
         
             //중환자 병상
             var dataIndex_s = result6.toString().indexOf('<th scope="row"><span>중환자 병상 <br>(중증환자전담 치료병상)</span></th>');
             var dataIndexEnd_s = result6.toString().indexOf('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>');
             var resPart_s = result6.toString().substring(dataIndex_s, dataIndexEnd_s).replace('<th scope="row"><span>중환자 병상 <br>(중증환자전담 치료병상)</span></th>','').replace('<td><span>', '').replace('</span></td>', '/').replace('<tr>', '').replace('</li>', '').replace('</tr>', '').replace(/\s/g,'').split('/');
             data.severeBeds = resPart_s[0].replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "");

             //일반 병상
             var dataIndex_n = result6.toString().indexOf('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>');
             var dataIndexEnd_n = result6.toString().indexOf('<p class="info_notice">거점전담병원 포함</p>');
             var resPart_n = result6.toString().substring(dataIndex_n, dataIndexEnd_n).replace('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>','').replace('<td><span>', '').replace('</span></td>', '/').replace('<tr>', '').replace('</li>', '').replace('</tr>', '').replace('</tbody>').replace('</table>', '').replace(/\s/g,'').split('/');
             data.normalBeds = resPart_n[0].replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "");

             request({
              uri: "https://api.corona-19.kr/korea/country/new/?serviceKey=5d4143bd958c16e18abe1acef5386c12d"
            }, function(error, response, body) {
              var result13= JSON.parse(body.toString());
              data.seoul = result13.seoul;
              data.busan = result13.busan;
              data.daegu = result13.daegu;
              data.incheon = result13.incheon;
              data.gwangju = result13.gwangju;
              data.daejeon = result13.daejeon;
              data.ulsan = result13.ulsan;
              data.sejong = result13.sejong;
              data.gyeonggi = result13.gyeonggi;
              data.gangwon = result13.gangwon;
              data.chungbuk = result13.chungbuk;
              data.chungnam = result13.chungnam;
              data.jeonbuk = result13.jeonbuk;
              data.jeonnam = result13.jeonnam;
              data.gyeongbuk = result13.gyeongbuk;
              data.gyeongnam = result13.gyeongnam;
              data.jeju = result13.jeju;
              data.quarantine = result13.quarantine;

             var jsonString = JSON.stringify(data);
             res.send(jsonString);
            });
        
          });
      
        });
			});
		});
	});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});