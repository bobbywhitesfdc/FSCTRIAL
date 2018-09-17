({
	onInit: function(component, event, helper) {
		var cmpType = (component.get("v.isLegacy")) ? "sfa:activityPanel" : "runtime_sales_activities:activityPanel";
        var attributes = {
            "recordId": component.get("v.recordId"),
			"width": component.get("v.width")
		};
        $A.createComponent(cmpType, attributes, 
            function(cmp, status, statusMessagesList) {
                if(status === "SUCCESS") {
                    component.set("v.body", cmp);
                }
            }
        );
	}
})