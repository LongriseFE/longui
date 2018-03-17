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