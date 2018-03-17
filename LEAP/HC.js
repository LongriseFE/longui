String.prototype.replaceall = function(rstr, rs)
{
	if (rstr == null)
		return this;
	if (rs == null)
		rs = '';

	if (rstr.length == 1 && rstr == '\\')
	{
		rstr = '\\\\';
	}

	try
	{
		return this.replace(new RegExp(rstr,"gm"), rs);
	}
	catch(e)
	{
		if (rstr == null)
			return this;
		if (rs == null)
			rs = '';

		var str2 = this;
		str = '';

		while(str2.indexOf(rstr) != -1)
		{
			k = str2.indexOf(rstr);
			str2 = str2.replace(rstr, rs);
			str += str2.substr(0, k + rs.length);
			str2 = str2.substr(k + rs.length);

		}
		str += str2;

		return str;
	}
};
String.prototype.trim = function()
{
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
(function () {
	'use strict';
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};
		this.trackingClick = false;

		this.trackingClickStart = 0;

		this.targetElement = null;

		this.touchStartX = 0;

		this.touchStartY = 0;

		this.lastTouchIdentifier = 0;

		this.touchBoundary = options.touchBoundary || 10;

		this.layer = layer;

		this.tapDelay = options.tapDelay || 200;

		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}
		
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		if (typeof layer.onclick === 'function') {

			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);

	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe':
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};

	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};

	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};

	FastClick.prototype.focus = function(targetElement) {
		var length;

		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'email') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};

	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};

	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};

	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;
		
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	FastClick.prototype.findControl = function(labelElement) {

		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};

	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};

	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};
	
	FastClick.prototype.onMouse = function(event) {

		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		if (!event.cancelable) {
			return true;
		}

		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				event.propagationStopped = true;
			}

			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		return true;
	};

	FastClick.prototype.onClick = function(event) {
		var permitted;

		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}
		
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		if (!permitted) {
			this.targetElement = null;
		}

		return permitted;
	};


	
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};

	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};
	
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());
function StringBuffer(str)
{
	this._strings_ = [];
	if (str != null)
		this._strings_[0] = str;
}
/**
 * 添加string
 * 
 * @param {String}
 *            str
 */
StringBuffer.prototype.append = function(str)
{
	if (str == null)
		return this;
	this._strings_.push(str);
	return this;
}
/**
 * 
 * @return {}
 */
StringBuffer.prototype.clear = function()
{
	this._strings_.clear();
	return this;
}
/**
 * 返回字符处理结果
 * 
 * @return {String} 字符
 */
StringBuffer.prototype.toString = function(split)
{
	if (split == null)
		split = '';
	return this._strings_.join(split);
}
Array.prototype.contains = function(item)
{
	return this.indexof(item) > -1;
}
/**
 * @param {}
 *            val
 */
Array.prototype.add = function(val)
{
	this[this.length] = val;
}
/**
 * 
 * @param {} val
 */
Array.prototype.addall = function(val)
{
	if (val == null)
		return;
	var l = val.length;
	if (l != null && l > 0)
	{
		for(var i = 0;i < l;i++)
		{
			this[this.length] = val[i];
		}
	}
}
/**
 * 
 * @param {} arr1
 * @param {} arr2
 * @return {}
 */
Array.concat = function(arr1, arr2)
{
	if (arr1 != null && arr2 != null)
	{
		var ret = [];
		var l2 = arr1.length;
		if (l2 != null && l2 > 0)
		{
			for(var i = 0;i < l2;i++)
			{
				ret[i] = arr1[i];
			}
		}

		var l = arr2.length;
		if (l != null && l > 0)
		{
			for(var i = 0;i < l;i++)
			{
				ret[l2 + i] = arr2[i];
			}
		}
		return ret;
	}
	else if (arr1 != null)
		return arr1;
	else return arr2
}
/**
 * @param {}
 *            o
 * @param {}
 *            i
 * @return {}
 */
Array.prototype.insert = function(o, i)
{
	if (i == undefined || isNaN(i))
		i = 0;

	var l = this.length;
	var t = new Object();
	var ret = this.slice(0, i).concat(t).concat(this.slice(i, l));
	ret[i] = o;
	try
	{
		return ret;
	}
	finally
	{
		o = null;
	}
}
/**
 * @param {}
 *            o
 * @param {}
 *            o2
 * @return {}
 */
Array.prototype.insertBefore = function(o, o2)
{
	var i = this.indexof(o2)
	if (i == -1)
		return this.concat(o2)
	return this.insert(o, i)
}
/**
 * @param {}
 *            dx
 * @param {}
 *            newvalue
 */
Array.prototype.replace = function(dx, newvalue)
{
	this[dx] = newvalue;
}
/**
 * 
 */
Array.prototype.clear = function()
{
	this.length = 0;
}
/**
 * @param {}
 *            item
 * @return {}
 */
Array.prototype.indexof = function(item)
{
	if (item == null) { return -1; }

	var l = this.length;
	for(var i = 0;i < l;i++)
	{
		if (this[i] == item) { return i; }
	}

	return -1;
}
if (!Array.prototype.hasOwnProperty("indexOf"))
{
	Array.prototype.indexOf = Array.prototype.indexof;
}
/**
 * @param {}
 *            dx
 * @return {Boolean}
 */
Array.prototype.removeindex = function(dx)
{
	if (isNaN(dx) || dx > this.length) { return false; }
	this.splice(dx, 1);
}
/**
 * @param {}
 *            item
 */
Array.prototype.remove = function(item)
{
	var index = this.indexof(item);
	if (index > -1)
		this.removeindex(index);
		// delete this[index];
	}

var hashtable = function()
{
	this.keys = {};
}
hashtable._k_ = "key";
/**
 * 检验是否包含指定key
 * 
 * @param {Object}
 *            key
 * @return {Boolean} 检验结果
 */
hashtable.prototype.contains = function(key)
{
	if (this.count == 0)
		return false;
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	return this.keys.hasOwnProperty(key);
}
/**
 * 包含的key value对数量
 * 
 * @type Number
 */
hashtable.prototype.count = 0;
/**
 * 包含的key value对数量
 * @return {}
 */
hashtable.prototype.size = function()
{
	return this.count;
}
hashtable.prototype.getkey = function(key)
{
	if (key.startWith(hashtable._k_ + '_'))
		return key.substring(4);
}
/**
 * 添加一个key value对
 * 
 * @param {}
 *            key
 * @param {}
 *            value
 */
hashtable.prototype.add = function(key, value)
{
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	if (this.contains(key))
		return this;
	this.keys[key] = value;
	this.count++;
	return this;
}

/**
 * 根据key获取value
 * 
 * @param {}
 *            key
 * @return {}
 */
hashtable.prototype.getvalue = function(key)
{
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	return this.keys[key];
}

/**
 * 根据key替换指定的value
 * 
 * @param {}
 *            key
 * @param {}
 *            newvalue
 */
hashtable.prototype.replace = function(key, newvalue)
{
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	if (this.contains(key))
		this.keys[key] = newvalue;
	return this;
}

/**
 * 根据key删除key value对
 * 
 * @param {}
 *            key
 */
hashtable.prototype.remove = function(key)
{
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	if (!this.contains(key))
		return false;
	try
	{
		this.count = this.count - 1;
		this.keys[key] = null;
	}
	finally
	{
		delete this.keys[key];
	}
	return this;
}
/**
 * 
 * @param {} key
 * @return {}
 */
