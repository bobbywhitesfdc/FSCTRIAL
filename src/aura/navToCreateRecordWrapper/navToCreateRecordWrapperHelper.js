({
    createNewRecord: function(component) {
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";
        var createEvent = $A.get("e.force:createRecord");
        if (component.get("v.promptRecordType")) {
            // NOTE: this event does not support the following parameters: keyPrefix, recordTypeId
            createEvent = $A.get("e.force:createRecordWithRecordTypeCheck");
        }
        var entityName = component.get("v.sObjectName");
        //Namespace prefix should not be added if the object is standard
        if (/__c$/.test(entityName.toLowerCase())) {
            entityName = prefix + entityName;
        }
        var defaultFieldValues = component.get("v.defaultFieldValues");
        var params = {
            "entityApiName": entityName, //Using entityApiName instead of keyPrefix here. Fix for W-2751333.
            "recordTypeId": component.get("v.recordTypeId"),
            "defaultFieldValues": defaultFieldValues
        };
        var navigateToAfterCreate = component.get("v.navigateToAfterCreate");
        if (typeof navigateToAfterCreate === 'boolean') {
            // fix for W-2755068
            if (navigateToAfterCreate === false) {
                // In order to fire force:refreshView, navigationLocation must be set to 'RELATED_LIST'
                // See plugins-core.xml for more details (ui.aura.navigation)
                params.navigationLocation = component.get("v.navigationLocation");
            }
        }
        createEvent.setParams(params);
        createEvent.fire();
    }
})