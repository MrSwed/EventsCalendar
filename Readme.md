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