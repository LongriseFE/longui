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
