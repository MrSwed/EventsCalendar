<?php
define('MODX_API_MODE', true);
include_once 'manager/includes/config.inc.php';
include_once 'manager/includes/document.parser.class.inc.php';
$modx = new DocumentParser;
$modx->db->connect();
$modx->getSettings();
startCMSSession();
$modx->minParserPasses=2;

$dates = array((int)@$_REQUEST["start"],(int)@$_REQUEST["end"]);

$dates = array(
 !empty($dates[0])?$dates[0]:mktime(0,0,0,date("n"),1),
 !empty($dates[1])?$dates[1]:mktime(0,0,0,date("n")+1,1)
);
$image = false;
if (!isset($_REQUEST["image"]) or is_array($_REQUEST["image"])) {
	$image = array(
		"field" => !empty($_REQUEST["image"]["field"])?$_REQUEST["image"]["field"]:"image",
		"options" => !empty($_REQUEST["image"]["options"])?$_REQUEST["image"]["options"]:
			 "w=".(isset($modx->config["thumbWidth"])?$modx->config["thumbWidth"]:150).
			 ",h=".(isset($modx->config["thumbHeight"])?$modx->config["thumbHeight"]:150)
	);
}
$pagetitle = empty($_COOKIE["yams_lang"])?"pagetitle":
 "(select value from ".$modx->db->config['table_prefix']."site_tmplvar_contentvalues tvv
 left join ".$modx->db->config['table_prefix']."site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='pagetitle_".$_COOKIE["yams_lang"]."' and value <>'') as pagetitle";

$tvValues = array();
foreach (explode(",","hideInCalendar".((is_array($image) and !empty($image["field"]))?",".$image["field"]:"")) as $tvValue) 
	$tvValues[$tvValue] = "(select value from ".$modx->db->config['table_prefix']."site_tmplvar_contentvalues tvv
 left join ".$modx->db->config['table_prefix']."site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='{$tvValue}') as {$tvValue}";

$sql = "
select * from (
 select id,if(pub_date,pub_date,publishedon) as publishedon,$pagetitle, ". implode(", ",$tvValues)."
  from ".$modx->db->config['table_prefix']."site_content sc
  where if(pub_date,pub_date,publishedon) >= {$dates[0]} and if(pub_date,pub_date,publishedon) < {$dates[1]}
      and published=1 and isfolder=0 and deleted=0 and parent<>0
     and type='document'
 ) as content
where pagetitle is not null and (hideInCalendar is null or hideInCalendar = 0)
";

$r = $modx->db->query($sql);
$arr=array();
while( $row = $modx->db->getRow( $r ) ) {
 $arr[$row["id"]] = $row;
 $arr[$row["id"]]["url"] = (!empty($_COOKIE["yams_lang"])?"/".$_COOKIE["yams_lang"]:"").$modx->makeUrl($row["id"]);
 if (is_array($image) and !empty($image["field"]) and $arr[$row["id"]]["image"]) 
    $arr[$row["id"]]["image"] = $modx->runSnippet("phpthumb",array("input"=>$arr[$row["id"]]["image"], "options"=>$image["options"]));
}
//print_r($arr);
//echo $sql;
echo json_encode($arr);

?>