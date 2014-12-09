(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author monkindey
 * @date 2014.11.28
 * @description ID3算法
 * 一、决策树组成部分
 * 1. 决策节点(待分类对象的某个属性)
 * 2. 分支
 * 3. 叶子节点
 * ---------------------------------------------------------------------
 * 二、决策树如何构建
 * 1. 决策树的属性选择(让决策树最简)选择信息增益最大的属性产生决策树节点
 * 2. 递归创建分支
 * ---------------------------------------------------------------------
 * 三、概念了解
 * 1. 信息熵(entropy)
 * 熵越大，表示样本对目标属性就越混乱
 * 2. 信息增益
 * 以某个属性划分前样本数据集的不纯程度和划分后的不纯程度的差值
 * 信息增益越大，说明使用属性A划分后的样本子集越纯
 */

! function(DOC) {
	'use strict';
	// HELPER
	Math.log2 = Math.log2 || function(val) {
		return Math.log(val) / Math.log(2);
	}

	// 目标属性
	var TARGET = 'obtain';
	var TREE = [];
	var RESULT = [];

	// 获取对象属性个数
	var getOwnPropertyCount = function(obj) {
		return Object.getOwnPropertyNames(obj).length;
	}

	// 获取样本集的各个属性与其对应的值
	var getProperty = function(samples) {
		var property = {};
		samples.forEach(function(sample) {
			for (var p in sample) {
				if (sample.hasOwnProperty(p) && p != TARGET) {
					if (property[p]) {
						if (!~property[p].indexOf(sample[p])) {
							property[p].push(sample[p]);
						}
					} else {
						property[p] = [];
						property[p].push(sample[p]);
					}
				}
			}
		});
		return property;
	}

	// 获取训练集的信息熵
	var getEntropy = function(samples) {
		// samples 是一个样本集(训练集), play是目标属性
		var obj = {};
		var entropy = 0;
		var sum = samples.length;
		var probability;

		samples.forEach(function(sample, index) {
			var count = obj[sample[TARGET]];
			if (count) {
				obj[sample[TARGET]] ++;
			} else {
				obj[sample[TARGET]] = 1;
			}
		});

		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				probability = obj[p] / sum;
				entropy += -(probability * Math.log2(probability))
			}
		}
		return entropy;
	};

	// 划分子集
	var divideSubset = function(set, prop) {
		var subsets = {};
		var subset;
		set.forEach(function(el) {
			subset = subsets[el[prop]];
			if (subset) {
				subsets[el[prop]].push(el);
			} else {
				subsets[el[prop]] = [];
				subsets[el[prop]].push(el);
			}
		});
		return subsets;
	};

	// 获取信息增益
	var getInfoGain = function(set, subsets, setLength) {
		var entropyOfSubsets = 0;
		subsets.forEach(function(entropy) {
			entropyOfSubsets += entropy['len'] / setLength * entropy['entropy'];
		});
		return +(set - entropyOfSubsets).toFixed(3);
	};

	// 获取样本子集
	var getSubSample = function(set, prop, value) {
		var data = [];
		set.forEach(function(el) {
			if (el[prop] === value) {
				delete el[prop];
				data.push(el);
			}
		});
		return data;
	};

	// 获取信息增益最大值
	var getMax = function(arr) {
		return Math.max.apply(Math, arr);
	};

	// 获取子集的信息熵
	var getEntropyOfSubsets = function(subsets) {
		var entropyOfSubsets = [];
		var i = 0;
		for (var p in subsets) {
			if (subsets.hasOwnProperty(p)) {
				entropyOfSubsets[i++] = {
					entropy: getEntropy(subsets[p]),
					len: subsets[p].length
				}
			}
		}
		return entropyOfSubsets;
	};

	var recursion = function(sampleSet) {
		// 获取样本集的信息熵
		var entropy = getEntropy(sampleSet);
		// 样本集的各个属性
		var property = getProperty(sampleSet);
		var size = sampleSet.length;
		var infoGains = [],
			propGainsMap = {},
			branchNode;

		// 样本sampleSet同属于一个类别
		// 如果同一个类别的话entropy为0
		if (!entropy) {
			TREE.push({
				text: sampleSet[0][TARGET],
				type: 'leaf'
			});
			return;
		}

		// 计算子集的信息增益
		for (var prop in property) {
			var subsets = divideSubset(sampleSet, prop);
			var entropyOfSubsets = getEntropyOfSubsets(subsets);
			var gain = getInfoGain(entropy, entropyOfSubsets, size);
			infoGains.push(gain);
			propGainsMap[gain] = prop;
		}

		// 找出信息增益最大的属性
		branchNode = propGainsMap[getMax(infoGains)];
		var branchNodeProp = property[branchNode];
		var index = TREE.push({
			text: branchNode,
			type: 'node'
		});

		branchNodeProp && branchNodeProp.forEach(function(prop) {
			TREE.push({
				text: prop,
				parent: index - 1,
				type: 'label'
			});
			// 递归
			recursion(getSubSample(sampleSet, branchNode, prop));
		});
	};

	var generateAlphabet = function() {
		var alphabet = [];
		for (var character = 65; character < 91; character++) {
			alphabet.push(String.fromCharCode(character));
		}
		return alphabet;
	};

	var render = function(tree) {
		var name = generateAlphabet();
		var treeHTML = 'graph TD;\n';
		var syntax = {
			'node': '[text]',
			'label': '|text|',
			'leaf': '(text)'
		};
		tree.forEach(function(el, idx, tree) {
			if (el.type === 'label') {
				var from = tree[el.parent];
				var to = tree[idx + 1];
				var fromSyntax = syntax[from.type].replace(/text/, function($1) {
					return from[$1];
				});

				var labelSyntax = syntax[el.type].replace(/text/, function($1) {
					return el[$1];
				});

				var toSyntax = syntax[to.type].replace(/text/, function($1) {
					return to[$1];
				});

				treeHTML += name[el.parent] + fromSyntax + '-->' + labelSyntax + name[idx + 1] + toSyntax + ';\n';
			}
		});

		var mermaid = DOC.createElement('div');
		mermaid.className = 'mermaid';
		mermaid.innerHTML = treeHTML;
		Ext.getDom('tree').appendChild(mermaid);
		var e = new CustomEvent('show');
		DOC.dispatchEvent(e);
		console.log(treeHTML);
	};

	var drawArrow = function(canvas) {
		canvas.beginPath();
		canvas.moveTo(30, 40);
		canvas.lineTo(70, 70);
		canvas.stroke();
	};

	var drawTriangle = function(canvas, from) {
		var x = from.x,
			y = from.y;
		canvas.save();
		canvas.rotate(-5 * Math.PI / 180);
		canvas.beginPath();
		canvas.moveTo(x, y);
		canvas.lineTo(x - 5, y - 2);
		canvas.lineTo(x, y + 10);
		canvas.lineTo(x + 5, y - 2);
		canvas.lineTo(x, y);
		canvas.closePath();
		canvas.stroke();
		canvas.fillStyle = '#339900';
		canvas.fill();
		canvas.restore();
	};

	// 获取某个节点的所有分支，便于遍历
	var getBranches = function(node) {
		var branches = [];
		var index = TREE.indexOf(node);
		TREE.forEach(function(tree) {
			if (tree.type == 'label' && tree.parent == index) {
				branches.push(tree);
			}
		});
		return branches;
	};

	// 树的递归遍历
	var traverse = function(tree, test) {
		var branches = [];
		if (tree.type == 'node') {
			var text = test[tree.text];
			branches = getBranches(tree);
			branches.forEach(function(branch) {
				if (branch.text == text) {
					traverse(TREE[TREE.indexOf(branch) + 1], test);
				}
			});
		} else if (tree.type == 'leaf') {
			RESULT.push({
				text: tree.text,
				right: test.obtain == tree.text
			});
			return;
		}
	};

	var predict = function() {
		Ext.Ajax.request({
			url: 'data/students.json',
			success: function(resp) {
				// 通过Ajax获取训练集/样本集
				var students = Ext.decode(resp.responseText).test;
				students.forEach(function(test) {
					traverse(TREE[0], test);
				});
				renderResult(RESULT);
			}
		});
	};

	var renderResult = function(result) {
		var ol = document.createElement('ol');
		var html = '';
		console.dir(result);
		var resultElement = document.getElementById('result');
		resultElement.querySelector('h3').style.display = 'block';
		result.forEach(function(el) {
			var pic = el.right ? 'right.png' : 'wrong.png';
			var title = el.right ? '预测对了' : '预测错了';
			html += '<li>' + el.text + '<img src="assets/image/' + pic + '" title=' + title + '></li>';
		});
		ol.innerHTML += html;
		resultElement.appendChild(ol);
	};



	// 主要执行的代码
	Ext.Ajax.request({
		url: 'data/students.json',
		success: function(resp) {
			// 通过Ajax获取训练集/样本集
			var students = Ext.decode(resp.responseText).students;
			recursion(students);
		}
	});

	// 监听afterShow事件
	document.addEventListener('afterShow', function() {
		var config = {
			'root': 'test',
			'predict': true
		};
		var playerGrid = require('./grid.js')(config);
		playerGrid.render('predict');
	}, false);

	// module.exports = init;
	module.exports = {
		render: function() {
			render(TREE);
		},
		predict: function() {
			predict();
		}
	}
}(document);
},{"./grid.js":2}],2:[function(require,module,exports){
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
},{"./ID3.js":1}],3:[function(require,module,exports){
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
},{"./grid.js":2}]},{},[3]);
