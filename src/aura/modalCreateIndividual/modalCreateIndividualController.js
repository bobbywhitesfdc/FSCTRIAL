({
	onInit: function(component, event, helper) {
		helper.onInit(component);
	},
	saveIndividual: function(component, event, helper) {
		helper.saveIndividual(component, event, helper);
	},
	onBack: function(component, event, helper) {
		helper.changePage(component, -1);
	},
	onRecordChange : function(component, event, helper) {
		helper.onRecordChange(component, event, helper);
	}
})