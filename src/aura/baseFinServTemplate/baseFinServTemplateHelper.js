({
    showErrorToast: function(component) {
        $A.get("e.force:showToast").setParams({
            message: $A.get("$Label.FinServ.Msg_Error_General"),
            key: "error",
            isClosable: true,
            isSticky: true
        }).fire();
    },
    fireErrorEvent: function(component, response) {
        var errorEvent = component.getEvent("error");
        errorEvent.setParams({
            error: response
        }).fire();
    }
})