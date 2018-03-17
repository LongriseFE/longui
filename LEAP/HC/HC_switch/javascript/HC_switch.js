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