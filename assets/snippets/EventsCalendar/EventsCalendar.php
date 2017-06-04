<?php
define('MODX_API_MODE', true);
include_once 'manager/includes/config.inc.php';
include_once 'manager/includes/document.parser.class.inc.php';
$modx = new DocumentParser;
$modx->db->connect();
$modx->getSettings();
startCMSSession();
$modx->minParserPasses=2;
$modx->invokeEvent("OnWebPageInit");
$dates = array((int)@$_REQUEST["start"],(int)@$_REQUEST["end"]);

$dates = array(
 !empty($dates[0])?$dates[0]:mktime(0,0,0,date("n"),1),
 !empty($dates[1])?$dates[1]:mktime(0,0,0,date("n")+1,1)
);
$image = false;
if (isset($_REQUEST["image"])) {
	$image = array(
		"field" => !empty($_REQUEST["image"]["field"])?$_REQUEST["image"]["field"]:"image",
		"options" => !empty($_REQUEST["image"]["options"])?$_REQUEST["image"]["options"]:
			 "w=".(isset($modx->config["thumbWidth"])?$modx->config["thumbWidth"]:150).
			 ",h=".(isset($modx->config["thumbHeight"])?$modx->config["thumbHeight"]:150)
	);
}

$TVSelectTpl = "
(select value from {$modx->db->config['table_prefix']}site_tmplvar_contentvalues tvv
 left join {$modx->db->config['table_prefix']}site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='%s')
";

$sqlAr = array( // по умолчанию - использовать стандартные поля дат
	"selectDates" => "if(pub_date,pub_date,publishedon) as date",
	// "checkDates" => "if(pub_date,pub_date,publishedon) >= {$dates[0]} and if(pub_date,pub_date,publishedon) < {$dates[1]}",
	"checkDates" => "`date` >= {$dates[0]} and `date` < {$dates[1]}",
	"tvs" => explode(",", "hideInCalendar" . ((is_array($image) and !empty($image["field"]))?"," . $image["field"]:""))
);

