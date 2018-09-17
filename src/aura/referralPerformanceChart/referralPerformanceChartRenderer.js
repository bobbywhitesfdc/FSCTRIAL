({
    afterRender: function(cmp, helper) {
        // Render chart when the dom is ready and the result is back from server
        // First time and refresh, the server call back will render chart
        // Cache state, we initiate chart render from here
        cmp.set("v._readyForChart", true);
        if (!$A.util.isEmpty(cmp.get("v._reportData"))) {
            helper.generateChart(cmp);
        }
        this.superAfterRender();
    }
})