hashtable.prototype.saferemove = function(key)
{
	if (key != null && !(typeof key == 'string' && key.startsWith(hashtable._k_)))
		key = 'key_' + key;
	delete this.keys[key];
	this.count--;
	return this;
}

/**
 * 清除所有项
 */
hashtable.prototype.clear = function()
{
	this.keys = null;
	/**
	 * 健的数组
	 */
	this.keys = {};
	this.count = 0;
}
/**
 * 
 * @return {}
 */
hashtable.prototype.clone = function()
{
	var _keys = this.keys;
	var ret = new hashtable();
	for(var k in _keys)
	{
		ret.add(k, this.getvalue(k));
	}
	return ret;
}
var HCBase = new Object();
HCBase.isIE = null;

(function()
{
	if (document.all)
		HCBase.isIE = true;
	else HCBase.isIE = false;
})();


DelegateUIEventManager = new Object();
DelegateUIEventManager.a = new Array();
DelegateUIEventManager.b = new hashtable();
DelegateUIEventManager.c = new Array();
DelegateUIEventManager.d = new Array();
DelegateUIEventManager.init = function()
{
	DelegateUIEventManager.c.add('click');
	DelegateUIEventManager.c.add('touchstart');
	DelegateUIEventManager.c.add('touchmove');
	DelegateUIEventManager.c.add('touchend');
	DelegateUIEventManager.c.add('touchclick');

	DelegateUIEventManager.d.add('touchclick');
}();
DelegateUIEventManager.u = "_uuid";
DelegateUIEventManager.e = "___devents";
DelegateUIEventManager.addEvent = function(element, type, fun, args, domain, priority)
{
	// if (element[DelegateUIEventManager.u] == null)
	// {
	// element[DelegateUIEventManager.u] = UUID.cID();
	// }

	var es = element[DelegateUIEventManager.e];
	if (es == null)
		es = element[DelegateUIEventManager.e] = new hashtable();

	if (!priority)
		priority = 50;

	var est = es.getvalue(type);
	if (est == null)
	{
		est = [];
		es.add(type, est);
	}
	var k =
	{
		arg			: args,
		domain		: domain,
		fn			: fun,
		priority	: priority
	};

	{
		var hl = est.length;
		var hasi = false;
		if (est && hl > 0)
		{
			for(var i = hl - 1;i > -1;i--)
			{
				var cur = est[i];
				var cp = cur.priority;
				if (cp < priority)
				{
					if (i < hl - 1)
						est = est.insert(k, i + 1);
					else est.add(k);

					hasi = true;
					break;
				}
			}
		}
		if (!hasi)
			est = est.insert(k, 0);
		es.replace(type, est);
	}

	//	es.replace(type, est.insert(k, 0));

	if (!DelegateUIEventManager.a.contains(type))
	{
		if (!DelegateUIEventManager.d.contains(type))
			UIEventManager.addEvent(document.body, type, DelegateUIEventManager.handleEvent);
		DelegateUIEventManager.a.add(type);
	}

	k = es = est = fun = args = element = type = domain = null;
}
DelegateUIEventManager.removeEvent = function(element, type, fun)
{
	if (element != null)
	{
		if (type == null && fun == null)
		{
			element[DelegateUIEventManager.e] = null;
			element.removeAttribute(DelegateUIEventManager.e);
		}
		else if (type != null && fun != null)
		{
			var es = element[DelegateUIEventManager.e];
			if (es == null)
				return;
			var est = es.getvalue(type);
			if (est != null)
			{
				var l = est.length;
				for(var i = l - 1;i > -1;i--)
				{
					var def = est[i];
					if (def.fn == fun)
					{
						est.remove(def);
					}
				}
			}
			es = est = null;
		}
		else if (type == null && fun != null)
		{

		}
		else if (type != null && fun == null)
		{
			var es = element[DelegateUIEventManager.e];
			if (es != null)
				es.remove(type);
		}
	}
}
DelegateUIEventManager.handleEvent = function(eventarg)
{
	var e = eventarg.e;
	var element = e.target || e.srcElement;
	var type = e.type;
	if (eventarg.type)
		type = eventarg.type;

	var es = element[DelegateUIEventManager.e];
	if (es == null)
		return;
	var est = es.getvalue(type);
	if (est != null)
	{
		var l = est.length;
		for(var i = l - 1;i > -1;i--)
		{
			var v = null;
			try
			{
				v = est[i];
			}
			catch(e)
			{
			}
			if (v == null)
				continue;
			var arg =
			{
				caller	: element,
				e		: e,
				arg		: v.arg,
				type	: type
			};

			var domain = v.domain;
			if (domain == null)
				domain = element;
			try
			{
				if (v.fn.call(domain, arg) == false)
					break;
			}
			catch(err)
			{
			}
			finally
			{
				v = arg = domain = null;
			}
		}
	}
	es = est = element = e = eventarg = null;
}

ElementEventManager = new Object();
ElementEventManager.a = new hashtable();
ElementEventManager.e = "__eevents";
ElementEventManager.addManagedEventType = function(controlType, type)
{
	if (ElementEventManager.a.contains(controlType))
		ElementEventManager.a.getvalue(controlType).add(type);
	else
	{
		var arr = new Array();
		arr.add(type);
		ElementEventManager.a.add(controlType, arr);
	}
}
ElementEventManager.addEvent = function(element, type, fun, args, domain, priority)
{
	if (element == null || type == null || fun == null)
		return;

	if (!priority)
		priority = 50;

	var es = element[ElementEventManager.e];
	if (es == null)
		es = element[ElementEventManager.e] = new hashtable();

	var est = es.getvalue(type);
	if (est == null)
	{
		est = [];
		es.add(type, est);
	}

	var k =
	{
		arg			: args,
		domain		: domain,
		fn			: fun,
		priority	: priority
	};

	{
		var hl = est.length;
		var hasi = false;
		if (est && hl > 0)
		{
			for(var i = hl - 1;i > -1;i--)
			{
				var cur = est[i];
				var cp = cur.priority;
				if (cp < priority)
				{
					if (i < hl - 1)
						est = est.insert(k, i + 1);
					else est.add(k);

					hasi = true;
					break;
				}
			}
		}
		if (!hasi)
			est = est.insert(k, 0);
		es.replace(type, est);
	}

	//	es.replace(type, est.insert(k, 0));

	k = es = est = fun = args = element = type = domain = null;
}
ElementEventManager.removeEvent = function(element, type, fun)
{
	if (element != null)
	{
		if (type == null && fun == null)
		{
			element[ElementEventManager.e] = null;
			element.removeAttribute(ElementEventManager.e);
		}
		else if (type != null && fun != null)
		{
			var es = element[ElementEventManager.e];
			if (es && es.contains(type))
			{
				var evs = es.getvalue(type);
				if (evs != null)
				{
					var l = evs.length;
					for(var i = l - 1;i > -1;i--)
					{
						if (evs[i].fn == fun)
						{
							evs.remove(evs[i]);
						}
					}
					if (evs.length == 0)
						es.remove(type);
					if (es.count == 0)
					{
						element[ElementEventManager.e] = null;
						element.removeAttribute(ElementEventManager.e);
					}
					evs = null;
				}
			}
			es = null;
		}
		else if (type == null && fun != null)
		{

		}
		else if (type != null && fun == null)
		{
			var es = element[ElementEventManager.e];
			if (es != null)
				es.remove(type);
			es = null;
		}
		element = fun = type = null;
	}
}
ElementEventManager.handleEvent = function(element, type, arg)
{
	var es = element[ElementEventManager.e];
	if (es == null)
		return;
	var est = es.getvalue(type);
	if (est != null)
	{
		var l = est.length;
		for(var i = l - 1;i > -1;i--)
		{
			var v = null;
			try
			{
				v = est[i];
			}
			catch(E)
			{
			}
			if (v == null)
				continue;
			var _arg =
			{
				caller	: element,
				arg		: v.arg,
				arg2	: arg,
				type	: type
			};

			var domain = v.domain;
			if (domain == null)
				domain = element;
			try
			{
				if (v.fn.call(domain, _arg) == false)
					break;
			}
			catch(err)
			{
			}
			finally
			{
				v = _arg = domain = null;
			}
		}
	}
	es = est = element = arg = null;
}

