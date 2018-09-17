({
    getObjectInfo: function(cmp, event, helper) {
        
        //These metriceService logs are for event monitoring.
        var recordId = cmp.get("v.recordId");

        var self = this;
        var clientInfoAction = cmp.get("c.getObjectInfo");
        clientInfoAction.setParams({
            "identifier": cmp.get("v.recordId")
        });
        // Makes a call out on RecordTypeController to fetch client information based on the account id
        clientInfoAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                cmp.set("v.objectInfo", response.getReturnValue());
                helper.setAttributes(cmp, event);
            } else if (state === "ERROR") {
                cmp.set("v.showErrors", true);
                cmp.set("v.errors", response.getError());
            }
        });
        $A.enqueueAction(clientInfoAction);
    },
    setAttributes: function(cmp, event) {
        var objectInfo = cmp.get("v.objectInfo");
        var childTables = [];
        childTables.push({
            "sObjectName": "Contact",
            "childTableIndicator": "Id",
            "methodName": "getHouseholdMembers",
            "fieldSetName": "WM_Client_Relationship_Group_Members",
            "dataProviderSObjectName": "AccountContactRelation",
            "actionTypes": ["membership"],
            "fixedWidth": true
        });
        childTables.push({
            "sObjectName": "Account",
            "childTableIndicator": "Id",
            "methodName": "getIndirectHouseholdMembers",
            "fieldSetName": "WM_Client_Relationship_Group_Members",
            "dataProviderSObjectName": "AccountContactRelation",
            "actionTypes": ["membership"],
            "fixedWidth": true,
            "loadingIndicator": ["aura:html", { tag: "div" }]
        });
        cmp.set("v.childTables", childTables);
        cmp.set("v.providerId", (objectInfo.IsIndividual) ? objectInfo.PrimaryContact : objectInfo.Id);
        if(objectInfo.IsContact || objectInfo.IsIndividual) {
            cmp.set("v.methodName", "getRelationshipGroupsByMemberContactId");
            cmp.set("v.createParam", {
                "defaultRowValues": {
                    "ContactId": cmp.get("v.providerId"),
                    "Rollups__c": "",
                    "Primary__c": true,
                    "PrimaryGroup__c": false
                }
            });
        } else {
            cmp.set("v.methodName", "getRelationshipGroupsForBusinessAccount");
            cmp.set("v.createParam", {
                "defaultRowValues": {
                    "AccountId": cmp.get("v.providerId"),
                    "Rollups__c": "",
                    "IncludeInGroup__c": false
                }
            });
        }
    }
})