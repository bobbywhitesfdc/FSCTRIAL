({
    handleError: function(component, event, helper) {
        $A.get("e.force:showToast").setParams({
            message: event.getParam("error"),
            key: "error",
            isClosable: true,
            isSticky: true
        }).fire();
        var alertList = component.find("alertList");
        if (alertList.get("v.items").length == 0) {
            alertList.set("v.visible", false);
        }
    }
})