const express = require("express");

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
const cors = require('cors');
global.document = document;
var jsonString = '';

var $ = jQuery = require('jquery')(window);

const app = express();
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded({extended: false}));
app.use(cors());


var proxyServer = 'https://cors-coronacoc-v2.herokuapp.com/';

app.get("/", (req, res) => {
  res.render('docs.html');
});

app.get("/overview", (req, res) => {
  $.ajax({
    type: "GET",
    url: proxyServer+"https://apiv2.corona-live.com/domestic-init.json", 
    success: function(result) {
      var data = new Object();
      data.cases = result.stats.cases[0];
      data.deaths = result.stats.deaths[0];
      data.severe = result.stats.patientsWithSevereSymptons[0];
      data.newSevere = result.stats.patientsWithSevereSymptons[1];
      $.ajax({
        type: "GET",
        url: "https://api.corona-19.kr/korea/?serviceKey=5d4143bd958c16e18abe1acef5386c12d", // Using myjson.com to store the JSN
        success: function(result2) {
           data.updateTime = result2.updateTime;
           data.cure= result2.TotalRecovered;
    
            $.ajax({
                type: "GET",
                url: "https://api.corona-19.kr/korea/country/new/?serviceKey=5d4143bd958c16e18abe1acef5386c12d", // Using myjson.com to store the JSON
                success: function(result3) {
                    data.newCases = result3.korea.newCase;
    
                    data.localConfirmed = result3.korea.newCcase;
                    data.abroadConfirmed = result3.korea.newFcase;
    
                    var jsonString= JSON.stringify(data);
  
  res.send(jsonString);
    
                }
            });
        }
    });
    }
  });

});

app.get("/accumulatedCases", (req, res) => {
 
    //카카오 현황판(누적 데이터)
    $.ajax({
      type: "GET",
      url: proxyServer + "https://news.daum.net/covid19",
      success: function(result) {
          var data = new Object();
          var dataIndex = result.toString().indexOf('window.summaryList');
          var dataIndexEnd = result.toString().indexOf('window.vaccinationList');
          var data_res = JSON.parse(result.toString().substring(dataIndex, dataIndexEnd).replace("window.summaryList = ", "").replace(";", ""));
          data.accumulatedCases = data_res;

          var jsonString= JSON.stringify(data);
  
  res.send(jsonString);
      }
  });
});