var UIEventManager = new Object();
UIEventManager.o = 'on';
UIEventManager.u = '_uuid';
UIEventManager._e = '___events';
UIEventManager._s = new hashtable();
UIEventManager.addEvent = function(element, type, fun, args, domain, priority)
{
	if (fun == null)
		return;

	if (!priority)
		priority = 50;

	var handlers = null;
	var arg = args;
	var pre = UIEventManager.o;
	try
	{
		if (element && element.hasOwnProperty && element.hasOwnProperty('setAttribute'))
			element.setAttribute('__iuem', '1');

		if (!element.events)
			element.events = [];
		handlers = element.events[type];
		if (!handlers)
		{
			handlers = element.events[type] = [];
			if (element[pre + type])
			{
				handlers[0] = element[pre + type];
			}
		}

		{
			var hl = handlers.length;
			var hasi = false;
			if (handlers && hl > 0)
			{
				for(var i = hl - 1;i > -1;i--)
				{
					var cur = handlers[i];
					var cp = cur[3];
					if (cp < priority)
					{
						if (i < hl - 1)
							handlers = handlers.insert([fun,domain,arg,priority], i + 1);
						else handlers.add([fun,domain,arg,priority]);

						hasi = true;
						break;
					}
				}
			}
			if (!hasi)
				handlers = handlers.insert([fun,domain,arg,priority], 0);
			element.events[type] = handlers;
		}

		if (element[pre + type] && element[pre + type] != UIEventManager.handleEvent)
		{
			var tfn = element[pre + type];
			element.events[type] = handlers.insert([tfn,element,null]);
			element[pre + type] = null;
		}

		if (!element[pre + type])
		{
			if (UIEventManager._s.contains(type) && element.addEventListener)
				element.addEventListener(type, UIEventManager.handleEvent);
			element[pre + type] = UIEventManager.handleEvent;
			var _d = [type];
			element[UIEventManager._e] = _d;
			_d = null;
		}
		else
		{
			var _t = element[UIEventManager._e];
			if (_t && !_t.contains(type))
				_t.add(type);
			_t = null;
		}
		// if (!element[UIEventManager.u])
		// {
		// element[UIEventManager.u] = UUID.cID();
		// }
	}
	finally
	{
		handlers = null;
		element = null;
		arg = null;
	}
}
UIEventManager.removeEvent = function(element, type, fun)
{
	var _t = element['___events'];
	var pre = UIEventManager.o;

	if (type == null)
	{
		if (element.events && _t)
		{
			var l = _t.length;
			for(var i = 0;i < l;i++)
			{
				var type = _t[i];
				element.events[type].clear();
				element[pre + type] = null;
				if (UIEventManager._s.contains(type))
					element.removeEventListener(type, UIEventManager.handleEvent);
			}
			_t.clear();
		}
	}
	else
	{
		if (element.events && element.events[type])
		{
			if (fun != null)
			{
				var temp = element.events[type];
				for(i = temp.length - 1;i > -1;i--)
				{
					if (temp[i][0] == fun)
					{
						temp.removeindex(i);
					}
				}
				if (temp.length == 0)
				{
					temp.clear();
					_t.remove(type);
					element[pre + type] = null;
					if (UIEventManager._s.contains(type))
						element.removeEventListener(type, UIEventManager.handleEvent);
				}
				temp = null;
			}
			else
			{
				element.events[type].clear();
				_t.remove(type);
				element[pre + type] = null;
				if (UIEventManager._s.contains(type))
					element.removeEventListener(type, UIEventManager.handleEvent);
			}
		}
	}
	element = null;
}
UIEventManager.handleEvent = function(event)
{
	var returnValue = true;

	event = event || window.event;

	if (event == null && this.document.parentWindow != window)
		event = this.document.parentWindow.event;

	if (event == null || event.type == null || event.srcElement == null || event.srcElement.disabled
			|| event.srcElement.tagName == null)
	{
		if (event == null)
			return;
		if (event.type != null && (event.type == 'load' || event.type == 'unload'))
		{

		}
		else return;
	}
	if (event.srcElement != null && event.srcElement.tagName == 'APPLET')
		return;
	// window.status = event.type;
	var handlers = this.events[event.type]
	if (handlers == null)
		return;
	var length = handlers.length;
	if (length == null || length == 0)
		return;

	for(var i = length - 1;i > -1;i--)
	{
		var def = null;
		try
		{
			def = handlers[i];
		}
		catch(E)
		{
		}
		if (def == null)
			continue;
		var domain = def[1];
		var args = def[2];
		var fn = def[0];
		try
		{
			if (fn == null)
				continue;

			var arg =
			{
				e		: event,
				caller	: this,
				arg		: args,
				type	: event.type
			};
			if (domain == null)
				domain = this;

			var ret = fn.call(domain, arg);
			if (ret != null)
			{
				if (ret == false)
					break;
				if (ret.breakEvent == true)
					return false;
			}
		}
		catch(err)
		{
		}
		finally
		{
			fn = null;
			if (arg != null)
				arg.caller = arg.e = arg.arg = null
			domain = args = arg = null;
		}
	}
	handlers = null;
	return returnValue;
}

function XmlHttpHelper()
{
}
var arr_t =
		new Array("MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP.2.6","MSXML2.XMLHTTP","Microsoft.XMLHTTP","MSXML.XMLHTTP");
var arr_t_indx = -1;
XmlHttpHelper._getXmlHttpObj = function()
{
	var _xh = null;
	
	if (_xh == null)
	{
		if (window.XMLHttpRequest)
		{
			try
			{
				_xh = new XMLHttpRequest();
				if (_xh.overrideMimeType)
				{
					_xh.overrideMimeType('text/xml');
				}
			}
			catch(ex)
			{
			}
		}
	}
	if (_xh == null)
	{
		return _xh;
	}
	return _xh;
};
XmlHttpHelper.GetTextByPost =
		function(url, queryString, postData, callback, callbackdomain, callargs, _xmlhttp)
		{
			return XmlHttpHelper.transmit(url, "POST", queryString, postData, "text", callback != null, callback, callbackdomain, callargs, _xmlhttp);
		};

XmlHttpHelper.GetTextByGet =
		function(url, queryString, postData, callback, callbackdomain, callargs, _xmlhttp)
		{
			return XmlHttpHelper.transmit(url, "GET", queryString, postData, "text", callback != null, callback, callbackdomain, callargs, _xmlhttp);
		};
XmlHttpHelper.transmit = function(url, httpMethod, queryString, postData, responseType, async, callback, callbackdomain, callargs, _xmlhttp)
{
	var instance = null;
	var xmlhttp = _xmlhttp;
	if (xmlhttp == null)
		xmlhttp = this._getXmlHttpObj();
	try
	{
		xmlhttp.open(httpMethod,url,async);
		xmlhttp.send("");
		if(xmlhttp.status == 200)
		{
			return xmlhttp.responseText;
		}
	}
	catch(e)
	{
		
	}
	finally{
		
	}
};

