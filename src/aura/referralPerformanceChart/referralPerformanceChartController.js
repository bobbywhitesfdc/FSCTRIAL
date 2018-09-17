({
    init: function(cmp, event, helper) {
        cmp.set("v._refreshClicked", false);
        helper.getChartData(cmp, false, false, cmp.get("v.chartType"));
    },

    refreshChart: function(cmp, event, helper) {
        cmp.set("v.refreshButtonDisabled", true);
        cmp.set("v._refreshClicked", true);

        // For accessibility
        // Hide the assistive link while waiting for refresh
        cmp.set("v._isDataReady", false);
        cmp.set("v._dataInserted", false);
        // Empty out the assistive box contents
        cmp.find("assistiveBox").set("v.body", []);

        helper.getChartData(cmp, true, true, cmp.get("v.chartType"));
        helper.toggleSpinnerMask(cmp, true);
    },

    insertData: function(cmp, event, helper) {
        helper.insertDataAccessibility(cmp);
    },

    handleChartTypeChange: function(cmp, event, helper) {
        cmp.set("v._chartTypeChanged", true);
        cmp.set("v._dataInserted", false);
        cmp.set("v._isDataReady", false);
        cmp.find("assistiveBox").set("v.body", []);

        var chartType = event.detail.menuItem.get("v.value");
        cmp.set("v.chartType", chartType);
        helper.getChartData(cmp, false, true, chartType);
        helper.toggleSpinnerMask(cmp, true);
    }
})