({
    navigateToURL: function (component) {
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": component.get("v.url")
        });
        urlEvent.fire();
    }
})