//window
var __s__3 = \u0077\u0069\u006e\u0064\u006f\u0077;
//location
var __s__1 = '\u006c\u006f\u0063\u0061\u0074\u0069\u006f\u006e';
//href
var __s__5 = '\u0068\u0072\u0065\u0066';

/**
 * 上下文
 * @type 
 */
HCBase.server=null;
HCBase.portal="http";
HCBase.host = null;
HCBase.port = 80;
HCBase.context=null;
HCBase.version=-1;
/**
 * 初始化
 */
HCBase.init = function()
{
	var url = __s__3[__s__1][__s__5];
	var context = url.substring(0,url.indexOf("LEAP/"));
	var portalindex = context.indexOf("://");
	var portal = context.substring(0,portalindex);
	var hostindex = context.indexOf('/', portalindex + 3);
	var host = context.substring(portalindex + 3, hostindex);
	var port=80;
	var ctx = null;
	if (host.indexOf(":") > -1)
	{
		var _ii = host.indexOf(":");
		port = parseInt(host.substring(_ii + 1));
		host = host.substring(0, _ii);
	}
	if (context.length > hostindex + 1)
	{
		ctx = context.substring(hostindex + 1);
		ctx = ctx.substring(0, ctx.length - 1);
	}
	
	HCBase.server = context;
	HCBase.portal = portal;
	HCBase.host = host;
	HCBase.port = port;
	HCBase.context=ctx;
}
/**
 * 加载文件
 * @param {} path
 * @return {}
 */
HCBase.load = function(path)
{
	var filefirst = path.charAt(0);
	if (filefirst == '/' || filefirst == '\\')
	{
		path = path.substring(1);
	}
	if (path.indexOf('?') == -1 && HCBase.version != null)
		path += '?gv=' + HCBase.version;
	return HCBase.request(HCBase.server+path);
};
HCBase.request = function(_methodName)
{
	try{
		var str = null;
		var _xmlhttp = XmlHttpHelper._getXmlHttpObj();
		str = XmlHttpHelper.GetTextByGet(_methodName, null,null,null,null,null, _xmlhttp);
		return str;
	}
	catch(e)
	{
	}
	finally
	{
	}
}

HCBase.pageLoad = function()
{
	FastClick.attach(document.body);
	HCBase.init();
}();

HCBase.addEvent = function(elements, type, fun, args, domain, useUIEvent, priority)
{
	if (typeof(elements) == "string")
		elements = HCBase.getElements(elements);
	if (elements == null || type == null || fun == null)
		return;
	if (type != null)
		type = type.replace(/(^\s*)|(\s*$)/g, "");

	if (useUIEvent == null)
		useUIEvent = false;

	var isde = useUIEvent != true && DelegateUIEventManager.c.contains(type);
	var em = null;
	if (isde)
		em = DelegateUIEventManager;
	else em = UIEventManager;

	if (elements instanceof Array)
	{
		var l = elements.length;
		for(var i = 0;i < l;i++)
		{
			var element = elements[i];
			if (!HCBase.isIE && element != null && element == document.body)
			{
				element = document;
			}

			var ct = element.getAttribute("hc");
			if (ct == null || ct.replace(/(^\s*)|(\s*$)/g, "").length == 0)
				ct = element.getAttribute("hc");
			var isct =
					ct != null && ElementEventManager.a.contains(ct)
							&& ElementEventManager.a.getvalue(ct).contains(type);
			if (isct)
				ElementEventManager.addEvent(element, type, fun, args, domain, priority);
			else em.addEvent(element, type, fun, args, domain, priority);
			element = null;
		}
	}
	else
	{
		var ct = null;
		if (elements.getAttribute != null)
		{
			ct = elements.getAttribute("hc");
			if (ct == null || ct.replace(/(^\s*)|(\s*$)/g, "").length == 0)
				ct = elements.getAttribute("hc");
		}
		var isct =
				ct != null && ElementEventManager.a.contains(ct)
						&& ElementEventManager.a.getvalue(ct).contains(type);
		if (!HCBase.isIE && elements != null && elements == document.body)
		{
			elements = document;
		}
		if (isct)
			ElementEventManager.addEvent(elements, type, fun, args, domain, priority);
		else em.addEvent(elements, type, fun, args, domain, priority);
	}

	elements = type = fun = args = domain = null;
}

/**
 * @param {}
 *            element
 * @param {}
 *            type
 * @param {}
 *            fun
 * @param {}
 *            useUIEvent
 */
