({
    showTooltip: function(component, event, helper) {
        var tooltip = component.find("tooltip").getElement();
        var height = tooltip.clientHeight;
        if (height != component.get("v.oldHeight")) {
            helper.recalculateYPosition(component, event, helper);
        }
        $A.util.toggleClass(tooltip, "slds-hidden", false);
    },
    hideTooltip: function(component, event, helper) {
        var tooltip = component.find("tooltip").getElement();
        $A.util.toggleClass(tooltip, "slds-hidden", true);
    },
    recalculateYPosition: function(component, event, helper) {
        var tooltip = component.find("tooltip").getElement();
        var height = tooltip.clientHeight;
        component.set("v.oldHeight", height)
        var computedCSS = window.getComputedStyle(tooltip);
        var oneEm = 13;
        if ("fontSize" in computedCSS) {
            oneEm = parseInt(computedCSS["fontSize"], 10);
        }
        component.set("v.ypos", 0 - (height + oneEm));
    }
})