if (!empty($_REQUEST["useDates"])) {
	/* Для использования других полей (мультиполей) даты (периодов дат)
	 Форматы указания поля(ей) дат
	 строка               : название TV параметра, одна дата
	 Строка с зяпятой     : названия TV параметров, соотв <дата начала>,<дата окончания>
	 Простой массив       : array(<дата начала>,<дата окончания>)
	 Именованный массив   : array("start" => <дата начала>,"end" => <дата окончания>)
	 Итоговый массив с параметрами (к которому бедет приведен пользовательский запрос):
	  array(
	   "field" => array(<имя TV даты начала>,<имя TV даты окончания>) для двух TV полей 
	              или  <имя TV> для одной даты 
	              или  <имя TV> содержащее мультиполе (ddmultipfield, multitv) для массива дат
	   "dateFormat" => <формат даты>, по умолчанию - "%d-%m-%Y %H:%i:%s"
	   "multi" => настройки мультиполя, если TV поле одно.
	              "json", "ddmultiplefields" или массив с разделителями строк и столбцов для ddmultiplefields 
	              по умолчанию, если не "json" , то примет вид: 
	              array("delimRow" => "||","delimCol" => "::")
	  )
	  Формат мульти-поля - неограниченное число строк, содержащих 1-2 колонки: дату начала и окончания события
	*/
	$useDates = $_REQUEST["useDates"];
	if (is_string($useDates)) {
		// Просто другое поле для проверки даты
		$useDates = array("field" => $useDates);
	}
	if (is_string($useDates["field"]) and count(explode(",", $useDates["field"])) == 2) {
		// проверка на запятую в строке (два TV)
		$useDates["field"] = explode(",", $useDates["field"]);
	}

	// если задан массив с start, end датами (а нужно ли?? )
	if (!isset($useDates["field"])) {
		// ожидается простой [start,end] или именованный (start=>, end=> ) массив с именами 2-х TV полей
		
		$useDates["field"] = array();
		// Приведение входного массива TV пимен к однови виду
		foreach (explode(",", "start,end") as $k => $field) {
			if (isset($useDates[$k]) or isset($useDates[$field])) {
				$useDates["field"][$k] = $useDates[$k]?$useDates[$k]:$useDates[$field];
				unset($useDates[$k]);
				unset($useDates[$field]);
			}
		}
	}
	if (empty($useDates["field"])) die("Can not find date field");
	
	$useDates["dateFormat"] = !empty($useDates["dateFormat"])?$useDates["dateFormat"]:"%d-%m-%Y %H:%i:%s";

	// формируем данныв для sql
	if (empty($useDates["multi"]) and !is_array($useDates["field"])) {
		// Просто другое поле для проверки даты
		$sqlAr["selectDates"] = "UNIX_TIMESTAMP(STR_TO_DATE(" . sprintf($TVSelectTpl, $useDates["field"]) . ",'{$useDates["dateFormat"]}')) as date";
	} else if (is_array($useDates["field"])) {
		// два TV поля
		$sqlAr["selectDates"] = "UNIX_TIMESTAMP(STR_TO_DATE(" . sprintf($TVSelectTpl, $useDates["field"][0]) . ",'{$useDates["dateFormat"]}')) as date_start" .
			",\n" . "UNIX_TIMESTAMP(STR_TO_DATE(" . sprintf($TVSelectTpl, $useDates["field"][1]) . ",'{$useDates["dateFormat"]}')) as date_end";
		$sqlAr["checkDates"] = "(`date_start` >= {$dates[0]} and `date_start` < {$dates[1]}) OR (`date_end` >= {$dates[0]} and `date_end` < {$dates[1]})";
	} else {
		// Одно TV поле для мультидат
		if (is_string($useDates["multi"])) $useDates["multi"] = array("format" => strtolower($useDates["multi"]));
		$sqlAr["selectDates"] = sprintf($TVSelectTpl, $useDates["field"]). "as date";
		if ($useDates["multi"]["format"] == "json") {
			// todo JSON

			echo "not readey yet, sorry";

			exit;
		} else {
			// если не JSON, то ddmultiplefields
			if (empty($useDates["multi"]["delimRow"])) $useDates["multi"]["delimRow"] = "||";
			if (empty($useDates["multi"]["delimCol"])) $useDates["multi"]["delimCol"] = "::";
// mysql functions for check dates in ddmultiplefields values like datein::dateout||datein::dateout||....
// 12-07-2017 14:08:00::13-08-2017 14:08:00||12-07-2017 14:08:00::29-07-2017 14:08:00||12-07-2018 14:08:00::29-07-2018 14:08:00
			
			$sql_Functions = array("DROP FUNCTION IF EXISTS SPLIT_STR","
CREATE FUNCTION SPLIT_STR ( x mediumtext, delim VARCHAR(12), pos INT )
RETURNS VARCHAR(255) DETERMINISTIC
BEGIN 
	RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(x, delim, pos), LENGTH(SUBSTRING_INDEX(x, delim, pos -1)) + 1), delim, '');
END",
"DROP FUNCTION IF EXISTS ckeck_ddmulti_dates",
"CREATE FUNCTION ckeck_ddmulti_dates( 
	raw mediumtext, datein int, dateout int, delimRow text(10), delimCol text(10), dateFormat text(100)
	)
RETURNS int(1) DETERMINISTIC
BEGIN
	SET @v1=0;
	SET @result=0;
	SET @RowCount =  1 + ((length(raw) - length(replace(raw,  delimRow, ''))) / length( delimRow));
	WHILE (@v1 < @RowCount) DO
		set @Row = SPLIT_STR(raw,delimRow,@v1+1);
		set @rDateIn = UNIX_TIMESTAMP(STR_TO_DATE(SPLIT_STR(@Row,delimCol,1),dateFormat));
		set @rDateOut = UNIX_TIMESTAMP(STR_TO_DATE(SPLIT_STR(@Row,delimCol,2),dateFormat));
		IF ((@rDateIn >= datein AND @rDateIn < dateout) OR (@rDateOut >= datein AND @rDateOut < dateout)) THEN
		 set @result = 1;
		END IF;
		SET @v1 = @v1 + 1;
	END WHILE;
	return @result;
END");
			foreach ($sql_Functions as $sqlF) $modx->db->query($sqlF); // todo: не лучшее решение каждый раз обнулять функции
			$sqlAr["checkDates"] = "date is not null and ckeck_ddmulti_dates(date,{$dates[0]},{$dates[1]},'{$useDates["multi"]["delimRow"]}','{$useDates["multi"]["delimCol"]}','{$useDates["dateFormat"]}')";
		}
	}
}

