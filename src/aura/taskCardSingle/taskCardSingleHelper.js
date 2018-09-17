({
    handleSelect: function(component, event, helper) {
        component.set("v.isChecked", !component.get("v.isChecked"));
        component.set("v.disableCheckbox", true);
        //strikethrough
        var sObjectType = component.get("v.sObjectName");
        var updateFieldMap = {
            'Id': component.get("v.id")
        };
        if (component.get("v.isChecked")) {
            updateFieldMap['Status'] = 'Completed';
        } else {
            updateFieldMap['Status'] = 'In Progress';
        }
        updateTask(sObjectType, updateFieldMap);
        /*
         * update task with provided object type and set of fields.
         */
        function updateTask(sObjectType, updateFieldMap) {
            /*$A.get("e.force:toggleModalSpinner").setParams({
                "isVisible": true
            }).fire();*/ // the spinner is breaking safari on double click

            var action = component.get("c.updateSObject");
            action.setParams({
                "sObjectName": sObjectType,
                "fieldMap": updateFieldMap
            });
            action.setCallback(this, function(result) {
                /*$A.get("e.force:toggleModalSpinner").setParams({
                    "isVisible": false
                }).fire();*/

                if (result.getState() === "SUCCESS") {
                    var res = result.getReturnValue();
                    if (!$A.util.isEmpty(res)) {
                        $A.get("e.force:showToast").setParams({
                            message: $A.get("$Label.FinServ.Msg_Success_Task_Updated"),
                            key: "success",
                            isClosable: true
                        }).fire();
                    }
                } else if (result.getState() == "ERROR") {
                    var errorMessage = "";
                    if (!$A.util.isEmpty(result.getError())) {
                        for (var key in result.getError()) {
                            if (!$A.util.isEmpty(result.getError()[key]["message"])) {
                                errorMessage += result.getError()[key]["message"];
                            }
                        }
                    }
                    $A.get("e.force:showToast").setParams({
                        message: errorMessage,
                        key: "error",
                        isClosable: false

                    }).fire();
                }
                component.set("v.disableCheckbox", false);
            });
            $A.enqueueAction(action);
        }
    }
})