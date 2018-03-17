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