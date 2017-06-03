# Events Calendar for Modx EVO

## Install

- Copy assets/* 
- Add chunk from install/chunks 
- Open index-ajax.php and append snippet dir `assets/snippets/EventsCalendar/` at this code part:
```
// Add items to this array corresponding to which directories within assets/snippets/ can be used by this file.
// Do not add entries unneccesarily.
// Any PHP files in these directories can be executed by any user.
$allowed_dirs = array('assets/snippets/ajaxSearch/'); 
```
Instead 
```php
$allowed_dirs = array('assets/snippets/ajaxSearch/');
```
must be
```php
$allowed_dirs = array('assets/snippets/ajaxSearch/','assets/snippets/EventsCalendar/');
```

## Call options and defaults

### HTML

Use chunk ***{{EventsCalendar}}*** for draw html template.
See [install/chunks/EventsCalendar.tpl](install/chunks/EventsCalendar.tpl)

### JS

```javascript
opt = {
// language : russian
	'lang': {'months': 'январь,февраль,март,апрель,май,июнь,июль,август,сентябрь,октябрь,ноябрь,декабрь'.split(",")},
// templates for event items
	'tpl': {
// Event item template
		'event': '<a href="%url" class="item" data-id="%id">%image%date<span class="title">%title</span></a>',
// date format
		'date': '<span class="date">%d.%m.%Y %H:%i:%s</span>',
// block for dates <from> - <to>
		'dates': '<span class="dates">%dates</span>',
// dates periods delimeter 
		'dateBetween': ' &ndash; ',
// image template
		'image': '<span class="image"><img src="%src" alt="%alt" /></span>'
	},
// Function on loaded month events: function(){}
	'onloadMonth': false,

// Image get :  false | true | {field:"tvimage","options":"w=200,h=200"}
// if set true, default options is: TV name = image, Image size gets from modx->config 
// {field:"image","options":"w=<thumbWidth>,h=<thumbHeught>"} 
	'image': false,

// Date use for date of event.
// Set TV name for date use: 
// 'useDates':"date",
// same as:
// 'useDates':{"field":"date"},
 // Set TV names for date start and end of event: 
// 'useDates':"dates_start,date_end", 
// same as:
// 'useDates':{"field":"dates_start,date_end"},
// same as
// 'useDates':{"field":["dates_start","date_end"]},
// set dateFormat for TV, default "%d-%m-%Y %H:%i:%s"
// 'useDates':{"field":"date","dateFormat":"%d-%m-%Y %H:%i:%s"},
// Set TV for multivalue (at now ony for ddmultiplefields yet}
// 'useDates':{"field":"dates","multi":1}, 
// 'useDates':{"field":"dates","multi":"ddmultiplefields"}, 
// same as
// 'useDates':{"field":"dates","multi":{"delimRow":"||","delimCol":"::"}},
// json (not ready yet)
// 'useDates':{"field":"dates","multi":"json"},
// By default used publishedon or pub_date
	'useDates': false
};
```

## Usage examples

### Simple call with defaults:

```javascript
$(".EventsCalendar").EventsCalendar();
```

### Set language

```javascript
$(".EventsCalendar").EventsCalendar({
	"lang":{'months':
	'january,february,march,april,may,june,july,august,september,october,november,december'.split(",")}
});

```

### Get image for event

#### With default parameters: 
 - TV image field: *image*,
 - phpthumb options *w=`$modx->config["thumbWidth"]`,h=`$modx->config["thumbHeight"]`*

```javascript
$(".EventsCalendar").EventsCalendar({
	"image":true
});
```

#### Set image parameters

```javascript
$(".EventsCalendar").EventsCalendar({
	"image":{field:"tvimage","options":"w=200,h=200"}
});
```

### Set event templates

#### Set custom date format, without time 

```javascript
$(".EventsCalendar").EventsCalendar({
	'tpl': {"date": '<span class="date">%d.%m.%Y</span>'}
});
``` 
#### Set custom event item template and image

Set link only at title, no data-id attr, image without span outer

```javascript
$(".EventsCalendar").EventsCalendar({
	'tpl': {
		'event': '<span class="item">%image %date <a href="%url" class="item" class="title">%title</a></span>',
		'image': '<img src="%src" alt="%alt" />'
	}
});


```

## Override the output of the event list and click instead of hover

This example usable for list of events at external visible div loaded by click to day with event instead mouse hover. Also activating nearest day with an events.

JS call:
```javascript
(function(EC){
	EC = $(EC);
	var ecM = $(".monthdays ", EC);
	EC.EventsCalendar({
		"onloadMonth": function(){
			var ecM = $(this);
			var ecToday = $("span.today", ecM);
			var NEvent;
			$("span.event", ecM).each(function(){
				if (!$(NEvent).length ||
					Math.abs($(NEvent).data("date") - $(ecToday).data("date")) > Math.abs($(this).data("date") - $(ecToday).data("date"))
				) NEvent = $(this);
			});
			$(NEvent).click();
		}
	}).on("click", ".monthdays span.event", function(e){
		e.preventDefault();
		$("span.event", ecM).removeClass("active");
		$(this).addClass("active");
		$(">.items", EC).html($("div", this).html());
	});
})(".EventsCalendar");

```

Also, on css remove hover handler

```css
.EventsCalendar .monthdays span:hover > div {
  display: block;
}
```
