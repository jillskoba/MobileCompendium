<?php
require_once("connect.php");
//Select the Database
$result = mysql_query("select * from tbl_dragons"); 
header('Content-Type: application/json');
$json_response = array();
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$row_array['dragon_id'] = $row['dragon_id'];
		$row_array['dragon_name'] = $row['dragon_name'];
		$row_array['dragon_desc'] = $row['dragon_desc'];
		$row_array['dragon_family'] = $row['dragon_family'];
		$row_array['dragon_location'] = $row['dragon_location'];
		$row_array['dragon_level'] = $row['dragon_level'];
		$row_array['dragon_thumb'] = $row['dragon_thumb'];
		$row_array['dragon_img'] = $row['dragon_img'];
		//push the values in the array
		array_push($json_response,$row_array);
	}
	echo json_encode($json_response);
?>