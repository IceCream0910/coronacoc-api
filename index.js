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
			uri: "https://api.corona-19.kr/korea/?serviceKey=5d4143bd958c16e18abe1acef5386c12d"
		}, function(error, response, body) {
			var result2 = JSON.parse(body.toString());
			data.updateTime = result2.updateTime.replace('코로나바이러스감염증-19 국내 발생현황 (', '').replace(')', '');
			data.cure = result2.TotalRecovered;
			request({
				uri: "https://api.corona-19.kr/korea/country/new/?serviceKey=5d4143bd958c16e18abe1acef5386c12d"
			}, function(error, response, body) {
				var result3 = JSON.parse(body.toString());
				data.newCases = result3.korea.newCase;
				data.localConfirmed = result3.korea.newCcase;
				data.abroadConfirmed = result3.korea.newFcase;
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
            uri: "https://apiv2.corona-live.com/vaccine.json"
          }, function(error, response, body) {
            var result5 = JSON.parse(body.toString());
            data.first_vaccinePercent = result5.stats.partiallyVaccinated.percentage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
             data.first_vaccineDelta = result5.stats.partiallyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
             data.first_vaccineTotal = result5.stats.partiallyVaccinated.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            
             data.second_vaccinePercent = result5.stats.fullyVaccinated.percentage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
             data.second_vaccineDelta =  result5.stats.fullyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
             data.second_vaccineTotal = result5.stats.fullyVaccinated.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

             request({
              uri: "http://ncov.mohw.go.kr/"
            }, function(error, response, body) {
              var result6 = body;
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
              data.jeonbuk = result13.jeonnam;
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
	});
  //res.send(`<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=theme-color content=#000><title>코로나콕 API 서버</title><style>html{font-size: 62.5%; box-sizing: border-box; height: -webkit-fill-available}*, ::after, ::before{box-sizing: inherit}body{font-family: sf pro text, sf pro icons, helvetica neue, helvetica, arial, sans-serif; font-size: 1.6rem; line-height: 1.65; word-break: break-word; font-kerning: auto; font-variant: normal; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; hyphens: auto; height: 100vh; height: -webkit-fill-available; max-height: 100vh; max-height: -webkit-fill-available; margin: 0}::selection{background: #79ffe1}::-moz-selection{background: #79ffe1}a{cursor: pointer; color: #0070f3; text-decoration: none; transition: all .2s ease; border-bottom: 1px solid #0000}a:hover{border-bottom: 1px solid #0070f3}ul{padding: 0; margin-left: 1.5em; list-style-type: none}li{margin-bottom: 10px}li:before{display: inline-block; color: #ccc; position: absolute; margin-left: -18px; transition: color .2s ease}code{font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: .92em}.container{display: flex; justify-content: center; flex-direction: column; min-height: 100%}main{max-width: 80rem; padding: 4rem 6rem; margin: auto}ul{margin-bottom: 32px}.error-title{font-size: 2rem; padding-left: 22px; line-height: 1.5; margin-bottom: 24px}.error-title-guilty{border-left: 2px solid #ed367f}.error-title-innocent{border-left: 2px solid #59b89c}main p{color: #333}.devinfo-container{border: 1px solid #ddd; border-radius: 4px; padding: 2rem; display: flex; flex-direction: column; margin-bottom: 32px}.error-code{margin: 0; font-size: 1.6rem; color: #000; margin-bottom: 1.6rem}.devinfo-line{color: #333}.devinfo-line code, code, li{color: #000}.devinfo-line:not(:last-child){margin-bottom: 8px}.docs-link, .contact-link{font-weight: 500}header, footer, footer a{display: flex; justify-content: center; align-items: center}header, footer{min-height: 100px; height: 100px}header{border-bottom: 1px solid #eaeaea}header h1{font-size: 1.8rem; margin: 0; font-weight: 500}header p{font-size: 1.3rem; margin: 0; font-weight: 500}.header-item{display: flex; padding: 0 2rem; margin: 2rem 0; text-decoration: line-through; color: #999}.header-item.active{color: #ff0080; text-decoration: none}.header-item.first{border-right: 1px solid #eaeaea}.header-item-content{display: flex; flex-direction: column}.header-item-icon{margin-right: 1rem; margin-top: .6rem}footer{border-top: 1px solid #eaeaea}footer a{color: #000}footer a:hover{border-bottom-color: #0000}footer svg{margin-left: .8rem}.note{padding: 8pt 16pt; border-radius: 5px; border: 1px solid #0070f3; font-size: 14px; line-height: 1.8; color: #0070f3}@media(max-width:500px){.devinfo-container .devinfo-line code{margin-top: .4rem}.devinfo-container .devinfo-line:not(:last-child){margin-bottom: 1.6rem}.devinfo-container{margin-bottom: 0}header{flex-direction: column; height: auto; min-height: auto; align-items: flex-start}.header-item.first{border-right: none; margin-bottom: 0}main{padding: 1rem 2rem}body{font-size: 1.4rem; line-height: 1.55}footer{display: none}.note{margin-top: 16px}}</style><div class=container> <main> <p class=devinfo-container><span class=error-code><strong>코로나콕 </strong>API</span> <span class=devinfo-line><strong>/api/overview:</strong> 확진자, 사망자 위중증, 격리해제, 지역/해외 발생</span> <span class=devinfo-line><strong>/api/vaccine:</strong> 1차, 2차, 3차 접종 현황</span> <span class=devinfo-line><strong>/api/accumulatedCases:</strong> 누적 확진자 차트 데이터</span> <span class=devinfo-line><strong>/api/sickbed:</strong> 사망자, 병상 현황</span> </p><a> <div class=note>데이터 출처 : 질병관리청, 코로나라이브, 굿바이코로나</div></a> </main></div>`);
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});