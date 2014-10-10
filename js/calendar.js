if (typeof jQuery == "function") {
// jQuery.noConflict();
// (function($) { 
$(function(){


 function(o){ //calendar
  o = $(o);
  if (!o.size()) return;
  if (!calendarLang) calendarLang = {'months':'€нварь,февраль,март,апрель,май,июнь,июль,август,сент€брь,окт€брь,но€брь,декабрь'.split(",")};
  var today=new Date();
  today=new Date(today.getFullYear(),today.getMonth(),today.getDate()); // reset to 00:00:00
  var monthDraw = function(m,p) { // m - мес€ц в теущем году или смещение (+-) относительного текущего мес€ца
   p = $.extend({},{
    onlyCurrent:false, // true - hide dates filled on empty weekdays for prev and next month
    year:false,
   },p);
   var mDays = $(".monthdays",o), y = p["year"];
   if (typeof m ==="undefined" || !m) mDate = new Date(y?y:today.getFullYear(),today.getMonth(),1); //текущий мес€ц
   else {
    mDate = mDays.data("date")?mDays.data("date"):today;
    y = y?y:mDate.getFullYear();
    if(/^[-+]$/.test(m[0])) mDate=new Date(y,mDate.getMonth() + (1*m)); // смещение
    else mDate=new Date(y,m); // указанный мес€ц
   }
   m = mDate.getMonth();
   y = mDate.getFullYear();
   $(".curmonth .name",o).text(calendarLang["months"][m] + " " + y);
   var wSS = mDate.getDay();wSS = 1 - (wSS?wSS:7); //сдвиг на первый понедельник
   var wSE = new Date(y,m+1,0).getDay();wSE = 7 - (wSE?wSE:7); //сдвиг на последнее воскресенье
   var setDe = new Date(y,m+1,wSE); // последн€€ дата отрисовки
   mDays.data({
    "date":mDate,
    "start":new Date(y,m,!p["onlyCurrent"]?wSS:1).getTime()/1000,
    "end":new Date(y,m+1,!p["onlyCurrent"]?wSE:1).getTime()/1000
   }).html("");
   while (++wSS<50) { // рисуем дни
    var setD = new Date(y,m,wSS);
    var sDm = {m:setD.getMonth(),wd:setD.getDay(),d:setD.getDate()};
    var weekD = sDm["wd"]==1?$("<div />").appendTo($(".monthdays",o)):$(".monthdays div:last",o); //обертка в неделю
    var isCurM = sDm["m"]==m;
    var dayclass = (!isCurM?"over ":"")+(today.getTime()==setD.getTime()?"today ":"");
    weekD.append("<span "+(dayclass?"class='"+dayclass+"'":"")+">"+
    ((isCurM||!p["onlyCurrent"])?sDm["d"]:"&nbsp;")+"</span> ");
    if (setD.getTime()>=setDe.getTime()) break;
   };
  };
  var eventsDraw = function(p){
   $.extend({},{
    "start":new Date(today.getFullYear(),today.getMonth(),1),
    "end":new Date(today.getFullYear(),today.getMonth()+1,0),
   },p);

   $.ajax({
    type:'POST',
    url: '/index-ajax.php',
    cache: false,
    dataType:"json",
    data:{
     q:'assets/snippets/calendar/calendar.php',
     start:p["start"],
     end:p["end"],
    },
    success:function(data, xhr, textStatus){
//     console.log(data);
     var mDays = $(".monthdays",o);
     var m = mDays.data("date").getMonth();
     $.each(data,function(i,v){
      var iDate = new Date(v["publishedon"]*1000);
      var evDay = $("span"+(iDate.getMonth()!=m?".over":":not(.over)"),mDays)
          .filter(function(){return $(this).data("text")==iDate.getDate() || $(this).text()==iDate.getDate();});
      if (!$(">div",evDay).size()) {
       evDay.data("text",evDay.text());
       evDay.addClass("event").append("<div />");
      }
      $(">div",evDay).append('<div class="item"><div class="date">'+
      formatZero(iDate.getDate(),2)+"."+formatZero(1+iDate.getMonth(),2)+"."+iDate.getFullYear()+" "+
      formatZero(iDate.getHours(),2)+":"+formatZero(iDate.getMinutes(),2)+":"+formatZero(iDate.getSeconds(),2)
      +'</div><a href="'+v["url"]+'">'+v["pagetitle"]+'</a></div>');
     });
    },
    complete: function(xhr, textStatus){
     if (!xhr || !xhr.status || textStatus != "success") {
      console.log(xhr, textStatus);
     }
    }
   });
  };
  $(".prev,.next,.name",$(".curmonth",o)).click(function(e){
   e.preventDefault();
   var go=0;
   if ($(this).is(".prev")) go="-1";
   if ($(this).is(".next")) go="+1";
   monthDraw(go);
   eventsDraw({
    "start":$(".monthdays",o).data("start"),
    "end":$(".monthdays",o).data("end"),
   });
  });
  $(".name",$(".curmonth",o)).click();
 }

});
//})(jQuery);
}