$sqlAr["pagetitle"] = empty($_COOKIE["yams_lang"])?"pagetitle":
	"(select value from " . $modx->db->config['table_prefix'] . "site_tmplvar_contentvalues tvv
 left join " . $modx->db->config['table_prefix'] . "site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='pagetitle_" . $_COOKIE["yams_lang"] . "' and value <>'') as pagetitle";

$sqlAr["tvValues"] = array();
foreach ($sqlAr["tvs"] as $tvValue) $sqlAr["tvValues"][$tvValue] = sprintf($TVSelectTpl, $tvValue)." as {$tvValue}";

$sql = "
select * from (
 select id," . $sqlAr["selectDates"] . "," . $sqlAr["pagetitle"] . ", " . implode(", ", $sqlAr["tvValues"]) . "
  from {$modx->db->config['table_prefix']}site_content sc
  where published=1 and isfolder=0 and deleted=0 and parent<>0 and type='document'
 ) as content
where pagetitle is not null and (hideInCalendar is null or hideInCalendar = 0)
 and ({$sqlAr["checkDates"]})
 ";

$r = $modx->db->query($sql);
$arr=array();
while( $row = $modx->db->getRow( $r ) ) {
	$rid = $row["id"];
	$arr[$rid] = $row;
	unset($arr[$rid]["hideInCalendar"]);
	$arr[$rid]["url"] = (!empty($_COOKIE["yams_lang"])?"/" . $_COOKIE["yams_lang"]:"") . $modx->makeUrl($rid);
	if (is_array($image) and !empty($image["field"]) and $arr[$rid]["image"])
		$arr[$rid]["image"] = $modx->runSnippet("phpthumb", array("input" => $arr[$rid]["image"],
			"options" => $image["options"]
		));
	if (!empty($useDates)) {
		if ($useDates["multi"]) {
			// конверт в JSON
			if ($useDates["multi"]["format"]=="json") {
				$arr[$rid]["date"] = @json_decode($arr[$rid]["date"]); 
			} else {
				$arr[$rid]["date"] = $modx->runSnippet("ddGetMultipleField", array(
					"string" => $arr[$rid]["date"],
					"outputFormat" => "array",
					"rowDelimiter" => $useDates["multi"]["delimRow"],
					"colDelimiter" => $useDates["multi"]["delimCol"]
				));
			}
			// $arr[$rid]["datedebug"] = $arr[$rid]["date"];
			array_walk_recursive($arr[$rid]["date"], function (&$i, $k, $dateFormat) {
				if ($i) {
					$dateFormat = str_replace("%", "", $dateFormat);
					$i = DateTime::createFromFormat($dateFormat, $i)->format('U');
				}
			}, $useDates["dateFormat"]);
		} else {
			if (empty($arr[$rid]["date"]) and
				isset($arr[$rid]["date_start"]) and isset($arr[$rid]["date_end"])) {
				$arr[$rid]["date"] = array(array(
					$arr[$rid]["date_start"],
					$arr[$rid]["date_end"]
				));
			unset($arr[$rid]["date_start"],$arr[$rid]["date_end"]);
			}
		}
	}
}
//print_r($arr);
// echo $sql;
echo json_encode($arr);

?>