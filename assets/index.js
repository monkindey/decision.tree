/**
 * @author monkindey
 * @date 2014.12.6
 * @description 项目主要逻辑文件
 *
 * http://www.scimao.com/read/1558454
 */

! function() {
	var config = {
		'root': 'students',
		'predict': false
	};
	var playerGrid = require('./grid.js')(config);
	playerGrid.render('grid');
}()