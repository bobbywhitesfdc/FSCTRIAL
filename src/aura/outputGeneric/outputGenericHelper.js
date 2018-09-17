({
    createComponent: function(component) {
        var fieldType = component.get("v.fieldType");
        var componentDefMap = component.get("v.fieldMap");
        $A.createComponent(fieldType, componentDefMap,
            function(cmp, status, statusMessage) {
                if (status === "SUCCESS") {
                    component.set("v.body", cmp);
                }
            }
        );
    }
})