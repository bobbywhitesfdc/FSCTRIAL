({
	loadDashboardId : function(component, event, helper) {
		var action = component.get("c.getDashboardIdByName");
		action.setParams({
			"dashboardName":component.get("v.dashboardName")
		});
		action.setStorable();
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				var dashboardId = response.getReturnValue();
				component.set("v.dashboardId", dashboardId);
			} else if (state === "ERROR") {
				component.set("v.dashboardId", null);
			}
		});
		$A.enqueueAction(action);
	}
})