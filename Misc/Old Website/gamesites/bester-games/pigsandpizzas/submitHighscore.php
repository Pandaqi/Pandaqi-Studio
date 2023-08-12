<?php 

$mysql_host = "mysql16.000webhost.com";
$mysql_database = "a3910886_pigs";
$mysql_user = "a3910886_pigs";
$mysql_password = "HupseFlups2";

$USN = $_GET['theUSN'];
$SCORE = $_GET['theSCORE'];

$conn = mysqli_connect($mysql_host, $mysql_user, $mysql_password, $mysql_database);
$sql = mysqli_query($conn, "SELECT * FROM `HighScores` WHERE `name` = '$USN' ");

//Get Current Highscore
$sql3 = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM `HighScores` ORDER BY `score` DESC"));
$curGlobalHigh = $sql3['score'];
$feedBack = $curGlobalHigh . ' by ' . $sql3['name'];
echo $feedBack;

if (mysqli_num_rows($sql) > 0) {
	$row = mysqli_fetch_assoc($sql);
	$oldScore = $row['score'];
	if($SCORE > $oldScore) {
		//New Personal Highscore!
		echo '-New Personal Highscore!';
		mysqli_query($conn, "UPDATE `HighScores` SET `score` = '$SCORE' WHERE `name` = '$USN' ");
		if($SCORE > $curGlobalHigh) {
			echo ' New Global Highscore!';
		} else {
			echo ' (but...global highscore is ' . $curGlobalHigh . '! :( )';
		}
	} else {
		//Nothing special happened here.
		//echo 'Nothing Special.';
	}
} else {
	//No rows found - create one for this person!
	$sql2 = "INSERT INTO `HighScores` (id, name, score) VALUES ('', '" . $USN . "', '" . $SCORE . "')";
	mysqli_query($conn, $sql2);
	echo '-New Personal Highscore!';
	//echo 'Created New Row';
}

?>