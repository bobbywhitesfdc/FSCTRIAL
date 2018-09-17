({
	onInit: function(component, event, helper) {
		helper.populateCalculatedFields(component);
		helper.getReferrerInfo(component);
	},
	onError: function(component, event, helper) {
		var response = event.getParam("error");
		component.set("v.errors", response.getError());
		helper.toggleShowError(component);
	},
	handleDataProviderError: function(component, event, helper) {
		var response = event.getParam("error");
		component.set("v.errors", response);
		helper.toggleShowError(component);
	}
})