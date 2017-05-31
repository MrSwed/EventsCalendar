function formatZero(item, countZero){
	need = countZero - ("" + item).length;
	if (need > 0)
		for (i = 1; i <= need; i++) item = "0" + item
	return item;
}

if (typeof jQuery == "function") {
// jQuery.noConflict();
// (function($) { 
	$(function(){

		$.fn.extend({
			"EventsCalendar": function(opt){
				// todo: out template for item of event, date format, etc
				return $(this).each(function(){
					var _c = this;
					_c.p = $.extend({}, {
						'lang': {'months': 'январь,февраль,март,апрель,май,июнь,июль,август,сентябрь,октябрь,ноябрь,декабрь'.split(",")},
						// image TV field and phpthumb options, set "image" : false or "none" for disable
						// 'image':{"field":"image","options":"w=300,h=300"},
						'onloadMonth': false
					}, opt);
					var today = new Date();
					today = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // reset to 00:00:00
					var monthDraw = function(m, p){ // m - месяц в теущем году или смещение (+-) относительного текущего месяца
						p = $.extend({}, {
							onlyCurrent: false, // true - hide dates filled on empty weekdays for prev and next month
							year: false
						}, p);
						var mDays = $(".monthdays", _c), y = p["year"];
						if (typeof m === "undefined" || !m) mDate = new Date(y ? y : today.getFullYear(), today.getMonth(), 1); //текущий месяц
						else {
							mDate = mDays.data("date") ? mDays.data("date") : today;
							y = y ? y : mDate.getFullYear();
							if (/^[-+]$/.test(m[0])) mDate = new Date(y, mDate.getMonth() + (1 * m)); // смещение
							else mDate = new Date(y, m); // указанный месяц
						}
						m = mDate.getMonth();
						y = mDate.getFullYear();
						$(".curmonth .name", _c).text(_c.p.lang["months"][m] + " " + y);
						var wSS = mDate.getDay();
						wSS = 1 - (wSS ? wSS : 7); //сдвиг на первый понедельник
						var wSE = new Date(y, m + 1, 0).getDay();
						wSE = 7 - (wSE ? wSE : 7); //сдвиг на последнее воскресенье
						var setDe = new Date(y, m + 1, wSE); // последняя дата отрисовки
						mDays.data({
							"date": mDate,
							"start": new Date(y, m, !p["onlyCurrent"] ? wSS : 1).getTime() / 1000,
							"end": new Date(y, m + 1, !p["onlyCurrent"] ? wSE : 1).getTime() / 1000
						}).html("");
						while (++wSS < 50) { // рисуем дни
							var setD = new Date(y, m, wSS);
							var sDm = {m: setD.getMonth(), wd: setD.getDay(), d: setD.getDate()};
							var weekD = sDm["wd"] == 1 ? $("<div />").appendTo($(".monthdays", _c)) : $(".monthdays div:last", _c); //обертка в неделю
							var isCurM = sDm["m"] == m;
							var dayclass = (!isCurM ? "over " : "") + (today.getTime() == setD.getTime() ? "today " : "");
							weekD.append("<span " + (dayclass ? "class='" + dayclass + "'" : "") + ">" +
								((isCurM || !p["onlyCurrent"]) ? sDm["d"] : "&nbsp;") + "</span> ");
							if (setD.getTime() >= setDe.getTime()) break;
						}
					};
					var eventsDraw = function(p){
						var data = $.extend({}, {
							"q": 'assets/snippets/EventsCalendar/EventsCalendar.php',
							"start": new Date(today.getFullYear(), today.getMonth(), 1),
							"end": new Date(today.getFullYear(), today.getMonth() + 1, 0)
						}, p);
						if (typeof _c.p.image !== "undefined" ) data["image"] = _c.p.image; 
						$.ajax({
							type: 'POST',
							url: '/index-ajax.php',
							cache: false,
							dataType: "json",
							data: data,
							success: function(data, xhr, textStatus){
//     console.log(data);
								var mDays = $(".monthdays", _c);
								var m = mDays.data("date").getMonth();
								$.each(data, function(i, v){
									var iDate = new Date(v["publishedon"] * 1000);
									var evDay = $("span" + (iDate.getMonth() != m ? ".over" : ":not(.over)"), mDays)
										.filter(function(){
											return $(this).data("text") == iDate.getDate() || $(this).text() == iDate.getDate();
										});
									if (!$(">div", evDay).size()) {
										evDay.data("text", evDay.text());
										evDay.addClass("event").append("<div />");
									}
									$(">div", evDay).append('<div class="item">' +
										(v["image"] ? '<div class="image"><img src="' + v["image"] + '" alt="' + v["pagetitle"] + '" /></div>' : '') +
										'<div class="date">' +
										formatZero(iDate.getDate(), 2) + "." + formatZero(1 + iDate.getMonth(), 2) + "." + iDate.getFullYear() +
										" " + formatZero(iDate.getHours(), 2) + ":" + formatZero(iDate.getMinutes(), 2) + ":" + formatZero(iDate.getSeconds(), 2) +
										'</div>' +
										'<a href="' + v["url"] + '">' + v["pagetitle"] + '</a></div>');
								});
								if (typeof _c.p.onloadMonth === "function") mDays.each(_c.p.onloadMonth);
							},
							complete: function(xhr, textStatus){
								if (!xhr || !xhr.status || textStatus !== "success") {
									console.log(xhr, textStatus);
								}
							}
						});
					};
					$(".prev,.next,.name", $(".curmonth", _c)).click(function(e){
						e.preventDefault();
						var go = 0;
						if ($(this).is(".prev")) go = "-1";
						if ($(this).is(".next")) go = "+1";
						monthDraw(go);
						eventsDraw({
							"start": $(".monthdays", _c).data("start"),
							"end": $(".monthdays", _c).data("end")
						});
					});
					$(".name", $(".curmonth", _c)).click();
				});
			}
		});
	});
//})(jQuery);
}
