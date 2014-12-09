/**
 * @author monkindey
 * @date 2014.12.6
 * @decription 保持分类能力不变的一种连续属性离散化方法
 * http://wenku.baidu.com/view/17de64f69e314332396893b5.html
 * 1. 连续属性离散化过程即划分子区间的过程
 * 2. javascript replace 使用
 * 3. javascript comment removal
 * 4. semi naive scale
 * (1). 生成候选断点集
 * (2). 空间区域赋值
 * (3). 剔除冗余断点
 * (4). 离散化
 */

! function() {
	// 去掉注释
	var removeComment = function(text) {
		text = text || '';
		var re = /((\/\*[\s\S]*?\*\/)|(\/\/.*(?:\r|\n|$)))/mg
		text = text.replace(re, ' ');
		return text;
	};

	// others'
	// http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
	function removeJsComments(code) {
		return code.replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
			.replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
	}

	var getColumn = function(students, property) {
		var column = [];
		students.forEach(function(student) {
			for (var p in student) {
				if (p == property) {
					column.push(student[p]);
				}
			}
		});
		// 递增排序
		column.sort(function(a, b) {
			return a - b;
		});
		return column;
	};

	var naiveScale = function() {
		var propertyOfStudent = ['gpa', 'innovative', 'social', 'morality'];
		Ext.Ajax.request({
			url: 'data/scholarship.json',
			success: function(resp) {
				var students = Ext.decode(removeComment(resp.responseText)).students;
				var column = [];
				column = getColumn(students, propertyOfStudent[0]);
				console.dir(column);
			}
		});
	};

	module.exports = naiveScale;
}()