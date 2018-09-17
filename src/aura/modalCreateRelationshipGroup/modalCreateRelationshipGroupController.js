({
	onInit: function(component, event, helper) {
		helper.onInit(component);
	},
	saveGroup: function(component, event, helper) {
		helper.saveGroup(component, event, helper);
	},
	onBack: function(component, event, helper) {
		helper.changePage(component, -1);
	},
	onCancel:function(component, event, helper) {
		helper.onCancel(component);
	}
})