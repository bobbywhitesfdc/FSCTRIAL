({
    onInit: function(component, event, helper) {
    	
         // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var recordId = component.get("v.recordId");
        var self = this;
        
        var recordId = component.get("v.recordId");
        var action = component.get("c.getVisualizationRoot");
        var showRelatedAccounts = component.get("v.showRelatedAccounts");
        var showRelatedContacts = component.get("v.showRelatedContacts");
        action.setParams({
            "recordId": recordId,
            "showRelatedAccounts": showRelatedAccounts,
            "showRelatedContacts": showRelatedContacts
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var treeRoot = response.getReturnValue();
                component.set("v.rootObject", treeRoot);
                if(!$A.util.isEmpty(treeRoot)) {
					if (treeRoot.isGroup) {
						var accDefaultObj = {};
						accDefaultObj[prefix + "Account__c"] = treeRoot.objId;
						component.set("v.createAccountAccountRelation_Param", {
				            "entityApiName": prefix + "AccountAccountRelation__c",
				            "defaultFieldValues": accDefaultObj
				        });
					} else {
						if(treeRoot.isContact || treeRoot.isIndividual) {
				            component.set("v.createParam", {
				                "defaultRowValues": {
				                    "ContactId": treeRoot.primaryContactId,
				                    "Roles": "Client",
				                    "Rollups__c": "",
				                    "Primary__c": true,
				                    "PrimaryGroup__c": false
				                },
				                "showRelatedAccounts": showRelatedAccounts,
				                "showRelatedContacts": showRelatedContacts
				            });
				        } else {
				            component.set("v.createParam", {
				                "defaultRowValues": {
				                    "AccountId": treeRoot.objId,
				                    "Roles": "Business",
				                    "Rollups__c": "",
				                    "IncludeInGroup__c": false
				                },
				                "showRelatedAccounts": showRelatedAccounts,
				                "showRelatedContacts": showRelatedContacts
				            });
				        }		
					}
                }
            } else if (state === "ERROR") {
                component.set("v.showErrors", true);
                component.set("v.errors", response.error);
            }
			component.set("v.loading",false);
        });
        $A.enqueueAction(action);
    }
})