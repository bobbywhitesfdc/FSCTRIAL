({
	getObjectInfo: function(cmp) {
		var recordId = cmp.get("v.recordId");
		
		var self = this;
		var action = cmp.get("c.getObjectInfo");
		action.setParams({
			"identifier": cmp.get("v.recordId")
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
		cmp.set("v.memberId", (objectInfo.IsIndividual) ? objectInfo.PrimaryContact : cmp.get("v.recordId"));
		//set household info
		if(objectInfo.IsHousehold) {
			cmp.set("v.householdId", objectInfo.Id);
		}
		if(objectInfo.IsIndividual || objectInfo.IsContact) {
			cmp.set("v.createParam", {
                "defaultRowValues": {
                    "ContactId": cmp.get("v.memberId"),
                    "Rollups__c": "All",
                    "Primary__c": true,
                    "PrimaryGroup__c": true
                }
            });
		} else if(!objectInfo.IsHousehold) {
			cmp.set("v.createParam", {
                "defaultRowValues": {
                    "AccountId": cmp.get("v.memberId"),
                    "Rollups__c": "All",
                    "IncludeInGroup__c": true
                }
            });
		}
	}
})