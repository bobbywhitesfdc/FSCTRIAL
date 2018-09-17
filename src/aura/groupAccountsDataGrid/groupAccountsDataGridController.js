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
		helper.onMembersChange(cmp, event, helper);
	},
	validate: function(cmp, event, helper) {
		// validate on AccountId or ContactId changes
		var payload = event.getParams().payload;
		if(!payload || (payload.name == "ContactId" || payload.name == "AccountId")) {
			helper.validate(cmp, event, helper);
		}
	}
})