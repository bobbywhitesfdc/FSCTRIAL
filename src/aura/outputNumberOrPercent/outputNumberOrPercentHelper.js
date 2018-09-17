({
    applyStyling: function (component) {
        var valueElem = component.find("value").getElement();
        if (component.get("v.isNegative")) {
            $A.util.addClass(valueElem, "negativeGrowth");
        } else {
            component.set("v.value", "+" + component.get("v.value"));
            $A.util.addClass(valueElem, "positiveGrowth");
        }
    }
})