({
	onInit: function(component, event, helper) {
		var numRecords = component.get("v.numRecords");
		component.set("v.methodParams", {"numRecords" :numRecords});
		helper.getReferrerInfo(component);
	},
	onError: function(component, event, helper) {
		var response = event.getParam("error");
		component.set("v.errors", response.getError());
		helper.toggleShowError(component);
	}
})