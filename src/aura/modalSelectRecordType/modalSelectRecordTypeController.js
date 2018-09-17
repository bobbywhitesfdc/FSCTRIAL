({
    onInit: function(component, event, helper) {
        helper.onInit(component);
    },

    //Helper function to handle footer actions of the record type selector panel created above.
    onRecordTypeSelect: function(component, event, helper) {
        helper.onRecordTypeSelect(component);
    },

    chooseRecordType: function(component, event, helper) {
        helper.chooseRecordType(component, event);
    }
})