({
    /*
     * init function. generating a dummy list to iterate over.
     */
    doInit: function (component, event, helper) {
        var tempObject = {
            "Cold": 1,
            "Warm": 2,
            "Hot": 3
        };
        var tempRating = component.get("v.temperatureRating");
        component.set("v.rating", tempObject[tempRating]);

        var maxCount = component.get("v.maxRating");
        var values = [];
        for (var iter = 1; iter <= maxCount; iter++) {
            values.push(iter);
        }
        component.set("v.iterator", values);
    }
})