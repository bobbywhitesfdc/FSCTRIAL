({
    chooseRecordType: function(component, event, helper) {
        var chooseEvent = component.get("e.onChoose");
        var targetSource = event.getSource();
        
        var recordTypeId = targetSource.get("v.value");
        var recordTypeName = targetSource.get("v.label");

        chooseEvent.setParams({
            "recordTypeId": recordTypeId,
            "recordTypeName": recordTypeName
        });
        chooseEvent.fire();
    }
})