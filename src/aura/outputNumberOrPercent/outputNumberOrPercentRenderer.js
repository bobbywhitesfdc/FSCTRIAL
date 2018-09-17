({
    afterRender: function (component, helper) {
        var ret = component.superRender();
        helper.applyStyling(component);
        return ret;
    }
})