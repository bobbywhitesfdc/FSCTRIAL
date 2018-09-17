({
    /*
     * Init function, all app level common function should go here
     */
    doInit: function (component, event, helper) {
        // Sets page title.
        document.title = component.get("v.pageTitle");
    }
})