<?php

require 'header.php';

?>
		<main>

		<?php

		// first, grab the page number
		// if it's not set, default to page1
		$page_num = $_GET['pagenum'];

		if(!isset($_GET['pagenum'])) {
			$page_num = 1;
		}

		// then get the offset (for MySQL query) depending on page num
		$no_of_records_per_page = 5;
		$offset = ($page_num-1) * $no_of_records_per_page; 

		// check the total number of pages
		// (this makes sure we don't add a button for "next page" if it isn't needed)
		$result = $conn->query("SELECT COUNT(*) FROM games");
		$total_rows = mysqli_fetch_array($result)[0];
		$total_pages = ceil($total_rows / $no_of_records_per_page);

		// finally, get the results from the table that fit within our range
		$result = $conn->query("SELECT * FROM games ORDER BY priority DESC LIMIT $offset, $no_of_records_per_page "); 

		// display those results as nice horizontal containers
		while($row = $result->fetch_assoc()) {
			displayHorizontalContainer($row);
		}

		// at the bottom of the page, display the pagination
		// first, build the whole pagination HTML
		$paginationString = '<p>Use the buttons below to navigate to different pages in the game list.</p><div class="pagination">';

		$paginationString .= '<div><a href="games/1" class="buttonLink">First page</a></div>';

		if($page_num > 1) {
			$paginationString .= '<div><a href="games/' . ($page_num - 1) . '" class="buttonLink">&lt;&lt; Previous</a></div>';
		} else {
			$paginationString .= '<div>No previous page :(</div>';
		}

		if($page_num < $total_pages) {
			$paginationString .= '<div><a href="games/' . ($page_num + 1) . '" class="buttonLink">Next &gt;&gt;</a></div>';
		} else {
			$paginationString .= '<div>No next page :(</div>';
		}

		$paginationString .= '<div><a href="games/' . $total_pages . '" class="buttonLink">Last page</a></div>';

		// this is a panda collectible!
		$paginationString .= '<div class="gameObject" data-type="panda" data-id="3" data-top="-80px"></div>';
 
		$paginationString .= '</div>';

		// secondly, actually display it
		displayHorizontalNonGame("#", "Pagination", $paginationString);

		?>

		</main>

<?php

require 'footer.php';

?>

		