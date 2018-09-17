({
    confirmClose: function(component, event) {
        var params = {
            attributes: {
                componentId: component.getGlobalId(),
                recordId: component.get("v.recordId")
            },
            message: $A.get("$Label.FinServ.Msg_Confirm_Remove")
        };

        $A.createComponent("FinServ:confirmationModal", params, function(modal, status) {
            if (status === "SUCCESS") {
                $A.get('e.ui:createPanel').setParams({
                    panelType: 'modal',
                    visible: 'true',
                    panelConfig: {
                        title: component.get("v.message"),
                        body: modal,
                        bodyClass: "slds-p-around--none"
                    }

                }).fire();
            }

        });

    }
})