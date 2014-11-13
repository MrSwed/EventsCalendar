<?php
define('MODX_API_MODE', true);
include_once 'manager/includes/config.inc.php';
include_once 'manager/includes/document.parser.class.inc.php';
$modx = new DocumentParser;
$modx->db->connect();
$modx->getSettings();
startCMSSession();
$modx->minParserPasses=2;

//echo $modx->RunSnippet('Ditto',array('parent'=>$modx->db->escape($_POST['parent'])));
// вот тут мы выполняем сниппет по нашим данным


$dates = array(
 !empty($_REQUEST["start"])?$_REQUEST["start"]:mktime(0,0,0,date("n"),1),
 !empty($_REQUEST["end"])?$_REQUEST["end"]:mktime(0,0,0,date("n")+1,1)
);

$pagetitle = empty($_COOKIE["yams_lang"])?"pagetitle":
 "(select value from ".$modx->db->config['table_prefix']."site_tmplvar_contentvalues tvv
 left join ".$modx->db->config['table_prefix']."site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='pagetitle_".$_COOKIE["yams_lang"]."' and value <>'') as pagetitle";

$hideInCalendar ="(select value from ".$modx->db->config['table_prefix']."site_tmplvar_contentvalues tvv
 left join ".$modx->db->config['table_prefix']."site_tmplvars tvn on tvn.id = tvv.tmplvarid
where tvv.contentid = sc.id and tvn.name='hideInCalendar') as hideInCalendar";

$sql = "
select * from (
 select id,if(pub_date,pub_date,publishedon) as publishedon,$pagetitle,$hideInCalendar
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
}
//print_r($arr);
//echo $sql;
echo json_encode($arr);

?>