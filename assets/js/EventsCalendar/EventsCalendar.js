String.prototype.replaceArray = function(find, replace){
	var replaceString = this;
	for (var i = 0; i < find.length; i++) replaceString = replaceString.replace(find[i], replace[i]);
	return replaceString;
};

if (typeof jQuery == "function") {
// jQuery.noConflict();
// (function($) { 
	$(function(){

		$.fn.extend({
			"EventsCalendar": function(opt){
				return $(this).each(function(){
					var _c = this;
					_c.p = $.extend(true,{}, {
						'lang': {'months': 'январь,февраль,март,апрель,май,июнь,июль,август,сентябрь,октябрь,ноябрь,декабрь'.split(",")},
						'tpl' : { // templates
							'dateBetween': ' &ndash; ',
							'dates': '<span class="dates">%dates</span>',
							'date' : '<span class="date">%d.%m.%Y %H:%i:%s</span>',
							'event': '<a href="%url" class="item" data-id="%id">%image%date<span class="title">%title</span></a>',
							'image': '<span class="image"><img src="%src" alt="%alt" /></span>'
						},
						// image TV field and phpthumb options, set "image" : false or "none" for disable
						// 'image':{"field":"image","options":"w=150,h=150"},

						// for user other dates for event
						// 'useDates':"dates_start,date_end", // same as
						// 'useDates':{"field":"dates_start,date_end"},
						// 'useDates':{"field":"dates","multi":1}, // same as
						// 'useDates':{"field":"dates","multi":{"delimRow":"||","delimCol":"::"}},
						'onloadMonth': false
					}, opt);
					var to$ = ["event", "image","dates","date"]; // к единому виду, если указан существующий шаблон-jQuery объект
					for (var k in to$) if (typeof _c.p.tpl[to$[k]] === "object") _c.p.tpl[to$[k]] = $(_c.p.tpl[to$[k]]).html();
					var today = new Date();
					today = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // reset to 00:00:00
					var monthDraw = function(m, p){ // m - месяц в текущем году или смещение (+-) относительного текущего месяца
						p = $.extend({}, {
							onlyCurrent: false, // true - hide dates filled on empty weekdays for prev and next month
							year: false
						}, p);
						var mDays = $(".monthdays", _c), y = p["year"];
						if (!m) mDate = new Date(y ? y : today.getFullYear(), today.getMonth(), 1); //текущий месяц
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
							var weekD = sDm["wd"] === 1 ? $("<div />").appendTo($(".monthdays", _c)) : $(".monthdays div:last", _c); //обертка в неделю
							var isCurM = sDm["m"] === m;
							var dayclass = (!isCurM ? "over " : "") + (today.getTime() === setD.getTime() ? "today " : "");
							$("<span " + (dayclass ? "class='" + dayclass + "'" : "") + ">" +
															((isCurM || !p["onlyCurrent"]) ? sDm["d"] : "&nbsp;") + "</span> ")
								.data("date",setD).appendTo(weekD);
							if (setD.getTime() >= setDe.getTime()) break;
						}
					};
					var tplDateDraw = function(d){
						return _c.p.tpl.date.replaceArray("%d,%m,%Y,%H,%i,%s".split(","),
							[("0" + d.getDate()).slice(-2), ("0" + (1 + d.getMonth())).slice(-2), d.getFullYear(),
								("0" + d.getHours()).slice(-2), ("0" + d.getMinutes()).slice(-2), ("0" + d.getSeconds()).slice(-2)]
							);
					};
					var eventsDraw = function(p){
						var data = $.extend({}, {
							"q": 'assets/snippets/EventsCalendar/EventsCalendar.php',
							"start": new Date(today.getFullYear(), today.getMonth(), 1),
							"end": new Date(today.getFullYear(), today.getMonth() + 1, 0)
						}, p);
						if (typeof _c.p.image !== "undefined") data["image"] = _c.p.image; 
						if (typeof _c.p.useDates !== "undefined" ) data["useDates"] = _c.p.useDates; 
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
									// var evDay = $("span" + (iDate.getMonth() != m ? ".over" : ":not(.over)"), mDays)
									$("> div > span", mDays)
										.each(function(){
											var evDay = $(this);
											var dayStart = $(this).data("date").getTime();
											var dayEnd = dayStart + (60 * 60 * 24 * 1000);
											var isEvent = false, DateTpl;
											if (typeof v["date"] === "object") {
												DateTpl = [];
												
												for (var row in v["date"]) {
													var d0 = v["date"][row][0] * 1000;
													var d1 = v["date"][row][1] * 1000 || d0;
													d0 = d0 || d1;
													if ((d0 >= dayStart && d0 < dayEnd) // first date
														|| (d0 < dayStart && d1 > dayEnd)  // bettween
													 || (d1 >= dayStart && d1 < dayEnd) // last date
													) {
														isEvent = true;
														DateTpl[row] =_c.p.tpl.dates.replace("%dates",
															tplDateDraw(new Date(d0)) + ((d0 !== d1)?_c.p.tpl.dateBetween + tplDateDraw(new Date(d1)):"")
															);
													}
												}
											} else {
												if (v["date"] * 1000 >= dayStart && v["date"] * 1000 < dayEnd) {
													isEvent = true;
													DateTpl = tplDateDraw(new Date(v["date"] * 1000))
												}
											}
											if (isEvent) {
												if (!$(">div", evDay).length) evDay.addClass("event").append("<div />");
												if (typeof DateTpl==="object" ) DateTpl = DateTpl.join("\n");
												$(">div", evDay).append(_c.p.tpl.event.replaceArray(
													"%id,%image,%date,%url,%title".split(","),
													[v["id"],
														v["image"]?_c.p.tpl.image.replaceArray("%src,%alt".split(","), [v["image"], v["pagetitle"]]):"",
														DateTpl,
														v["url"],
														v["pagetitle"]
													]
												))
											}
										}); // end check each day
								}); // end check each event
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