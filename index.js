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
		uri: "https://apiv3.corona-live.com/domestic/stat.json"
	}, function(error, response, body) {
		var result = JSON.parse(body.toString());
		data.cases = result.overview.confirmed[0];
    data.newCases = result.overview.confirmed[1];
		data.deaths = result.overview.deceased[0];
    data.newDeaths =  result.overview.deceased[1];
		data.severe = result.overview.confirmedSevereSymptoms[0];
		data.newSevere = result.overview.confirmedSevereSymptoms[1];
    data.cure = result.overview.recovered[0];
    data.newCure = result.overview.recovered[1];
    
		request({
			uri: "https://apiv3.corona-live.com/vaccine.json"
		}, function(error, response, body) {
			var result3 = JSON.parse(body.toString());
			data.first_vaccine = result3.overview.partiallyVaccinated;
			data.second_vaccine = result3.overview.fullyVaccinated;
      data.third_vaccine = result3.overview.booster;

      request({
        uri: "https://api.corona-19.kr/korea/beta/?serviceKey=5d4143bd958c16e18abe1acef5386c12d"
      }, function(error, response, body) {
        var result2 = JSON.parse(body.toString());
        data.updateTime = result2.API.updateTime.replace('코로나바이러스감염증-19 국내 발생현황 (', '').replace(')', '');
        data.localConfirmed = result2.korea.incDecK;
        data.abroadConfirmed = result2.korea.incDecF;
  
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