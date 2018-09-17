({
    provide: function(component, event, helper) {
        helper.provide(component, event, this);
    },

    //app level event that is handled for alerts of all severity (modalComponentId is null for info)
    handleAlertDeactivation: function(component, event, helper) {
        helper.deactivateAlert(component, event);
    }
})