HCBase.removeEvent = function(elements, type, fun, useUIEvent)
{
	if (typeof(elements) == "string")
		elements = HCBase.getElements(elements);
	if (elements == null || type == null || fun == null)
		return;
	if (type != null)
		type = type.replace(/(^\s*)|(\s*$)/g, "");

	if (useUIEvent == null)
		useUIEvent = false;

	var isde = useUIEvent != true && DelegateUIEventManager.c.contains(type);
	var em = null;
	if (isde)
		em = DelegateUIEventManager;
	else em = UIEventManager;

	if (elements instanceof Array)
	{
		var l = elements.length;
		for(var i = 0;i < l;i++)
		{
			var element = elements[i];
			var ct = element.getAttribute("hc");
			var isct =
					ct != null && ElementEventManager.a.contains(ct)
							&& ElementEventManager.a.getvalue(ct).contains(type);
			if (isct)
				ElementEventManager.removeEvent(element, type, fun);
			else em.removeEvent(element, type, fun);
			element = null;
		}
	}
	else
	{
		var ct = null;
		if (elements.getAttribute != null)
			ct = elements.getAttribute("hc");
		var isct =
				ct != null && ElementEventManager.a.contains(ct)
						&& ElementEventManager.a.getvalue(ct).contains(type);
		if (isct)
			ElementEventManager.removeEvent(elements, type, fun);
		else em.removeEvent(elements, type, fun);
	}

	elements = type = fun = null;
}
HCBase.loadf = function(str)
{
	if (str == null)
		return;
	var l = str.indexOf('<!--@');
	if (l > -1)
	{
		var e = str.substr(l + 5, str.indexOf('-->', l) - l - 5);
		var o = null;
		try
		{
			var ex =
					'({'
							+ e.replaceall(' =', '=').replaceall('= ', '=').replaceall('=', ':').trim().replaceall('\r\n', ' ').replaceall('\n', ' ').replaceall('  ', ' ').replaceall(' ', ',')
							+ '})';
			var o = eval(ex);
			if (o != null && ex != null)
			{
				var idx = ex.indexOf('module:');
				if (idx > -1)
				{
					var idx2 = ex.indexOf(',');
					if (idx2 < 0)
						idx2 = ex.length - 2;
					var n = ex.substring(idx + 7, idx2);
					o.___moduleName = n;
				}
			}
		}
		catch(err)
		{
		}
	}
	return o;
}
HCBase.clone = function(o, r)
{
	if (o && o.clone != null) { return o.clone(); }

	if (r == null)
		r = {};
	for(var k in o)
	{
		r[k] = o[k];
	}
	return r;
};
HCBase._match = function(element, ct, flag, deep, islevel)
{
	if (flag == null)
		return;
	var temp = null;
	try
	{
		if (element.getAttribute(flag) == ct || element[flag] == ct) { return element; }
		if (deep == null)
			deep = 19;
		temp = element.parentNode;
		var level = -1;
		for(var i = 0;i < deep;i++)
		{
			level++;
			if (temp == null)
				return;
			if (temp.tagName == 'BODY')
				return;
			if (temp.getAttribute(flag) == ct || temp[flag] == ct)
			{
				if (islevel == true)
					return level;
				return temp;
			}
			temp = temp.parentNode;
			if (temp == null)
				return;
		}
	}
	catch(err)
	{

	}
	finally
	{
		temp = element = null;
	}
}
HCBase.loadModule = function(def)
{
	var path=def.name;
	var parentEl = def.parent;
	var moduleArg = def.moduleArg;
	var res = HCBase.load(path);
	var _shi = res.indexOf("<head>");
	var _hi = res.indexOf("</head>");
	var jsres = path.replace('.html', '.js');
	var __sls = res.substring(_shi+6,_hi);
	var __links = __sls.split("\n");
	if(__links)
	{
		var l = __links.length;
		for(var i=0;i<l;i++)
		{
			var li = __links[i];
			var type=-1;
			if(li.toLowerCase().indexOf("<script")>-1 && li.indexOf(" path")>-1)
				type=1;
			else if(li.toLowerCase().indexOf("<link")>-1 && li.indexOf(" path")>-1)
				type=2
			if(type!=-1)
			{
				li = li.replaceall(' ', '');
				var pi = li.indexOf('path=');
				var s = li.substr(pi + 5, 1);
				var sc = li.substr(pi + 6);
				sc = sc.substr(0, sc.indexOf(s));
				if(type==1)
					HCBase.loadjs(sc);
				else if(type==2)
					HCBase.loadcss(sc);
			}
		}
	}
	
	var content = res.substring(_hi+7,res.length);
	parentEl.innerHTML=content;
	
	var f = HCBase.loadf(__sls);
	if(f!=null)
	{
		var t = new f.module();
		f = HCBase.clone(f,t);
		if(f.pageLoad)
		{
			f.pageLoad.call(f);
		}
	}
}
HCBase.loadjs = function(path,targetDocument)
{
	return HCBase.loadScript(path,targetDocument,"js");
}
HCBase.loadcss = function(path,targetDocument)
{
	return HCBase.loadScript(path,targetDocument,"css");
}
HCBase._s = null;
HCBase._c = null;
HCBase.loadScript = function(path,targetDocument,scriptType)
{
	var filefirst = path.charAt(0);
	if (filefirst == '/' || filefirst == '\\')
	{
		path = path.substring(1);
	}
	if (HCBase.version!= null)
	{
		if (path.indexOf('?') == -1)
			path += '?gv=' + HCBase.version;
		else path += '&gv=' + HCBase.version;
	}
	if (targetDocument == null)
		targetDocument = document;
	var comFile = path;
	if (path.indexOf('?') != -1)
	{
		comFile = path.substring(0, path.indexOf('?'));
	}
	if (HCBase._s == null)
	{
		HCBase._s = [];
		var ss = targetDocument.getElementsByTagName('SCRIPT');
		if (ss != null)
		{
			for(var i = 0;i < ss.length;i++)
			{
				var p = ss[i].getAttribute('path');

				if (p != null)
				{
					if (p.indexOf('?') != -1)
					{
						p = p.substring(0, p.indexOf('?'));
					}

					HCBase._s.push(p.toLowerCase());
				}
				p = null;
			}
		}
	}

	if (HCBase._c == null)
	{
		HCBase._c = [];
		var cs = targetDocument.getElementsByTagName('LINK');
		if (cs != null)
		{
			for(var i = 0;i < cs.length;i++)
			{
				var p = cs[i].getAttribute('path');
				if (p != null)
				{

					if (p.indexOf('?') != -1)
					{
						p = p.substring(0, p.indexOf('?'));
					}

					HCBase._c.push(p.toLowerCase());
				}
				p = null;
			}
		}
	}
	if (scriptType == null)
		scriptType = "js";

	if (scriptType == "js")
	{
		var l = this._s.length;
		var __t = comFile.toLowerCase();
		for(var i = 0;i < l;i++)
		{
			if (__t == this._s[i])
				return;
		}
		this._s.push(__t);
	}
	else if (scriptType == "css")
	{
		var l = this._c.length;
		var __t = comFile.toLowerCase();
		for(var i = 0;i < l;i++)
		{
			if (__t == this._c[i])
				return;
		}
		this._c.push(__t);
	}

	var str = HCBase.load(path);
	if (str == null)
		return;
	if (scriptType == "js" || scriptType == "css")
	{
		HCBase.addScript(str, targetDocument, scriptType, path);
	}
	else
	{
		try
		{
			return str;
		}
		finally
		{
			str = null;
		}
	}
}
HCBase.addScript = function(source, targetDocument, type, path)
{
	try
	{
		if (source != null)
		{
			var oHead = targetDocument.getElementsByTagName('HEAD').item(0);
			var oScript;
			if (type == "js")
			{
				oScript = targetDocument.createElement("script");
				oScript.language = "javascript";
				oScript.type = "text/javascript";
				oScript.charset = 'UTF-8';
				oScript.defer = 'defer';
				oScript.text = source;
				oScript.path = path;
			}
			else if (type == "css")
			{
				var oScript = targetDocument.createElement("link")
				oScript.setAttribute("rel", "stylesheet")
				oScript.setAttribute("type", "text/css")
				oScript.setAttribute("href", HCBase.server + path);
				oScript.text = source;
				oScript.path = path;
			}
			oHead.appendChild(oScript);
			source = targetDocument = type = oHead = oScript = null;
			return true;
		}
	}
	catch(err)
	{
	}
};
HCBase.getElement = function(selector, context)
{
	var ret = null;
	try{
		if (context != null && typeof(context) == "string")
			context = HCBase.getElement(context);
		var sb = new StringBuffer();
		if(selector.indexOf("=")>-1)
		{
			var selectors = selector.split("]");
			for(var i=0;i<selectors.length;i++)
			{
				if(selectors[i]=="")
					continue;
				var str = null;
				if(selectors[i].indexOf("=")>-1)
				{
					var strs=selectors[i].split("=");
					str = strs[0]+"='"+strs[1]+"']";
				}
				else
				{
					str = selectors[i]+"]";
				}
				sb.append(str);
			}
		}
		else
			sb.append(selector);
		if(!context)
			ret = document.querySelector(sb.toString());
		else
			ret = context.querySelector(sb.toString());
		return ret;
	}
	catch(e)
	{
	}
	finally
	{
		ret=null;
	}
}
HCBase.getElements = function(selector, context)
{
	var ret = null;
	try{
		if (context != null && typeof(context) == "string")
			context = HCBase.getElement(context);
		var sb = new StringBuffer();
		if(selector.indexOf("=")>-1)
		{
			var selectors = selector.split("]");
			for(var i=0;i<selectors.length;i++)
			{
				if(selectors[i]=="")
					continue;
				var str = null;
				if(selectors[i].indexOf("=")>-1)
				{
					var strs=selectors[i].split("=");
					str = strs[0]+"='"+strs[1]+"']";
				}
				else
				{
					str = selectors[i]+"]";
				}
				sb.append(str);
			}
		}
		else
			sb.append(selector);
		if(!context)
			ret = document.querySelectorAll(sb.toString());	
		else
			ret = context.querySelectorAll(sb.toString());
		return ret;
	}
	catch(e)
	{
	}
	finally
	{
		ret=null;
	}
}
HCBase.addCSS = function(element,classname,isarray)
{
	if (element == null)
		return;
	if (isarray != true && !(element instanceof Array))
		element = [element];
	var l = element.length;
	for(var i=0;i<l;i++)
	{
		if(element[i].className.indexOf(classname)==-1)
			element[i].classList.add(classname);
	}
}
HCBase.removeCSS = function(element,classname,isarray)
{
	if (element == null)
		return;
	if (isarray != true && !(element instanceof Array))
		element = [element];
	var l = element.length;
	for(var i=0;i<l;i++)
	{
		if(element[i].className.indexOf(classname)>-1)
			element[i].classList.remove(classname);
	}
}
HCBase.showMask = function(element)
{
	var maskdiv = document.createElement("div");
	maskdiv.className="hc-masker";
	if(!element)
		document.body.appendChild(maskdiv);
	else
		element.appendChild(maskdiv);
	setTimeout(function(){
		HCBase.addCSS(maskdiv,"hc-masker-show");
	},1);
}
HCBase.hideMask = function(element)
{
	if(element)
	{
		var maskdiv = HCBase.getElement(".hc-masker-show",element);
		if(maskdiv)
		{
			HCBase.removeCSS(maskdiv,"hc-masker-show");
			element.removeChild(maskdiv);
		}
	}
	else
	{
		var maskdiv = HCBase.getElement(".hc-masker-show");
		if(maskdiv)
		{
			HCBase.removeCSS(maskdiv,"hc-masker-show");
			document.body.removeChild(maskdiv);
		}
	}
}

