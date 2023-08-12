<!DOCTYPE html>
<html>
<head><title>Highscores!</title></head>
<body style="background-color:#ffcc66">
	<h1 style="text-align:center;color:#ff6633;font-family:Helvetica;">Highscore Table</h1>
	<table style="margin:0 auto;width:750px;font-family:Rockwell;font-size:26px;color:IndianRed;">
		<?php 

		$mysql_host = "mysql16.000webhost.com";
		$mysql_database = "a3910886_pigs";
		$mysql_user = "a3910886_pigs";
		$mysql_password = "HupseFlups2";

		$conn = mysqli_connect($mysql_host, $mysql_user, $mysql_password, $mysql_database);
		$counter = 1;
		//Get Current Highscore
		$sql = mysqli_query($conn, "SELECT * FROM `HighScores` ORDER BY `score` DESC");
		while($row = mysqli_fetch_assoc($sql)) {
			echo '<tr><td><b>' . $counter . '. ' . $row['name'] . '</b></td><td>' . $row['score'] . '</td></tr>';
			$counter++;
		}

		?>
	</table>
</body>

</html>