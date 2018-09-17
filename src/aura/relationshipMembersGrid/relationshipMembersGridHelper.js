({
	getObjectInfo: function(cmp) {
		var recordId = cmp.get("v.recordId");
		
		var self = this;
		var action = cmp.get("c.getObjectInfo");
		action.setParams({
			"identifier": recordId
		});
		// Makes a call out on RecordTypeController to fetch client information based on the account id
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				var objectInfo = response.getReturnValue();
				self.setAttributes(cmp, objectInfo);
				cmp.set("v.objectInfo", objectInfo);
			} else if (state === "ERROR") {
				cmp.set("v.showErrors", true);
				cmp.set("v.errors", response.getError());
			}
		});
		$A.enqueueAction(action);
	},
	setAttributes: function(cmp, objectInfo) {
		//set member & method
		var memberId = (objectInfo.IsIndividual) ? objectInfo.PrimaryContact : cmp.get("v.recordId")
		cmp.set("v.memberId", memberId);
		//set household info
		if(objectInfo.IsHousehold) {
			cmp.set("v.householdId", objectInfo.Id);
		}
		if(objectInfo.IsIndividual || objectInfo.IsContact) {
			cmp.set("v.createParam", {
                "defaultRowValues": {
                    "ContactId": memberId,
                    "Rollups__c": "",
                    "Primary__c": true,
                    "PrimaryGroup__c": true
                }
            });
		} else if(!objectInfo.IsHousehold) {
			cmp.set("v.createParam", {
                "defaultRowValues": {
                    "AccountId": memberId,
                    "Rollups__c": "",
                    "IncludeInGroup__c": true
                }
            });
		}
	}
})