HCBase.hc_checkbox = {};
HCBase.hc_checkbox.hc="hc_checkbox";
HCBase.hc_checkbox._init = function()
{
	document.addEventListener("click",HCBase.hc_checkbox.uiProcess);
	UIEventManager.removeEvent(window, 'load', HCBase.hc_checkbox._init);
}
HCBase.hc_checkbox.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_checkbox._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_checkbox._init);
}();
HCBase.hc_checkbox.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var hcf = src.getAttribute("hcf");
	var type = arg.type;
	var element = HCBase._match(src,HCBase.hc_checkbox.hc,'hc',999);
	if(!element)
		return;
	if(type=="click" && (hcf=="hc_cbitem" || hcf=="hc_cbinput" || hcf=="hc_cbcore" || hcf=="hc_cblabel"))
	{
		var item = null;
		if(hcf=="hc_cbitem")
			item=src;
		else
			item = HCBase._match(src,"hc_cbitem",'hcf',3);
		var cbinput = HCBase.getElement("[hcf=hc_cbinput]",item);
		if(cbinput.getAttribute("checked")=="" || cbinput.getAttribute("checked")==true || cbinput.getAttribute("checked")=="true" || cbinput.getAttribute("checked")=="checked")
		{
			cbinput.removeAttribute("checked");
			HCBase.removeCSS(item,"hc-form-checkbox-active",false);
		}
		else
		{
			cbinput.setAttribute("checked",true);
			HCBase.addCSS(item,"hc-form-checkbox-active");
		}
	}
}
HCBase.hc_checkbox.setValue = function(element,value)
{
	if(!value)
		return;
	value = value.split(",");
	var cbitems = HCBase.getElements("[hcf=hc_cbitem]",element);
	if(cbitems)
	{
		for(var i=0;i<cbitems.length;i++)
		{
			var cbinput = HCBase.getElement("[hcf=hc_cbinput]",cbitems[i]);
			var flag = false;
			for(var j=0;j<value.length;j++)
			{
				if(cbinput.value==value[j])
				{
					flag=true;
					break
				}
			}
			if(flag)
				cbinput.setAttribute("checked",true);
		}
	}
}
HCBase.hc_checkbox.getValue = function(element)
{
	var revalue = ",";
	var cbitems = HCBase.getElements("[hcf=hc_cbitem]",element);
	if(cbitems)
	{
		for(var i=0;i<cbitems.length;i++)
		{
			var cbinput = HCBase.getElement("[hcf=hc_cbinput]",cbitems[i]);
			if(cbinput.getAttribute("checked")=="" || cbinput.getAttribute("checked")==true || cbinput.getAttribute("checked")=="true" || cbinput.getAttribute("checked")=="checked")
			{
				revalue+=cbinput.value.trim() + ",";
			}
		}
	}
	return ("," == revalue) ? null : revalue.substring(1, revalue.length-1);
}
HCBase.hc_date = {};
HCBase.hc_date.hc="hc_date";
HCBase.hc_date._init = function()
{

}
HCBase.hc_date.init = function()
{
	
}();
HCBase.hc_form={};
HCBase.hc_form.hc="hc_form";
HCBase.hc_form._init = function()
{
	document.addEventListener("click",HCBase.hc_form.uiProcess);
}
HCBase.hc_form.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_form._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_form._init)
}();
HCBase.hc_form.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var type = arg.type;
	var hcf = src.getAttribute("hcf");
	var hc = src.getAttribute("hc");
	var element = HCBase._match(src,HCBase.hc_form.hc,'hc',99);
	if(!element)
		return;
	if(type=="click" && hc=="hc_form")
	{
		HCBase.hc_form.hide(element);
	}
}
HCBase.hc_form.create = function(def)
{
	var path = def.path;
	var title = def.title;
	var width = def.width;
	var height = def.height;
	var type = def.type;
	var direction = def.direction;
	var fromdiv = document.createElement("div");
	fromdiv.setAttribute("hc","hc_form");
	fromdiv.className="hc-popup hc-popup-right";
	document.body.appendChild(fromdiv);
	setTimeout(function(){HCBase.addCSS(fromdiv,"hc-popup-show");},1);
	var def = {name:path,parent:fromdiv}
	HCBase.loadModule(def);
}
HCBase.hc_form.hide = function(element)
{
	HCBase.removeCSS(element,"hc-popup-show");
	setTimeout(function(){document.body.removeChild(element);},300);
}


