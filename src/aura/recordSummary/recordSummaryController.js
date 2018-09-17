({
    doInit: function (component, event, helper) {
        helper.showLoading(component, true);
        helper.getFieldsHelper(component, event, helper);
    },
    onChange: function(component, event, helper) {
        //use helper function to determine if event is pertinent
        if(helper.isEventRelated(component, event)) {
            helper.showLayout(component, helper);
        }
    } 
})