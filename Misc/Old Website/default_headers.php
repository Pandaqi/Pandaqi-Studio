<?php

/*
 * Database connection
 */

// FOR LOCAL TESTING ...
//$conn = new mysqli("localhost", "root", "", "pandaqi");

// FOR DEPLOYMENT ...
$conn = new mysqli("localhost", "u4302d8117_pandaqi", "Dalionzo7!", "u4302d8117_pandaqi");
$conn->query("SET NAMES 'utf8'");

/*
 * Big and important function for displaying a container
 */

$gameContainerIncrementer = 0;
function displayHorizontalContainer($row) {
	global $gameContainerIncrementer;
	
	// fetch the IMAGE
	$IMG = $row['img'];
	if(empty($row['img'])) {
		$IMG = 'null';
	}

	// fetch the GIF
	$GIF = $row['gif'];
	if(empty($row['gif'])) {
		$GIF = 'null';
	}

	$dataTypeString = 'data-type="default"';

	// fetch the display style
	$staticWide = $row['static_wide'];
	if($staticWide == 1) {
		$dataTypeString = 'data-type="static-wide"';
	}

	$properLink = true;
	$properLinkClass = '';
	if($row['slur'] == "#" or $row['slur'] == '') {
		$properLink = false;
		$properLinkClass = 'noProperLink';
	}

	if($properLink) {
		echo '<a href="' . $row['slur'] . '" class="horizontalBigLink">';
	}

	$leftRightClass = 'leftText';
	if($gameContainerIncrementer % 2 == 1) {
		$leftRightClass = 'rightText';
	} 

	$customStyle = '';
	if($row['tinyHeight'] == 1) {
		$customStyle = 'style="height:30vw"';
	}

		echo '<div class="horizontalContainer ' . $leftRightClass . '" ' . $dataTypeString . ' data-gif="' . $GIF . '" data-img="' . $IMG . '" ' . $customStyle . ' >';
			echo '<div class="horizontalContainerTransition"></div>';
			// odd entries get their text on the right, which means their margin is on the left (BEFORE)
			if($gameContainerIncrementer % 2 == 1) {
				echo '<div class="textMargin"></div>';
			} 

			echo '<div class="horizontalContent">';
				echo '<div class="horizontalContentText ' . $properLinkClass . '">';
					echo '<h1>' . $row['title'] . '</h1>'; 
					
					if($properLink) {
						echo '<p>' . $row['short_desc'] . '</p>';
						echo '<div class="buttonLink transparent">Go to game page</div>';
					} else {
						echo $row['short_desc'];
					}
				echo '</div>';
			echo '</div>';
			
			// even (as in "not-odd") entries get their text on the left, which means their margin is on the right (AFTER)
			if($gameContainerIncrementer % 2 == 0) {
				echo '<div class="textMargin"></div>';
			}
		echo '</div>';

	if($properLink) {
		echo '</a>';
	}


	$gameContainerIncrementer += 1;
}

/*
 * Similar function for displaying a non-game container (which is much simpler and has less nodes/components)
 */
function displayHorizontalNonGame($link, $title, $desc, $customClass = null) {
	global $gameContainerIncrementer;

	if (null === $customClass) {
        $customClass = "";
    }

	$properLink = true;
	if($link == "#") {
		$properLink = false;
	}

	$paginationClass = '';
	if($title == 'Pagination') {
		$paginationClass = 'paginationContainer';
	}

	if($properLink) {
		echo '<a href="' . $link . '" class="horizontalBigLink">';
	}

		echo '<div class="horizontalContainer ' . $paginationClass . ' ' . $customClass . '" data-gif="null" data-img="null">';
			echo '<div class="horizontalContent">';
				echo '<div class="horizontalContentText nonGameContainer">';
						echo '<h1>' . $title . '</h1>';
						echo $desc;
				echo '</div>';
			echo '</div>';
		echo '</div>';
	
	if($properLink) {
		echo '</a>';	
	}

	$gameContainerIncrementer += 1;


}

// LINKS:
// https://designbump.com/23-brilliant-indie-game-development-studio-websites/
// http://www.rleonardi.com/

?>

<?php	
	/*
	 * Canonical urls
	 */
	$temp_url = $_SERVER['REQUEST_URI'];
	$full_canonical_url = "http://pandaqi.com" . $temp_url;
?>


<!DOCTYPE html>
	<head>
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=UA-76769932-1"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'UA-76769932-1');
		</script>

		<link rel="canonical" href="<?php echo $full_canonical_url; ?>" />
				

		<script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>

		<!-- FOR LOCAL TESTING... -->
		<?php

		if(false) {

		?>
			<base href="/Pandaqi/">
			<link rel="stylesheet" type="text/css" href="theme/style.css?<?php echo date('l jS \of F Y h:i:s A'); ?>" />
			<script src="questSystem.js?<?php echo date('l jS \of F Y h:i:s A'); ?>"></script>
			<script src="colorPaletteFunctions.js?<?php echo date('l jS \of F Y h:i:s A'); ?>"></script>

		<?php

		}

		?>

		<!-- FOR DEPLOYMENT -->
		<base href="/" />
		<link rel="stylesheet" type="text/css" href="theme/style.css" />
		<script src="questSystem.js"></script>
		<script src="colorPaletteFunctions.js"></script>

		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="icon" type="image/png" href="theme/favicon.png" />

		<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet"> 
		<link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Dosis:400,800" rel="stylesheet">

		<link rel="manifest" href="manifest.json?v=2" />

		<script src="registerPWA.js"></script>