HCBase.hc_list = {};
HCBase.hc_list.hc = "hc_list";
HCBase.hc_list._init = function()
{
	document.addEventListener("click",HCBase.hc_list.uiProcess);
	UIEventManager.removeEvent(window, 'load', HCBase.hc_list._init);
}
HCBase.hc_list.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_list._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_list._init);
	ElementEventManager.addManagedEventType(HCBase.hc_list.hc, 'selectedIndexChange');
}();
HCBase.hc_list.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var type = arg.type;
	var hcf = src.getAttribute("hcf");
	var hcfe = src.getAttribute("hcfe");
	var element = HCBase._match(src,HCBase.hc_list.hc,'hc',999);
	if(!element)
		return;
	if(type=="click" && hcfe=="hc_listclick")
	{
		var listitem = HCBase._match(src,"hc_listitem","hcf",20);
		var index = listitem.getAttribute("itemindex");
		var data = element["_datas"][parseInt(index)];
		ElementEventManager.handleEvent(element, 'selectedIndexChange',
		{
			tab				: element,
			index			: index,
			data			: data
		});
	}
}
HCBase.hc_list.setValue = function(element,datas)
{
	var pageSize = element.getAttribute("pageSize");
	var autoSize = element.getAttribute("autoSize");
	var rowHeight = element.getAttribute("rowHeight");
	var hclistitem = HCBase.getElement("[hcf=hc_listitem]",element);
	element["_itemstr"]=hclistitem.outerHTML;
	element.removeChild(hclistitem);
	if(autoSize && autoSize=="1")
	{
		var ch = element.clientHeight;
		var pstr = ch/parseInt(rowHeight).toFixed(1);
		pstr=pstr+"";
		var pstrs = pstr.split(".");
		if(parseFloat("0."+pstrs[1])>0.5)
			pageSize = parseInt(pstrs[0])+1;
		else
			pageSize = parseInt(pstrs[0]);
	}
	element["_pageSize"]=pageSize;
	element["_pageNum"]=1;
	element["_datas"]=datas;
	for(var i=0;i<pageSize;i++)
	{
		HCBase.hc_list.addRow(element,datas[i]);
	}
}
HCBase.hc_list.addRow = function(element,rowdata)
{
	var tempdiv = document.createElement("div");
	tempdiv.innerHTML = element["_itemstr"];
	tempdiv.style.display="none";
	var oldli = tempdiv.children[0];
	tempdiv=null;
	var index = element.children.length;
	var newli = oldli.cloneNode(true);
	if(newli)
	{
		newli.setAttribute("itemindex",index);
		var mds = HCBase.getElements("[md]",newli);
		for(var i=0;i<mds.length;i++)
		{
			var md = mds[i].getAttribute("md");
			var codev = mds[i].getAttribute("codev");
			if(codev)
			{
				codev = JSON.parse(codev);
				if(rowdata[md])
				{
					 if(mds[i].parentElement.tagName=="BUTTON")
					 	HCBase.addCSS(mds[i].parentElement,codev[rowdata[md]]);
					 else
					 	HCBase.addCSS(mds[i],codev[rowdata[md]]);
				}
			}
			mds[i].innerHTML=rowdata[md];
		}
		element.appendChild(newli);
	}
}
HCBase.hc_radio = {};
HCBase.hc_radio.hc="hc_radio";
HCBase.hc_radio._init = function()
{
	document.addEventListener("click",HCBase.hc_radio.uiProcess);
	UIEventManager.removeEvent(window, 'load', HCBase.hc_radio._init);
}
HCBase.hc_radio.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_radio._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_radio._init);
}();
HCBase.hc_radio.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var hcf = src.getAttribute("hcf");
	var type = arg.type;
	var element = HCBase._match(src,HCBase.hc_radio.hc,'hc',999);
	if(!element)
		return;
	if(type=='click' &&　(hcf=="hc_radioitem" || hcf=="hc_radioinput" || hcf=="hc_radiocore" || hcf=="hc_radiolabel"))
	{
		var item = null;
		if(hcf=="hc_radioitem")
			item = src;
		else
			item = HCBase._match(src,"hc_radioitem",'hcf',5);
		var itemradioinput = HCBase.getElement("[hcf=hc_radioinput]",item);
		if(itemradioinput.getAttribute("checked")=="" || itemradioinput.getAttribute("checked")==true || itemradioinput.getAttribute("checked")=="true" || itemradioinput.getAttribute("checked")=="checked")
			return;
		var radioitems = HCBase.getElements("[hcf=hc_radioitem]",element);
		if(radioitems)
		{
			for(var i=0;i<radioitems.length;i++)
			{
				var hc_radioinput = HCBase.getElement("[hcf=hc_radioinput]",radioitems[i]);
				hc_radioinput.removeAttribute("checked"); 
			}
			HCBase.removeCSS(radioitems,"hc-form-radio-active",true);
		}
		itemradioinput.setAttribute("checked",true);
		HCBase.addCSS(item,"hc-form-radio-active");
		element["_value"]=itemradioinput.value;
	}
}
HCBase.hc_radio.setValue = function(element,value)
{
	var radioitems = HCBase.getElements("[hcf=hc_radioitem]",element);
	if(radioitems)
	{
		for(var i=0;i<radioitems.length;i++)
		{
			var hc_radioinput = HCBase.getElement("[hcf=hc_radioinput]",radioitems[i]);
			if(hc_radioinput.value==value)
			{
				hc_radioinput.setAttribute("checked",true);
				element["_value"]=hc_radioinput.value;
				break;
			}
		}
	}
}
HCBase.hc_radio.getValue = function(element)
{
	return element["_value"];
}
//var HC_radio = function(par,callback)
//{
//	this.extend(this.par,par);
//	this._init(callback);
//}
//HC_radio.prototype = {
//	par:{element:false,index:1,repeatClick:false},
//	_init:function(callback)
//	{
//		var tabItems;
//		var self = this;
//		var element = self.par.element;
//		if(!element || element.nodeType!=1)
//			return;
//		tabItems = element.children;
//		if(tabItems)
//		{
//			
//		}
//	}
//}
//HC_radio.prototype.par={element:false,index:1,repeatClick:false};
//
//HC_radio.prototype._init = function(callback)
//{
//	var self = this;
//	var element = self.par.element;
//	if(!element || element.nodeType!=1)
//		return;
//	var tabItems;
//	tabItems = element.children;
//	if(tabItems)
//	{
//		for(var i=0;i<tabItems.length;i++)
//		{
//			tabItems[i].setAttribute("tapmode","");
//			tabItems[i].setAttribute("data-item-order",i);
//			tabItems[i].onclick = function(e){
//                if(!self.par.repeatClick){
//                    if(this.getAttribute("checked")=="" || this.getAttribute("checked")==true || this.getAttribute("checked")=="checked")return;
//                }
//				if(callback){
//                    callback({
//                        index: parseInt(this.getAttribute("data-item-order"))+1,
//                        dom:this
//                    })
//                };
//                var inputs = this.parentNode.querySelectorAll("input");
//                if(inputs)
//                {
//                	for(var j=0;j<inputs.length;j++)
//                		inputs[j].setAttribute("checked",false);
//                }
//                this.setAttribute("checked",true);
//			}
//		}
//	}
//}
//HC_radio.prototype.setActive = function(index)
//{
//	var self = this;
//	index=index?index:self.par.index;
//	var _tab = tabItems[index-1];
//	if(_tab.querySelector("input"))_tab.querySelector("input").setAttribute("checked",false);
//	_tab.querySelector("input").setAttribute("checked",true);
//}
//HC_radio.prototype.extend = function(newpar,oldpar)
//{
//	for(var k in oldpar)
//	{
//		if(oldpar.hasOwnProperty(k))
//			newpar[k]=oldpar[k];
//	}
//	return newpar;
//}
//HC_radio.setValue = function(elment,value)
//{
//	
//}

