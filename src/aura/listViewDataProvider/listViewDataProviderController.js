({
	provide: function(cmp, event, helper){
		helper.provide(cmp, event, this);
	},
	onCreatePanel: function(cmp, event, helper) {
		//use helper function to determine if event is pertinent
		if(helper.isEventRelated(cmp, event)) {
			//refresh on any lead converted when looking at leads
			var objectName = cmp.get("v.sObjectName");
			var panelConfig = event.getParam("panelConfig");
			//in ui-lead-runtime-components/components/runtime_sales_lead/convert/convertHelper.js line 338
			//after conversion is done the converted confirmation modal is displayed
			var isConverted = (!$A.util.isEmpty(panelConfig) && !$A.util.isEmpty(panelConfig.body) && panelConfig.body.getLocalId() == "leadConverted");
			if(objectName === "Lead" && isConverted) {
				//call provide to refresh data
				helper.provide(cmp,event);
			}
		}
	},
	onChange: function(cmp, event, helper) {
		//use helper function to determine if event is pertinent
		if(helper.isEventRelated(cmp, event)) {
			//call provide to refresh data
			helper.provide(cmp,event);
		}
	}
})