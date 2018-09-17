({
	onInit: function(component) {
		var recordId = component.get("v.recordId");
		var contactIdAction = component.get("c.getIndividualContactIdIfNotUsingPA");
		contactIdAction.setParams({
			"recordId": recordId
		});
		// Makes a call out on RecordTypeController to fetch client information based on the account id
		contactIdAction.setCallback(this, function(response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				component.set("v.contactId", response.getReturnValue());
			} else if (state === "ERROR") {
				component.set("v.showErrors", true);
				component.set("v.errors", response.getError());
			}
		});
		$A.enqueueAction(contactIdAction);
	}
})