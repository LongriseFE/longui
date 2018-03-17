var listtest = function()
{
	this.pageLoad = function()
	{
		var datas = [
		{
			listtitle:"龙岗区测试收文领导参观第十七届高交会主会场龙岗展区",
			buistype:"加急",
			datastate:"未阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"加急",
			datastate:"未阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"未阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"一般",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"一般",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"平件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"平件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		},
		{
			listtitle:"10月8日区长办公会要求的落实情况",
			buistype:"急件",
			datastate:"已阅",
			category:"公文办理",
			listtime:"2018-03-09 10:22"
		}
	]
	var hclist = HCBase.getElement("[hc=hc_list]");
	HCBase.hc_list.setValue(hclist,datas);
	HCBase.addEvent(hclist,'selectedIndexChange',clickListItem);
	function clickListItem(arg)
	{
		var def = {path:"LEAP/module/moduletest.html",title:null,width:null,height:null,type:null,dc:null}
		HCBase.hc_form.create(def);
	}
	}
}
