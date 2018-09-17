({
    save: function(component, event, helper) {
        var params = event.getParam("arguments");
        var callback = params.callback;
        var currentStep = component.get("v.currentStep");
        if(currentStep == "detailsStep") {
            helper.saveDetails(component, helper, callback);
        } else if(currentStep == "membersStep") {
            var showRelatedAccounts = component.get("v.showRelatedAccounts");
            component.find("membersDataGrid").isValidGrid(function(membersValid) {
                if (showRelatedAccounts) {
                    component.find("accountsDataGrid").isValidGrid(function(accountsValid) {
                        if(membersValid && accountsValid) {
                            helper.saveMembers(component, helper, callback);
                        }
                    });
                } else {
                    if(membersValid) {
                        helper.saveMembers(component, helper, callback);
                    }
                }
            });
        }
    },
    saveDetails: function(component, helper, callback) {
        var detailPanel = component.find("accountDetailPanel");
        if(!$A.util.isEmpty(detailPanel) && detailPanel.length == 1) {
            detailPanel = detailPanel[0];
        }
        detailPanel.save({
            successHandler: callback
        });
    },
    saveMembers: function(component, helper, callback) {
        //For Person Account, reassign the member account ID as the Group's ID.
        if (component.get("v.isPersonAccount")) {
            var members = component.get("v.members");
            members.forEach(function(member) {
                member.AccountId = component.get("v.recordId");
            });
            component.set("v.members", members); 
        }
        
        component.set("v.errors", []);
        var allIndirect = [];
        allIndirect.push.apply(allIndirect, component.get("v.existingMembers"));
        allIndirect.push.apply(allIndirect, component.get("v.indirectMembers"));
        var action = component.get("c.upsertRelationshipGroupMembers");
        action.setParams({ 
            "identifier": component.get("v.recordId"),
            "members": helper.stringifyArray(component.get("v.members")),
            "indirectMembers": helper.stringifyArray(allIndirect),
            "contactRelationships": helper.stringifyArray(component.get("v.contactRelationships"))
        });
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();
        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            if (response.getState() === "SUCCESS") {
                var acr = {
                    "Id": null,
                    "AccountId": component.get("v.recordId"),
                    "sobjectType": "AccountContactRelation",
                };
                $A.get("e.force:recordChange").setParams({
                    "record": acr,
                    "recordId": acr.Id
                }).fire();
                callback();
            } else if(response.getState() === "ERROR") {
                //show error message
                var errorMessages = [];
                response.getError().forEach(function(error) {
                    errorMessages.push(error.message);
                });
                component.set("v.errors", errorMessages);
            }
        });
        $A.enqueueAction(action);
    },
    stringifyArray: function(array) {
        var stringArray = [];
        array.forEach(function(obj) {
            //Setting all fields to undefined instead of deleting since LockerService is blocking all deletes
            obj.Account = undefined;
            obj.Contact = undefined;
            obj.Contact__r = undefined;
            obj.RelatedContact__r = undefined;
            obj.Role__r = undefined;
            stringArray.push(JSON.stringify(obj));
        });
        return stringArray;
    },
    createInitRow: function(cmp, event, helper) {
        //check if there are defaultFieldValues
        var defaultRowValues = cmp.get("v.defaultRowValues");
        if(!$A.util.isEmpty(defaultRowValues)) {
            //create first row
            var columns = cmp.get("v.priv_columns");
            var obj = {Id: ""};
            for(var field in columns) {
                if(defaultRowValues.hasOwnProperty(field)) {
                    obj[field] = defaultRowValues[field];
                } else {
                    obj[field] = JSON.parse(columns[field].defaultValue);
                }
            }
            if (cmp.get("v.isPersonAccount")) {
                obj["ContactId"] = defaultRowValues["ContactId"];
            }
            var items = cmp.get("v.items");
            items.push(obj);
            cmp.set("v.items", items); //this will trigger set table
        } else {
            //add empty row 
            helper.addRow(cmp, event, helper);
        }

        //fire change event
        cmp.getEvent("dataChanged").setParams({
            data: cmp.get("v.items"),
            currentPage: 1
        }).fire();
    },

    addRow: function(cmp, event, helper) {
        //create new instance of item based on columns
        cmp.set("v.priv_redraw", false);
        var columns = cmp.get("v.priv_columns");
        var obj = {Id: ""};
        for(var field in columns) {
            obj[field] = JSON.parse(columns[field].defaultValue);
        }
        var items = cmp.get("v.items");
        items.push(obj);
        cmp.set("v.items", items);

        //fire row add event
        cmp.getEvent("rowAddRemove").setParams({
            last: true,
            count: items.length,
            remove: false
        }).fire();
    }
})