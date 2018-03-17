var moduletest = function()
{
	this.pageLoad = function()
	{
		var clear = HCBase.getElement("[hcf=clear]");
		HCBase.addEvent(clear,'click',this.hide);
	}
	this.hide = function()
	{
		var hc_form = HCBase.getElement("[hc=hc_form]");
		HCBase.hc_form.hide(hc_form);
	}
}