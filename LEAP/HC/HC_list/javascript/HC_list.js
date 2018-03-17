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