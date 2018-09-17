({
    createConfirmationModal: function(cmp, actionLabel, action) {
        var func;
        if (action == "remove") {
            func = cmp.getReference("c.onConfirmRemove");
        } else if (action == "delete") {
            func = cmp.getReference("c.onConfirmDelete");
        } else {
            return;
        }
        var attributes = {
            label: actionLabel,
            buttonTitle: actionLabel, 
            class: "slds-button slds-button--brand",
            "press": func
        };
        $A.createComponent("markup://ui:button", attributes, function(button, status, statusMessage) {
            if (status === "SUCCESS") {
                var labelCancel = $A.get("$Label.Buttons.cancel");
                var cancelAction = {
                    title: labelCancel,
                    label: labelCancel,
                    isCancelAction: true
                };
                var titleMessage;
                var detailMessage;
                if (action == "remove") {
                    titleMessage = $A.get("$Label.FinServ.Header_Dialog_Household_Member_Remove");
                    detailMessage = $A.get("$Label.FinServ.Detail_Dialog_Household_Member_Remove");
                } else if (action == "delete") {
                    titleMessage = $A.get("$Label.FinServ.Header_Dialog_Household_Relationship_Delete");
                    detailMessage = $A.get("$Label.FinServ.Detail_Dialog_Household_Relationship_Delete");
                }
                $A.get("e.ui:createPanel").setParams({
                    panelType: "actionModal",
                    visible: true,
                    panelConfig : {
                        title: titleMessage,
                        detail: detailMessage,
                        footerActions: [button, cancelAction]
                    }
                }).fire();
            }
        });
    },

    onConfirmHelper: function(userAction, cmp) {
        var action;
        if (userAction == "remove") {
            action = cmp.get("c.deactivateMembersOnGroups");
        } else if (userAction == "delete") {
            action = cmp.get("c.deleteMemberOnGroup");
        } else {
            return;
        }
        action.setParams({ 
            "identifier": cmp.get("v.recordId"),
            "isRelationship": cmp.get("v.isRelationship")

        });
        $A.get("e.force:toggleModalSpinner").setParams({
            "isVisible": true
        }).fire();
        action.setCallback(this, function(response) {
            $A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": false
            }).fire();
            if (response.getState() === "SUCCESS") {
                //fire record change event
                $A.get("e.force:recordChange").setParams({
                    "recordId": cmp.get("v.recordId"),
                    "record": {
                        Id: cmp.get("v.recordId"),
                        AccountId: cmp.get("v.groupId"),
                        sobjectType: "AccountContactRelation"
                    }
                }).fire();
                //fire off toast
                $A.get("e.force:showToast").setParams({
                    "message": response.getReturnValue().message,
                    "type": "success"
                }).fire();
            } else if(response.getState() === "ERROR") {
                var errors = response.getError();
                if(errors.length > 0) {
                    var error = errors[0];
                    $A.get("e.force:showToast").setParams({
                        "message": error.message,
                        "type": "error"
                    }).fire();
                }  
            }
        });
        $A.enqueueAction(action);
    }
})