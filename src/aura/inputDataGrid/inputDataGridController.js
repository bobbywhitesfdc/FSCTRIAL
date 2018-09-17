({
    onInit: function(cmp, event, helper) {
        if(cmp.get("v.autoInit")) {
            helper.onInit(cmp, event, helper);
        }
    },
    onDataChange: function(cmp, event, helper) {
        helper.onDataChange(cmp, event, helper);
    },
    onAddRow: function(cmp, event, helper) {
        cmp.find("add").set("v.disabled", true);
        //tried setting without timeout, however aura renders everything at the same time
        //this will force the disable to render and then the list
        setTimeout($A.getCallback(function() {
            helper.addRow(cmp, event, helper);
        }), 1);
    },
    onRemoveRow: function(cmp, event, helper) {
        helper.onRemoveRow(cmp, event, helper);
    },
    onTableChange: function(cmp, event, helper) {
        if(cmp.get("v.priv_redraw")) {
            helper.setTable(cmp, event, helper);
        }
        //reset redraw to prevent duplicates
        cmp.set("v.priv_redraw", true);
    },
    onValueChange: function(cmp, event, helper) {
        helper.onValueChange(cmp, event, helper);
    },
    deleteRow: function(cmp, event, helper) {
        var params = event.getParam("arguments");
        if(!$A.util.isEmpty(params)) {
            var index = params.index;
            helper.deleteRow(cmp, index);
        }
    },
    isValidGrid: function(cmp, event, helper) {
        var params = event.getParam("arguments");
        if(!$A.util.isEmpty(params)) {
            params.callback(helper.isValidGrid(cmp));
        }
    },
    disableItem: function(cmp, event, helper) {
        var params = event.getParam("arguments");
        if(!$A.util.isEmpty(params)) {
            helper.disableItem(cmp, params.index, params.name, params.disabled);
        }
    },
    invalidateItem: function(cmp, event, helper) {
        var params = event.getParam("arguments");
        if(!$A.util.isEmpty(params)) {
            helper.invalidateItem(cmp, params.index, params.name, params.message);
        }
    },
    validateItem: function(cmp, event, helper) {
        var params = event.getParam("arguments");
        if(!$A.util.isEmpty(params)) {
            helper.invalidateItem(cmp, params.index, params.name, undefined);
        }
    }
})