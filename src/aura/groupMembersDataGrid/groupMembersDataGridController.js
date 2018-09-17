({
    membersInit: function(cmp, event, helper) {
        helper.membersInit(cmp, event, helper);
    },
    onAddRemoveRow: function(cmp, event, helper) {
        //fire confirmation modal
        var params = event.getParams();
        if(!params.remove && params.last) {
            //primary group check
            var items = cmp.get("v.items");
            helper.disableRollup(cmp, items.length - 1);
        } else if(params.remove) {
            helper.confirmRemove(cmp, params.index);
        }
    },
    onConfirm: function(cmp, event, helper) {
        //stashed the removeIndex in aura:id
        var removeIndex = event.getSource().getLocalId();
        cmp.removeRow(removeIndex);
    },
    onDataChanged: function(cmp, event, helper) {
        helper.disableItems(cmp, event, helper);
    },
    onRowChange: function(cmp, event, helper) {
        //only validate on ContactId changes
        var payload = event.getParams().payload;
        //trigger change on contact changes to propogate changes in members account table
        var isPersonAccountPayload = (payload.name == "AccountId") && cmp.get("v.isPersonAccount");
        if(isPersonAccountPayload || payload.name == "ContactId" || payload.name == "PrimaryGroup__c" || payload.name == "Primary__c") {
            if (cmp.get("v.isPersonAccount")) {
                helper.fetchContactIdForPersonAccount(cmp, event, helper);
            } else {
                cmp.set("v.items", cmp.get("v.items"));
            }
        }
        //valdate on contact names & primary member
        if(isPersonAccountPayload || payload.name == "ContactId" || payload.name == "Primary__c" || payload.name == "PrimaryGroup__c") {
            helper.validate(cmp, event, helper);
        }
    }
})