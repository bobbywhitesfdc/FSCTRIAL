({
	onInit: function(component, event, helper) {
		helper.onInit(component);
	},
	onChange : function(component, event, helper) {
		var accountDetailPanel = component.find("accountDetailPanel");
		var contactFirstDetailPanel = component.find("contactFirstDetailPanel");
		var contactLastDetailPanel = component.find("contactLastDetailPanel");
		accountDetailPanel.get("e.refresh").fire();
		if(!$A.util.isEmpty(contactFirstDetailPanel)) {
			contactFirstDetailPanel.get("e.refresh").fire();
		}
		if(!$A.util.isEmpty(contactLastDetailPanel)) {
			contactLastDetailPanel.get("e.refresh").fire();
		}
	}
})