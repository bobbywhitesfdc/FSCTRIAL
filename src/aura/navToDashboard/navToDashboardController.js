({
	onInit : function(component, event, helper) {
		helper.loadDashboardId(component, event, helper);
	},
	navigate: function(component, event, helper) {
		var navEvent = $A.get("e.force:navigateToSObject");
			navEvent.setParams({
				"recordId": component.get("v.dashboardId")
			});
		navEvent.fire();
	}
})