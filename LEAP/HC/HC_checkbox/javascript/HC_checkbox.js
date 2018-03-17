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