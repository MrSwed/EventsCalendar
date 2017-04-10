/**
* EventsCalendar
*
* Виджет "комментарии"
*
* @category    chunk
* @version     1.0
* @license     http://www.gnu.org/copyleft/gpl.html GNU Public License (GPL)
* @internal    @modx_category Content
* @internal    @installset base, sample
* @author      MrSwed (https://github.com/MrSwed/EventsCalendar)
*/
<div class="EventsCalendar">
	<script type="text/javascript">
		var calendarLang = {'months': 'январь,февраль,март,апрель,май,июнь,июль,август,сентябрь,октябрь,ноябрь,декабрь'.split(",")};
	</script>
	<div class="curmonth">
		<div class="prev"></div>
		<div class="name"></div>
		<div class="next"></div>
	</div>
	<div class="weekdays">
		<span>пн</span>
		<span>вт</span>
		<span>ср</span>
		<span>чт</span>
		<span>пт</span>
		<span>сб</span>
		<span>вс</span>
	</div>
	<div class="monthdays">
		<span></span>
	</div>
</div>