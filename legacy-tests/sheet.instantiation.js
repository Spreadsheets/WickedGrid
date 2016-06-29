tf.test('Sheet Instantiation: Menu position', function() {
	var
		menuLeft = $('<a>left</a>'),
		menuRight = $('<a>right</a>'),
		div = '<div>\
	<table>\
		<tr>\
			<td>1</td>\
			<td>2</td>\
			<td>3</td>\
			<td>4</td>\
			<td>5</td>\
		</tr>\
		<tr>\
			<td>6</td>\
			<td>7</td>\
			<td>8</td>\
			<td>9</td>\
			<td>10</td>\
		</tr>\
		<tr>\
			<td>11</td>\
			<td>12</td>\
			<td>13</td>\
			<td>14</td>\
			<td>15</td>\
		</tr>\
		<tr>\
			<td>16</td>\
			<td>17</td>\
			<td>18</td>\
			<td>19</td>\
			<td>20</td>\
		</tr>\
		<tr>\
			<td>21</td>\
			<td>22</td>\
			<td>23</td>\
			<td>24</td>\
			<td>25</td>\
		</tr>\
	</table>\
</div>',
		$div = $(div)
			.sheet({
				menuLeft: menuLeft,
				menuRight: menuRight
			}),
		jS = $div.getSheet();

	jS.kill();

	jS = $div
		.html(div)
		.sheet({
			menuLeft: menuLeft,
			menuRight: menuRight
		})
		.getSheet();

	tf.assertEquals(jS.obj.menuLeft()[0], menuLeft[0], 'Menu is same');
	tf.assertEquals($div[0].firstChild.firstChild.firstChild.firstChild.firstChild, menuLeft[0], 'Menu is in right location');

	jS.kill();
});