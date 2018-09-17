({
    navigate: function (component, event, helper) {
        // Matches markup://<namespace> and extracts namespace
        var nameSpace = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        component.set("v.view", component.get("v.view").replace(/^c:/, nameSpace + ":"));
        var attributes = component.get("v.attributes");
        //initialize
        if (helper.isPlainObject(attributes)) {
            attributes = {};
        }
        var recordId = component.get("v.recordId");
        if (!$A.util.isUndefinedOrNull(recordId)) {
            attributes.recordId = recordId;
        }
        $A.get("e.force:navigateToComponent").setParams({
            componentDef: "aura:placeholder",
            componentAttributes: {
                refDescriptor: component.get("v.view"),
                attributes: attributes
            }
        }).fire();
    }
})