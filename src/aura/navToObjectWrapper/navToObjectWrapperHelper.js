({
        navigateToDetail: function (component) {
            var sObjectEvent = $A.get("e.force:navigateToSObject");
            sObjectEvent.setParams({
                "recordId": component.get("v.sObjectId"),
                "slideDevName": 'detail'
            });
            sObjectEvent.fire();
        }
})