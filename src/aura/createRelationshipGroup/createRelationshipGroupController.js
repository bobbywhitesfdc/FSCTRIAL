({
    save: function(component, event, helper) {
        helper.save(component, event, helper);
    },
    onDataChange: function(cmp, event, helper) {
        var records = event.getParam("data");
        var dataGrid = cmp.find("membersDataGrid");
        if(!$A.util.isEmpty(records)) {
            if (cmp.get("v.isPersonAccount")) {
                var action = cmp.get("c.getPersonAccountsByContactIds");
                var contactIds = [];
                records.forEach(function(record) {
                    contactIds.push(record.ContactId);
                });
                action.setParams({ 
                    "contactIds": contactIds
                });
                action.setCallback(this, function(response) {
                    if (response.getState() === "SUCCESS") {
                        var personAccounts = response.getReturnValue();
                        records.forEach(function(record) {
                            //Since we cannot add contact's account id in a new field, we need to reuse the ACR's AccountId for storing the Person Account's Account ID.
                            //We reassign the AccountId to the group ID before saving the member.
                            record.AccountId = personAccounts[record.ContactId].AccountId;
                        });
                        dataGrid.set("v.priv_redraw", false);
                        dataGrid.set("v.items", records);
                    }
                });
                $A.enqueueAction(action);
            } else {
                dataGrid.set("v.priv_redraw", false);
                dataGrid.set("v.items", records);
            }
        } else {
            //initialize first row
            if($A.util.isEmpty(dataGrid.get("v.items"))) {
                dataGrid.set("v.priv_redraw", false);
                helper.createInitRow(dataGrid, event, helper);
            }
        }

        //fire change event
        dataGrid.getEvent("dataChanged").setParams({
            data: records,
            currentPage: event.getParam("currentPage")
        }).fire();
    }
})