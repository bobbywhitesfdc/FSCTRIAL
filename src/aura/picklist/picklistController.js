({
    onInit: function (cmp, event, helper) {
        helper.setLabelsAndValues(cmp);
    },

    onSelect: function(cmp, event, helper) {
        helper.setOptions(cmp, event);
        helper.setLabelsAndValues(cmp);
    }
})