app.get("/vaccine", (req, res) => {

  //백신접종 현황
$.ajax({
  type: "GET",
  url: proxyServer + "https://apiv2.corona-live.com/vaccine.json", // Using myjson.com to store the JSON
  success: function(result) {
    var data = new Object();
      var length = result.length;
      $('#vacTotal').html(result.stats.partiallyVaccinated.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '건');
      $('#vacPM').html('↑ ' + result.stats.partiallyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      $('#vacTotal2').html(result.stats.fullyVaccinated.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '건');
      $('#vacPM2').html('↑ ' + result.stats.fullyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

     data.first_vaccinePercent = result.stats.partiallyVaccinated.percentage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     data.first_vaccineDelta = result.stats.partiallyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     data.second_vaccinePercent = result.stats.fullyVaccinated.percentage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     data.second_vaccineDelta =  result.stats.fullyVaccinated.delta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
       //예방접종 공홈에서 추가접종 현황 크롤링
$.ajax({
  type: "GET",
  url: proxyServer + "https://ncv.kdca.go.kr/mainStatus.es?mid=a11702000000",
  success: function(result) {
      var dataIndex_v3 = result.toString().indexOf('<th scope="row">당일 누적<span class="r_txt_descript clr_1">A</span> + <span class="r_txt_descript clr_2">B</span></th>');
      var dataIndexEnd_v3 = result.toString().indexOf('<th scope="row">당일 실적<span class="r_txt_descript clr_1">A</span></th>');
      var resPart_v3 = result.toString().substring(dataIndex_v3, dataIndexEnd_v3).replace('<th scope="row">당일 누적<span class="r_txt_descript clr_1">A</span> + <span class="r_txt_descript clr_2">B</span></th>','').replace('<td class="d_num">', '').replace('</td>', '/').replace('</tr>', '').replace('<tr>', '').replace('\r\n', '').replace(/\s/g,'').split('/');
      data.third_vaccineDelta = resPart_v3[2].replace("td>", "").replace("<", "").replace('tdclass=\"d_num\">', "").replace('<', '');
      var jsonString= JSON.stringify(data);

      res.send(jsonString);

      
  }
});
     
  }
});
});

//병상 현황, 사망자 증가치
app.get("/sickbed", (req, res) => {
  const regex = /\t/g;
      const regex2 = /\n/g;
      const regex3 = /\r/g;
      const regex4 = /<li><dl>/g;
      const regex5 = /.</g;
$.ajax({
  type: "GET",
  url: proxyServer+ "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=11&ncvContSeq=&contSeq=&board_id=&gubun=",
  success: function(result) {
    var data = new Object();
      //사망
      var dataIndex_d = result.toString().indexOf('<strong class="ca_top">사망</strong>');
      var dataIndexEnd_d = result.toString().indexOf('<strong class="ca_top">재원 위중증</strong>');
      var resPart_d = result.toString().substring(dataIndex_d, dataIndexEnd_d).replace('<strong class="ca_top">사망</strong>','').replace('<ul class="ca_body">', '').replace('<li>', '').replace('<dl>', '').replace('</li>', '').replace('</ul>', '').replace('</dl>', '').replace('</div>', '').replace('<div>', '').replace('<dt class="ca_subtit">일일</dt>', '');
      var dataIndex_d_ = resPart_d.toString().indexOf('<dd class="ca_value">');
      var dataIndexEnd_d_ = resPart_d.toString().indexOf('<dt class="ca_subtit">인구 10만명당</dt>');
      var deaths = resPart_d.substring(dataIndex_d_, dataIndexEnd_d_).replace('<dd class="ca_value">', '').replace('</dd>', '').replace(")", "").replace(/\s/g,'');
      data.newDeaths = deaths.replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "").replace(regex4, "").replace(regex5, "");

      //신규 입원 환자
      var dataIndex_h = result.toString().indexOf('<strong class="ca_top">신규입원</strong>');
      var dataIndexEnd_h = result.toString().indexOf('<strong class="ca_top">확진</strong>');
      var resPart_h = result.toString().substring(dataIndex_h, dataIndexEnd_h).replace('<strong class="ca_top">신규입원</strong>','').replace('<ul class="ca_body">', '').replace('<li>', '').replace('<dl>', '').replace('</li>', '').replace('</ul>', '').replace('</dl>', '').replace('</div>', '').replace('<div>', '').replace('<dt class="ca_subtit">일일</dt>', '');
      var dataIndex_h_ = resPart_h.toString().indexOf('<dd class="ca_value">');
      var dataIndexEnd_h_ = resPart_h.toString().indexOf('<dt class="ca_subtit">인구 10만명당</dt>');
      var hospitalized = resPart_h.substring(dataIndex_h_, dataIndexEnd_h_).replace('<dd class="ca_value">', '').replace('</dd>', '').replace(")", "");
      
      data.newHospitalization = hospitalized.replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "").replace(regex4, "").replace(regex5, "");


      //공홈 메인 페이지 크롤링
$.ajax({
  type: "GET",
  url: proxyServer + "http://ncov.mohw.go.kr/",
  success: function(result) {
      //중환자 병상
      var dataIndex_s = result.toString().indexOf('<th scope="row"><span>중환자 병상 <br>(중증환자전담 치료병상)</span></th>');
      var dataIndexEnd_s = result.toString().indexOf('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>');
      var resPart_s = result.toString().substring(dataIndex_s, dataIndexEnd_s).replace('<th scope="row"><span>중환자 병상 <br>(중증환자전담 치료병상)</span></th>','').replace('<td><span>', '').replace('</span></td>', '/').replace('<tr>', '').replace('</li>', '').replace('</tr>', '').replace(/\s/g,'').split('/');
      data.severeBeds = resPart_s[0].replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "");
      //일반 병상
      var dataIndex_n = result.toString().indexOf('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>');
      var dataIndexEnd_n = result.toString().indexOf('<p class="info_notice">거점전담병원 포함</p>');
      var resPart_n = result.toString().substring(dataIndex_n, dataIndexEnd_n).replace('<th scope="row"><span>일반 병상 <br>(감염병전담 병원(중등중))</span></th>','').replace('<td><span>', '').replace('</span></td>', '/').replace('<tr>', '').replace('</li>', '').replace('</tr>', '').replace('</tbody>').replace('</table>', '').replace(/\s/g,'').split('/');
      data.normalBeds = resPart_n[0].replace(regex3, "").replace(regex2, "").replace(regex, "").replace(regex4, "").replace(regex5, "");


      var jsonString= JSON.stringify(data);
  console.log(jsonString);
  res.send(jsonString);
  }
});

  }
});
});



const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

