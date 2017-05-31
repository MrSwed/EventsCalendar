###Using with standart index-ajax.php

Open index-ajax.php and append snippet dir `assets/snippets/EventsCalendar/` at this code part:
```
// Add items to this array corresponding to which directories within assets/snippets/ can be used by this file.
// Do not add entries unneccesarily.
// Any PHP files in these directories can be executed by any user.
$allowed_dirs = array('assets/snippets/ajaxSearch/'); 
```
Instead 
```
$allowed_dirs = array('assets/snippets/ajaxSearch/');
```
must be
```
$allowed_dirs = array('assets/snippets/ajaxSearch/','assets/snippets/EventsCalendar/');
```

#### Usage example

Use chunk ***EventsCalendar*** for draw html template.

Jquery usage examples:

#####Simple call:
with default parameters: 
 - image field: *image*,
 - phpthumb options *w=300,h=300*

``` 
$(".EventsCalendar").EventsCalendar();
```

#####Set image parameters

```javascript
$(".EventsCalendar").EventsCalendar({
"image":{field:"tvimage","options":"w=200,h=200"}
});
```

#####Set no image

```javascript 
$(".EventsCalendar").EventsCalendar({
"image":false
});
```

#####Override the output of the event list and click instead of hover

This example usable for list of events on external visible div loaded by click to day of month with event instead mouse hover.

JS call:
```javascript
(function(EC){
	EC = $(EC);
	var ecM = $(".monthdays ", EC);
	EC.EventsCalendar({
		"onloadMonth": function(){
			var ecM = $(this);
			var ecToday = $("span.today", ecM);
			$("span.event", ecM).filter(function(){
				return $(this).index() <= $(ecToday).index();
			}).last().click();
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

##### Set language

```javascript
$(".EventsCalendar").EventsCalendar({
"lang":{'months':
'january,february,march,april,may,june,july,august,september,october,november,december'.split(",")}
});

```