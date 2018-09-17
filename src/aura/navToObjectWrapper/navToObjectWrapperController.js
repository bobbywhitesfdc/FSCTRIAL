({
    navigate: function (component, event, helper) {
        // SFX is navigating to first tab on all link clicked
        event.preventDefault();
        helper.navigateToDetail(component);
    }
})