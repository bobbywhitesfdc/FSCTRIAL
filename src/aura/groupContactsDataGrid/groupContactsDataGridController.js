({
	onInit: function(cmp, event, helper) {
		helper.onInit(cmp, event, helper);
	},
	onAddRemoveRow: function(cmp, event, helper) {
		//fire confirmation modal
		var params = event.getParams();
		if(params.remove) {
			cmp.removeRow(params.index);
		}
	},
	onDataChange: function(cmp, event, helper) {
		helper.onDataChange(cmp, event, helper);
	},
	onMembersChange: function(cmp, event, helper) {
		cmp.find("contactDataProvider").get("e.provide").fire();
		helper.setContactOptions(cmp, event, helper);
	}
})