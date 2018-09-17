({
	loadListViewId : function(component, event, helper) {
		var action = component.get("c.getListViewIdByName");
        action.setParams({
			"sObjectName": component.get("v.objectName"),
            "listViewName":component.get("v.listViewName")
		});
        action.setCallback(this, function(response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				var listViewId = response.getReturnValue();
				component.set("v.listViewId", listViewId);
			} else if (state === "ERROR") {
				component.set("v.listViewId", null);
			}
		});
		$A.enqueueAction(action);
	}
})