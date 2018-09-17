({
    /*
     * Init function sets the attribute
     */
    doInit: function(component, event, helper) {
        var objectName = component.get("v.sObjectName");
        var uId = $A.get("$SObjectType.CurrentUser.Id");
        var condition = {
            IsClosed: 'false',
            ownerId: uId
        };
        // set the current time to the timestamp component (including timezone info)
        var date = moment().format('YYYY-MM-DD');
        component.set("v.timestamp", date.toString());
        component.set("v.filterCriteria", condition);
        helper.getList(component);
        helper.getRecordCount(component);
    }
})