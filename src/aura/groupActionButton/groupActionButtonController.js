({
	clickActionButton: function(component, event, helper) {
		helper.clickActionButton(component);
	},
	handleRecordTypeSelection: function(component, event, helper) {
		helper.handleRecordTypeSelection(component, event);
	},
	onChange: function(component, event, helper) {
		var eRecord = event.getParam("record");
		//if an ACR has been changed, fire Account change
		var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
		var recordId = (!$A.util.isEmpty(component.get("v.params"))) ? component.get("v.params").recordId : null;
		if(component.get("v.editMode") && !$A.util.isEmpty(recordId) && !$A.util.isEmpty(eRecordObjectType) && eRecordObjectType === "AccountContactRelation") {
			//fire event for account which was updated
			$A.get("e.force:afterRecordSave").setParams({
				"sObject": "Account",
				"recordId": recordId
			}).fire();
		}
	}
})