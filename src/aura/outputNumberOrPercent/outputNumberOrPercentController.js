({
    applyIndicator: function (component, event, helper) {
        //if negative
        if (component.get("v.indicator")) {
            var value = component.get("v.value");
            if (value < 0) {
                component.set("v.isNegative", true);
            } else {
                component.set("v.isNegative", false);
            }
        }
    }
})