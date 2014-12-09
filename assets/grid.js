/**
 * @author monkindey
 * @date 2014.12.6
 * @description 学生情况显示
 */
(function() {
	var displayDecisionTree = require('./ID3.js').render;
	var predictResult = require('./ID3.js').predict;
	var store = null;
	// 不同等级有不同的样式
	var rank = function(value, metadata) {
		if (value === 'A' || value === 'pass' || value === 'yes') {
			metadata.css = 'best';
		} else if (value === 'B') {
			metadata.css = 'better';
		} else if (value === 'C' || value === 'no') {
			metadata.css = 'bad';
		}
		return value;
	};

	var configureStore = function(config) {
		store = new Ext.data.JsonStore({
			url: 'data/students.json',
			root: config.root,
			fields: ['grade', 'igrade', 'sgrade', 'morality', 'obtain']
		});
		store.load();
	};

	var createGrid = function(config) {
		var predict = config.predict;
		var btnText = predict ? '开始预测' : '查看决策树';
		return new Ext.grid.GridPanel({
			store: store,
			height: predict ? 230 : 400,
			width: '100%',
			frame: true,
			title: predict ? '网络三班综合测评测试用例' : '网络三班综合测评汇总',
			headerCfg: {
				cls: 'grid-header'
			},
			columns: [{
				header: '<span class="grid-hd grade">学业成绩(grade)</span>',
				align: 'center',
				renderer: rank
			}, {
				header: '<span class="grid-hd igrade">创新实践(igrade)</span>',
				align: 'center',
				renderer: rank
			}, {
				header: '<span class="grid-hd sgrade">社会实践(sgrade)</span>',
				align: 'center',
				renderer: rank
			}, {
				header: '<span class="grid-hd morality">品德表现(morality)</span>',
				align: 'center',
				renderer: rank
			}, {
				header: '<span class="grid-hd obtain">奖学金</span>',
				width: 60,
				renderer: rank
			}],
			viewConfig: {
				forceFit: true
			},
			bbar: ['->', {
				xtype: 'button',
				text: '<span class="btn-view">' + btnText + '</span>',
				listeners: {
					'click': {
						fn: function() {
							predict ? predictResult() : displayDecisionTree();
						},
						single: true
					}
				}
			}]
		});
	};

	module.exports = function(config) {
		configureStore(config);
		return createGrid(config);
	};

})()