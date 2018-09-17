({
    closeModal: function(component, event, helper) {
        helper.closeModal(component);
    },

    saveModal: function(component, event, helper) {
        $A.get("e.FinServ:confirmationModalEvent").setParams({
            //modal id
            modalId: component.getGlobalId(),
            attributes: {
                //alertComponentId
                componentId: component.get("v.attributes").componentId,
                recordId: component.get("v.attributes").recordId
            }
        }).fire();
    }
})