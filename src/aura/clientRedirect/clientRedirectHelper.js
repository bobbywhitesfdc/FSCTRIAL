({
	onInit: function(component) {
		var recordId = component.get("v.recordId");
		if($A.util.isEmpty(recordId)) {
			return;
		}

		var action = component.get("c.getClientAccountId");
		action.setParams({
			"recordId": recordId
		});
		// Makes a call out on RecordTypeController to fetch client information based on the account id
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				//navigate to id
				var clientIds = response.getReturnValue();
				var accountId = clientIds['AccountId'];
				
				if(!$A.util.isEmpty(accountId)) {
					var idEvent = $A.get("e.force:navigateToSObject");
					idEvent.setParams({
						"recordId": accountId,
						"isredirect": true
					});
					idEvent.fire();
				}
			} else if(state === "ERROR") {
				component.set("v.showErrors", true);
				component.set("v.errors", response.getError());
			}
		});
		$A.enqueueAction(action);
	}
})