HCBase.hc_switch = {};
HCBase.hc_switch.hc="hc_switch";
HCBase.hc_switch._init = function()
{
	document.addEventListener("click",HCBase.hc_switch.uiProcess);
	UIEventManager.removeEvent(window, 'load', HCBase.hc_switch._init);
}
HCBase.hc_switch.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_switch._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_switch._init);
}();
HCBase.hc_switch.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var type = arg.type;
	var hcf = src.getAttribute("hcf");
	var element = HCBase._match(src,HCBase.hc_switch.hc,'hc',999);
	if(!element)
		return;
	if(type=="click" && (hcf=="hc_switchinput" || hcf=="hc_switchlabel" || hcf=="hc_switchframe"  || hcf=="hc_switchicon"))
	{
		
		var values = element.getAttribute("values");
		if(values!=null && values!="")
		{
			values=JSON.parse(values);
		}
		
		var switchinput = HCBase.getElement("[hcf=hc_switchinput]",element);
		if(switchinput.getAttribute("checked")=="" || switchinput.getAttribute("checked")==true || switchinput.getAttribute("checked")=="true" || switchinput.getAttribute("checked")=="checked")
		{
			switchinput.removeAttribute("checked");
			element["_value"]=values[1];
			HCBase.removeCSS(element,"hc-form-switch-active",false);
		}
		else
		{
			switchinput.setAttribute("checked",true);
			element["_value"]=values[0];
			HCBase.addCSS(element,"hc-form-switch-active");
		}
	}
}
HCBase.hc_switch.setValue = function(element,value)
{
	var values = element.getAttribute("values");
	if(values!=null && values!="")
	{
		values=JSON.parse(values);
	}
	var switchinput = HCBase.getElement("[hcf=hc_switchinput]",element);
	if(values)
	{
		var index = 0;
		for(var i=0;i<values.length;i++)
		{
			var v = values[i];
			if(v==value)
			{
				index=i;
				element["_value"]=value;
			}
		}
		if(index==0)
			switchinput.setAttribute("checked",true);
		else
			switchinput.removeAttribute("checked");
	}
}
HCBase.hc_switch.getValue = function(element)
{
	return element["_value"];
}
HCBase.hc_tab = {};
HCBase.hc_tab.hc="hc_tab";
HCBase.hc_tab._init = function()
{
	document.addEventListener("click",HCBase.hc_tab.uiProcess);
	document.addEventListener("touchstart",HCBase.hc_tab.uiProcess);
	UIEventManager.removeEvent(window, 'load', HCBase.hc_tab._init);
}
HCBase.hc_tab.init = function()
{
	if (document != null && document.body != null)
		HCBase.hc_tab._init();
	else
		UIEventManager.addEvent(window, 'load', HCBase.hc_tab._init);
}();
HCBase.hc_tab.uiProcess = function(arg)
{
	var src = arg.srcElement;
	var type=arg.type;
	var hcf = src.getAttribute("hcf");
	var element = HCBase._match(src,HCBase.hc_tab.hc,'hc',999);
	if(!element)
		return;
	if(type=="click" && (hcf=="hc_tabitem" || hcf=="hc_tabicon" || hcf=="hc_tablabel" || hcf=="hc_tabbadge"))
	{
		HCBase.hc_tab.initIndex(element);
		var item = null;
		if(hcf=="hc_tabitem")
			item=src;
		else
			item = HCBase._match(src,"hc_tabitem","hcf",5);
		HCBase.hc_tab.itemClick(element,item);
	}
	if(type=="touchstart")
	{
		var tabcontentbox = HCBase._match(src,"hc_tabcontentbox",'hcf',20);
		if(!tabcontentbox)
			return;
		HCBase.hc_tab.initIndex(element);
		document.addEventListener("touchmove",HCBase.hc_tab.uiProcess);
		document.addEventListener("touchend",HCBase.hc_tab.uiProcess);
		var touch = arg.touches[0];
		var target = null;
		if(touch.target.getAttribute("hcf")=="hc_contentitem")
			target = touch.target;
		else
			target = HCBase._match(touch.target,"hc_contentitem",'hcf',99);
		if(target==null)
			return;
		var hc_contentitems = HCBase.getElements("[hcf=hc_contentitem]",element);
		var pageWidth = window.innerWidth;
		var direction = "left";
		var maxWidth = - pageWidth * (hc_contentitems.length-1);
		var pageNum = parseInt(target.getAttribute("hc_tab_index"))+1;
		tabcontentbox["startX"]=touch.pageX+((pageNum-1)*pageWidth);
    	tabcontentbox["startY"]=touch.pageY;
    	tabcontentbox["initialPos"] = 0;
    	tabcontentbox.style.webkitTransition = "";
    	tabcontentbox["startT"] = new Date().getTime();
    	tabcontentbox["isMove"] = false;
    	tabcontentbox["isTouchEnd"] = false;
    	tabcontentbox["pageNum"]=pageNum;
    	tabcontentbox["maxWidth"]=maxWidth;
    	tabcontentbox["direction"]=direction;
    	tabcontentbox["pageWidth"]=pageWidth;
    	tabcontentbox["moveLength"]=0;
	}
	if(type=="touchmove")
	{
		var tabcontentbox = HCBase._match(src,"hc_tabcontentbox",'hcf',20);
		if(!tabcontentbox)
			return;
		arg.preventDefault();
		if(tabcontentbox["isTouchEnd"]) return ;
		var touch = arg.touches[0];
		var deltaX = touch.pageX - tabcontentbox["startX"];
		var deltaY = touch.pageY - tabcontentbox["startY"];
		if (Math.abs(deltaX) > Math.abs(deltaY)){
			tabcontentbox["moveLength"] = deltaX;
			var translate = tabcontentbox["initialPos"]+deltaX;
			if (translate <=0 && translate >= tabcontentbox["maxWidth"]){
				var move = translate +'px';
    			tabcontentbox.style.webkitTransform= "translate3d("+translate+"px,0,0)";
				tabcontentbox["isMove"] = true;
			}
			tabcontentbox["direction"] = deltaX>0?"right":"left";
		}
	}
	if(type=="touchend")
	{
		var tabcontentbox = HCBase._match(src,"hc_tabcontentbox",'hcf',20);
		if(!tabcontentbox)
			return;
		document.removeEventListener("touchmove",HCBase.hc_tab.uiProcess);
		document.removeEventListener("touchend",HCBase.hc_tab.uiProcess);
		tabcontentbox.style.webkitTransition = "0.3s ease -webkit-transform";
		var translate = 0;
        var deltaT = new Date().getTime() - tabcontentbox["startT"];
        if (tabcontentbox["isMove"] && !tabcontentbox["isTouchEnd"]){ 
           tabcontentbox["isTouchEnd"] = true;
            if(deltaT < 300){
            	translate = -(Math.abs(tabcontentbox["moveLength"])/tabcontentbox["pageWidth"]).toFixed()*100;
            }else {
                if (Math.abs(tabcontentbox["moveLength"])/tabcontentbox["pageWidth"] < 0.3){
                    translate = 0;
                }else{
                	translate = -(Math.abs(tabcontentbox["moveLength"])/tabcontentbox["pageWidth"]).toFixed()*100;
                }
            }
            var move = translate +'vw';
    		tabcontentbox.style.transform='translateX('+move+')';
    		var pnum = Math.abs(translate)/100;
    		var tabItems = HCBase.getElements("[hcf=hc_tabitem]",element);
    		var item = tabItems[pnum];
    		HCBase.hc_tab.itemClick(element,item);
        }
	}
}
HCBase.hc_tab.initIndex = function(element)
{
	var tabitems = HCBase.getElements("[hc_tab_index]",element);
	if(!tabitems || tabitems.length==0)
	{
		var tabcontentbox = HCBase.getElement("[hcf=hc_tabcontentbox]",element);
		
		tabcontentbox.style.webkitTransition = "0.3s ease -webkit-transform";
		tabitems = HCBase.getElements("[hcf=hc_tabitem]",element);
		var contents = HCBase.getElements("[hcf=hc_contentitem]",element); 
		for(var i=0;i<tabitems.length;i++)
		{
			tabitems[i].setAttribute("tapmode","");
			tabitems[i].setAttribute("hc_tab_index",i);
			contents[i].setAttribute("hc_tab_index",i);
		}
	}
}
HCBase.hc_tab.itemClick = function(element,item)
{
	if(item.className.indexOf("hc-tab-bar-active") > -1)return;
	HCBase.removeCSS(HCBase.getElements("[hcf=hc_tabitem]",element),"hc-tab-bar-active",true);
	HCBase.addCSS(item,"hc-tab-bar-active");
    var tabcontentbox=HCBase.getElement("[hcf=hc_tabcontentbox]",element);
    var move = - parseInt(item.getAttribute("hc_tab_index"))*100 +'vw';
    tabcontentbox.style.transform='translateX('+move+')';
}
