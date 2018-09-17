({
    membersInit: function(cmp, event, helper) {
        //Check if Person Account is enabled.
        var action = cmp.get("c.isPersonAccountEnabled");
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var isPersonAccountEnabled = response.getReturnValue();
                cmp.set("v.isPersonAccount", isPersonAccountEnabled);
                //In a person account context, fetch the account ID of the contact.
                var defaultRowValues = cmp.get("v.defaultRowValues");
                if (isPersonAccountEnabled && !$A.util.isEmpty(defaultRowValues)) {
                    var action = cmp.get("c.getPersonAccountsByContactIds");
                    var contactIds = [];
                    contactIds.push(defaultRowValues["ContactId"]);
                    action.setParams({ 
                        "contactIds": contactIds
                    });
                    action.setCallback(this, function(response) {
                        if (response.getState() === "SUCCESS") {
                            var personAccounts = response.getReturnValue();
                            defaultRowValues["AccountId"] = personAccounts[defaultRowValues["ContactId"]].AccountId;
                            cmp.set("v.defaultRowValues", defaultRowValues);
                        }
                    });
                    $A.enqueueAction(action);
                }
                var columnComponentsArr = [];
                if (isPersonAccountEnabled) {
                    columnComponentsArr.push(["ui:dataGridColumn",{
                        "name" : "AccountId",
                        "label" : $A.get("$Label.FinServ.Label_Group_Member_Name"),
                        "class" : "slds-size--5-of-12 slds-form-element__label"
                    }]);
                } else {
                    columnComponentsArr.push(["ui:dataGridColumn",{
                        "name" : "ContactId",
                        "label" : $A.get("$Label.FinServ.Label_Group_Member_Name"),
                        "class" : "slds-size--5-of-12 slds-form-element__label"
                    }])
                }
                columnComponentsArr.push(["ui:dataGridColumn",{
                        "name" : "Roles",
                        "label" : $A.get("$Label.FinServ.Label_Group_Role_In_Group"),
                        "class" : "slds-size--3-of-12 slds-form-element__label"
                    }],
                    ["ui:dataGridColumn",{
                        "name" : "Rollups__c",
                        "label" : $A.get("$Label.FinServ.Label_Group_Activities_Objects_Rollup"),
                        "class" : "slds-size--2-of-12 slds-form-element__label"
                    }],
                    ["ui:dataGridColumn",{
                        "name" : "Primary__c",
                        "label" : $A.get("$Label.FinServ.Label_Group_Primary_Member"),
                        "class" : "slds-size--1-of-12 slds-form-element__label slds-text-align--center"
                    }],
                    ["ui:dataGridColumn",{
                        "name" : "PrimaryGroup__c",
                        "label" : $A.get("$Label.FinServ.Label_Group_Primary_Group"),
                        "class" : "slds-size--1-of-12 slds-form-element__label slds-text-align--center"
                    }]);
                $A.createComponents(columnComponentsArr,
                    function(components, status, errorMessage){
                        if (status === "SUCCESS") {
                            cmp.set("v.headerColumns", components);
                        }
                    }
                );
                helper.onInit(cmp, event, helper); //parent onInit. 
            }
        });
        $A.enqueueAction(action);
    },
    fetchContactIdForPersonAccount: function(cmp, event, helper) {
        var payload = event.getParams().payload;
        if (!$A.util.isEmpty(payload.value)) {
            var action = cmp.get("c.getPersonAccountByAccountId");
            action.setParams({ 
                "accountId": payload.value
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var accs = response.getReturnValue();
                    if (accs == null) {
                        cmp.invalidateItem(payload.index, "AccountId", $A.get("$Label.FinServ.Msg_Error_Invalid_Household_Member_Account"));
                    } else {
                        cmp.validateItem(payload.index, "AccountId");
                        var primaryContactField = helper.getPrefix(cmp) + 'PrimaryContact__c';
                        var contactId = accs[0][primaryContactField];
                        var items = cmp.get("v.items");
                        items[payload.index].ContactId = contactId;
                        cmp.set("v.items", items);
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    confirmRemove: function(cmp, removeIndex) {
        var item = cmp.get("v.items")[removeIndex];
        if(!$A.util.isEmpty(item.ContactId)) {
            //fire confirmation modal
            var removeLabel = $A.get("$Label.FinServ.Button_Label_Remove");
            var attributes = {
                "aura:id": removeIndex,
                label: removeLabel,
                buttonTitle: removeLabel, 
                class: "slds-button slds-button--brand",
                press: cmp.getReference("c.onConfirm")
            };
            $A.createComponent("markup://ui:button", attributes, function(button, status, statusMessage) {
                if (status === "SUCCESS") {
                    var labelCancel = $A.get("$Label.Buttons.cancel");
                    var cancelAction = {
                        title: labelCancel,
                        label: labelCancel,
                        isCancelAction: true
                    };
                    $A.get("e.ui:createPanel").setParams({
                        panelType: "actionModal",
                        visible: true,
                        panelConfig : {
                            title: $A.get("$Label.FinServ.Header_Dialog_Household_Member_Remove"),
                            detail: $A.get("$Label.FinServ.Detail_Dialog_Household_Member_Remove"),
                            footerActions: [button, cancelAction]
                        }
                    }).fire();
                }
            });
        } else {
            cmp.removeRow(removeIndex);
        }
    },
    disableItems: function(cmp, event, helper) {
        var items = cmp.get("v.items");
        for(var i=0; i < items.length; i++) {
            if(!items[i].PrimaryGroup__c) {
                helper.disableRollup(cmp, i);
            }
        }
    },
    validate: function(cmp, event, helper) {
        //loop through all the items, create map of contactids to indexes
        var items = cmp.get("v.items");
        var contactMap = {};
        var primaryMemberIndex = null;
        for(var i=0; i < items.length; i++) {
            var contactId = items[i].ContactId;
            if($A.util.isEmpty(contactId)) {
                cmp.validateItem(i, "ContactId");
            } else {
                var indexes = [];
                if(!$A.util.isEmpty(contactMap[contactId])) {
                    indexes = contactMap[contactId];
                }
                indexes.push(i);
                contactMap[contactId] = indexes;
            }
            //primary member check
            if(items[i].Primary__c) {
                if($A.util.isEmpty(primaryMemberIndex)) {
                    primaryMemberIndex = i
                    cmp.validateItem(i, "Primary__c");
                } else {
                    cmp.invalidateItem(i, "Primary__c", $A.get("$Label.FinServ.Msg_Error_Household_Primary_Member"));
                }   
            } else {
                cmp.validateItem(i, "Primary__c");
            }
            helper.disableRollup(cmp, i);
        }

        //loop through keys
        for(var key in contactMap) {
            var indexes = contactMap[key];
            if(!$A.util.isEmpty(indexes)) {
                //first instance is always valid
                cmp.validateItem(indexes[0], "ContactId");
                if(indexes.length > 1) {
                    //skip the first one as that is valid
                    for(var i=1; i < indexes.length; i++) {
                        cmp.invalidateItem(indexes[i], "ContactId", $A.get("$Label.FinServ.Msg_Error_Group_Member_Duplicate"));
                    }
                }
            }
        }
    },
    disableRollup: function(cmp, index) {
        //primary group check
        var items = cmp.get("v.items");
        if(index >= 0 && index < items.length) {
            cmp.disableItem(index, "Rollups__c", !items[index].PrimaryGroup__c);
        }
    },
    getPrefix: function(component) {
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        return prefix;
    }
})