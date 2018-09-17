({
    doInit: function(component, event, helper) {
        helper.doInit(component);
    },
    onChange: function(component, event, helper) {
        //get record & id from event
        var recordId = component.get("v.recordId");
        var householdId = component.get("v.householdId");
        var eRecord = event.getParam("record");
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        var acrChange = (eRecordObjectType === "AccountContactRelation");

        //check to see if any of the members of the group were affected by ACR change
        var members = component.get("v.records");
        var memberChanged = false;
        if(acrChange && !$A.util.isEmpty(members)) {
            //the members are a list of AccountContactRelationWrappers
            for(var i=0; i < members.length; i++) {
                var acr = members[i].acr;
                //if the acr changed matches the Id, AccountId or ContactId, the group was changed
                if(eRecord.Id === acr.Id || eRecord.AccountId === acr.AccountId || eRecord.ContactId === acr.ContactId) {
                    memberChanged = true;
                    break;
                }
            }
        } 

        if (!$A.util.isEmpty(eRecord) && (acrChange && (eRecord.Id === recordId || memberChanged || 
                $A.util.isEmpty(householdId) || eRecord.AccountId === householdId))) {
            helper.doInit(component);
        }
    },
    handleRecordPublished: function(component, event, helper) {
        // Refresh view after an activity is created via composer
        var params = event.getParams();
        if(params.id.indexOf('00U') == 0 || params.id.indexOf('00T') == 0) {
            helper.doInit(component);
        }
    }
})