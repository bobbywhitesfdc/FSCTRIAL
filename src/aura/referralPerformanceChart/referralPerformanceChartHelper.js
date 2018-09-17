({
    /**
     * Report API limit is 2000 rows
     */
    ReportConfig: {
        ROW_LIMIT: 2000,
        COLUMN_LIMIT: 200,
        REFRESH_INTERVAL: 9999999
    },

    ChartConfig: {
        EMPTY_COLOR: "#fff", // Color for the fake line in empty state
        MADE_COLOR: "#52b7d8",
        CONVERTED_COLOR: "#4bca81",
        REJECTED_COLOR: "#C23934",
        MAX_Y_RATIO: 1.2, // Need to apply 1.2 * maxY to get some white space on top
        MAX_EMPTY_Y: 101, // The default maxY for empty state chart
        CHART_HEIGHT: 316,
        LABEL_OFFSET: 28, // Need to increase the chart width because of the label offset in css
        DEFAULT_PERIOD: "Year" // date period default value
    },

    ChartUpdateType: {
        INIT: 1, // Initialize
        DATA: 2, // Chart data refresh
        RESIZE: 3, // Browser resize, only affects x range
    },

    ChartKeys: {
        MAX: 'max',
        MADE: 'Made',
        CONVERTED: 'Converted',
        REJECTED: 'Rejected',
        OPEN: 'Open',
        DATE: 'date',
    },

    /**
     * Goes to the server to fetch data to render the chart
     *
     * @param isRefresh - whether the refresh button was manually clicked
     * @param ignoreExisting - determines if we should ignore the actions response stored
     * @param chartType - YTD, QTD, MTD, All-Time
     */
    getChartData: function(cmp, isRefresh, ignoreExisting, chartType) {
        if (!cmp.isValid()) {
            // safety check
            return;
        }

        var refreshInterval = isRefresh ? 0 : this.ReportConfig.REFRESH_INTERVAL;

        // Reset the chart state variables
        cmp.set("v._chartGenerated", false);
        cmp.set("v._chartConfig", null);
        cmp.set("v._hasNoData", false);
        cmp.set("v._readyForChart", ignoreExisting);
        // default chartType: Year
        var _chartType = $A.util.isEmpty(chartType) ? this.ChartConfig.DEFAULT_PERIOD : chartType;
        cmp.set("v.chartType", _chartType);
        var action = cmp.get('c.getReferralData');
        action.setParams({
            period: _chartType
        });
        action.setCallback(cmp, this.processChartData.bind(this, cmp));
        action.setStorable({
            ignoreExisting: ignoreExisting,
            refresh: refreshInterval
        });
        $A.enqueueAction(action);
    },

    /**
     * Handles the response from the getChartData action
     */
    handleGetChartDataActionResponse: function(cmp, action) {
        //remove refresh treatment: mask, disable refresh button, spinner
        this.updateRefreshTreatment(cmp);
        if (action.getState() === "ERROR") {
            this.handleErrorMsg(cmp);
        } else {
            cmp.set("v.hasError", false);
            var reportData = JSON.parse(action.getReturnValue());
            cmp.set("v._reportData", reportData);

            // update the refresh timestamp
            this.showRefreshTime(cmp, reportData.refreshTime);
            // get the sum of made, converted, rejected amount from data
            cmp.set("v._hasNoData", $A.util.isEmpty(reportData.chartData));
            var chartData = this.convertData(reportData.chartData, reportData.reportMetadata, cmp.get("v.chartType"));
            cmp.set("v._chartData", chartData);
            cmp.set("v.categorySums", this.getCategorySums(chartData));
            this.generateChart(cmp);
        }
    },

    /**
     * Callback for getChartData action
     */
    processChartData: function(cmp, action) {
        if (!cmp.isValid()) {
            // safety check...
            return;
        }

        var helper=this;
        // create the eclair chart
        $A.createComponent(
            "markup://reports:eclairChart", {
                "aura:id" : "eclairChart",
                "definition" : "lightning-timeline-chart",
                "config" : cmp.getReference("v.config"),
                "data" : cmp.getReference("v.data"),
                "accessible" : false,
                "durations" : {default: 0}
            },
            function(chartCmp, status, errorMessage){
                if (status === "SUCCESS") {
                    cmp.set("v._eclairChart", chartCmp);
                    helper.handleGetChartDataActionResponse(cmp, action);
                } else {
                    helper.handleErrorMsg(cmp);
                }
            }
        );
    },

    /**
     * Handle error msg from the server.
     * msgClass is for incomplete case to change the color of error msg
     */
    handleErrorMsg: function(cmp) {
        if (cmp.isValid()) {
            cmp.set("v.hasError", true);
        }
    },

    generateChart: function(cmp) {
        if(!cmp.get("v._chartGenerated")  && this.isChartReady(cmp)){
            this.initConfig(cmp);
            this.updateChartUI(cmp, this.ChartUpdateType.INIT);
            cmp.set("v._chartGenerated", true);
        }
        if (cmp.isValid()) {
            cmp.set("v._isDataReady", true);
        }
    },

    updateChartUI: function(cmp, updateType) {
        if (!cmp.isValid()) {
            // safety check
            return;
        }
        if (this.isChartReady(cmp) && !$A.util.isEmpty(cmp.get("v._chartConfig"))) {
            cmp.set("v.config", cmp.get("v._chartConfig").eclairChartConfig);
            // This will trigger eclair chart update
            cmp.set("v.data", cmp.get("v._chartData"));
        }
    },

    isChartReady : function(cmp) {
        return cmp.get("v._readyForChart") && !cmp.get("v.hasError");
    },

    initConfig: function(cmp) {
        if ($A.util.isEmpty(cmp.get("v._chartConfig"))) {
            var categorySums = cmp.get("v.categorySums");
            var chartConfig = {};
            // Need to keep track of this for re-scaling chart after goal is edited.
            var maxAmount = (!cmp.get("v._hasNoData")) ? categorySums[this.ChartKeys.MAX] : 0;
            var params = this.getConfigParams(cmp, maxAmount);
            var granularityVal = (cmp.get("v.chartType") === "Month" || cmp.get("v.chartType") === "Quarter") ? "week" : "month";
            
            chartConfig["eclairChartConfig"] = {
                "__chartTitle__": $A.get("$Label.HeroChart.Title"),
                "axisMode": "sync",
                "time": {
                    "fields": [{
                        "column": 'date',
                        "label": " ",
                        "dataFormat": 'YYYY-MM-DD',
                        "dataGranularity": "day"
                    }],
                    "granularity": granularityVal,
                    "formats": {
                        "month": "MMM",
                        "week": "MMM DD",
                        "year": "MMM"
                    }
                },
                "measure":{
                    "fields": [{
                        "column": this.ChartKeys.MADE,
                        "label": $A.get("$Label.FinServ.Label_Referrers_Summary_Made"),
                        "domain": [0, params.maxY],
                        "type": "MEASURE",
                        "color": params.madeColor
                    }, {
                        "column": this.ChartKeys.REJECTED,
                        "label": $A.get("$Label.FinServ.Label_Referrers_Summary_Rejected"),
                        "domain": [0, params.maxY],
                        "type": "MEASURE",
                        "color": params.rejectedColor
                    }, {
                        "column": this.ChartKeys.CONVERTED,
                        "label": $A.get("$Label.FinServ.Label_Referrers_Summary_Converted"),
                        "domain": [0, params.maxY],
                        "type": "MEASURE",
                        "color": params.convertedColor
                    }]
                },
                "missingValue": "connect"
            };
            cmp.set("v._chartConfig", chartConfig);
        }
    },

    getConfigParams: function(cmp, maxAmount) {
        var refLines, madeColor, convertedColor, rejectedColor, maxY;
        if (cmp.get("v._hasNoData")) {
            madeColor = this.ChartConfig.EMPTY_COLOR;
            convertedColor = this.ChartConfig.EMPTY_COLOR;
            rejectedColor = this.ChartConfig.EMPTY_COLOR;
            maxY = this.ChartConfig.MAX_EMPTY_Y;
        } else {
            madeColor = this.ChartConfig.MADE_COLOR;
            convertedColor = this.ChartConfig.CONVERTED_COLOR;
            rejectedColor = this.ChartConfig.REJECTED_COLOR;
            // Scale the Y up so there is some white space on top.
            maxY = maxAmount * this.ChartConfig.MAX_Y_RATIO;
        }

        return {
            "madeColor": madeColor,
            "convertedColor": convertedColor,
            "rejectedColor": rejectedColor,
            "maxY": maxY
        };
    },

    /**
     * Convert data of each row to fit the ecalir chart and overlay
     * we need the dateArray which is an ordered list of dates(not localized)
     * that is 1 to 1 mapped to the row data date.
     */
    convertData: function(chartData, reportMetadata, dateGranularity) {
        var helper = this;
        var data = [];
        var startDate = reportMetadata.startDate;
        var endDate = reportMetadata.endDate;
        if ($A.util.isEmpty(chartData)) {
            // Fill in data to get a fake line for empty chart
            startDate = !$A.util.isEmpty(reportMetadata.startDate) ? reportMetadata.startDate : new Date();
            endDate = !$A.util.isEmpty(reportMetadata.endDate) ? reportMetadata.endDate : startDate;
            var start = helper.createDataPoint(startDate, 0, 0, 0);
            var end = helper.createDataPoint(endDate, 0, 0, 0);
            data.push(start);
            data.push(end);
        } else {
            var categorySums = {};
            for(var key in helper.ChartKeys) {
                categorySums[helper.ChartKeys[key]] = 0;
            }

            var dateArray = Object.keys(chartData).sort();
            dateArray.forEach(function(dateValue) {
                for(var key in categorySums) {
                    var point = chartData[dateValue];
                    if(!$A.util.isEmpty(point[key])) {
                        categorySums[key] += point[key];
                    }
                }

                var dataPoint = helper.createDataPoint(dateValue, categorySums[helper.ChartKeys.MADE], categorySums[helper.ChartKeys.CONVERTED], categorySums[helper.ChartKeys.REJECTED]);
                data.push(dataPoint);
            });

            data.chartDateInfo = {
                "dateArray": dateArray,
                "dateGranularity": dateGranularity,
                "dataRows": chartData,
                "categorySums": categorySums
            };

            if (dateArray[0] !== startDate) {
                //add day before as start date
                var firstDate = new Date(dateArray[0]);
                startDate = $A.util.isEmpty(startDate) ? new Date(firstDate.setDate(firstDate.getDate()-1)) : startDate;
                // Fill in the first date if missing
                var dataPoint = helper.createDataPoint(startDate, 0, 0, 0);
                dataPoint.hasNoData = true;
                data.unshift(dataPoint);
            }

            if (!$A.util.isEmpty(endDate) && dateArray[dateArray.length -1] !== endDate) {
                // Fill in the last date if missing
                var dataPoint = helper.createDataPoint(endDate, categorySums[helper.ChartKeys.MADE], categorySums[helper.ChartKeys.CONVERTED], categorySums[helper.ChartKeys.REJECTED]);
                data.push(dataPoint);
                dataPoint.hasNoData = true;
            }
        }
        return data;
    },

    createDataPoint: function(date, made, converted, rejected) {
        var dataPoint = {};
        dataPoint[this.ChartKeys.DATE] = date;
        dataPoint[this.ChartKeys.MADE] = made;
        dataPoint[this.ChartKeys.CONVERTED] = converted;
        dataPoint[this.ChartKeys.REJECTED] = rejected;
        return dataPoint;
    },

    /**
     * Extract made, converted, rejected and grand total amount from report
     * chartData should have rows with the sum of each category: made, converted, rejected
     * Also add the number format
     *
     * example input: data.chartData:[{made:0, converted:1, rejected: 2},
     *                                {made:10, converted:0, rejected: 3}]
     * example output: categorySum : {made:10, converted:1, rejected: 5, max: 10 }
     */
    getCategorySums: function(convertedData) {
        var chartSums = (!$A.util.isEmpty(convertedData.chartDateInfo)) ? convertedData.chartDateInfo.categorySums : {};

        //initialize the sums
        var categorySums = {};
        categorySums[this.ChartKeys.MAX] = 0;
        for(var chartKey in this.ChartKeys) {
            var key = this.ChartKeys[chartKey];
            //save the chart sum
            categorySums[key] = (!$A.util.isEmpty(chartSums) && !$A.util.isEmpty(chartSums[key])) ? chartSums[key] : 0;
            //save the maximum
            categorySums[this.ChartKeys.MAX] = Math.max(categorySums[key], categorySums[this.ChartKeys.MAX]);
        }

        return categorySums;
    },

    showRefreshTime: function(cmp, input) {
        //safety check
        if(!input) {
            return;
        }

        var displayTime;
        var self = this;
        // NOTE: We need to create a date object that is in UTC time
        // so basically we need to add the offset that Date object does when creating Date object
        // example: input is 23:00:00 GMT, computer timezone is PDT(-7)
        // new Date(input) gives you 16:00:00 PDT but we actually want 23:00:00
        // so we have to add the offset(7) back when create the Date
        var inputInUTC = this.getInputDateObjectInUTC(input);

        var displayDate = this.getDisplayDateLabel(input);
        // This is why we have to create the Date object, it doesn't take date string as input
        $A.localizationService.UTCToWallTime(inputInUTC, $A.get("$Locale.timezone"),
                function(result) {
                    // the callback might be async, so we have to set timestamp in the callback
                    // We don't want to show seconds in time stamp so we will use UserContext.timeFormat
                    // instead of $Locale.timeFormat.
                    displayTime = self.formatTime(result);
                    var timestamp = displayDate + " " + displayTime;
                    var label = $A.get("$Label.HeroChart.AsOf");
                    var timeString = label.replace("{timestamp}", timestamp);
                    if (cmp.isValid()) {
                        cmp.set("v.refreshTimestamp", timeString);
                    }
                }
        );
    },

    getInputDateObjectInUTC: function(inputDate){
        var inputDateObj = new Date(inputDate),
        inputOffset = inputDateObj.getTimezoneOffset(),
        inputTime = inputDateObj.getTime(),
        millisecondsInMinute = 60000;

        return new Date(inputTime + (inputOffset * millisecondsInMinute));
    },

    getDisplayDateLabel: function(input){
        var date = new Date();

        // we need the current time in utc too btu it's much easier to get a date string
        var nowUTCString = (date).toISOString();
        date.setDate(date.getDate() - 1);
        var yesterdayUTCString = (date).toISOString();

        // input is sent from server and is already a string in utc format
        if ($A.localizationService.isSame(input, nowUTCString, "day")) {
            return $A.get("$Label.Feeds.today");
        } else if ($A.localizationService.isSame(input, yesterdayUTCString, "day")) {
            return $A.get("$Label.Feeds.yesterday");
        }

        return this.formatDate(input, $A.get("$Locale.dateFormat"));
    },

    updateRefreshTreatment: function(cmp) {
        var that = this;
        // remove refresh mask, spinner and enableRefreshButton only when refresh from clicking the refresh button
        if (cmp.get("v._refreshClicked")) {
            // 300ms is to wait the animation to finish otherwise the experience is not that smooth
            setTimeout($A.getCallback(
                function() {
                    if (cmp.isValid()) {
                        that.toggleSpinnerMask(cmp, false);
                        cmp.set("v.refreshButtonDisabled", false);
                    }
                }
            ), 300);
            cmp.set("v._refreshClicked", false);
        }

        // only remove refresh treatment for chart type change
        if (cmp.get("v._chartTypeChanged")) {
            setTimeout($A.getCallback(
                function() {
                    if (cmp.isValid()) {
                        that.toggleSpinnerMask(cmp, false);
                    }
                }
            ), 300);
            cmp.set("v._chartTypeChanged", false);
        }
    },

    toggleSpinnerMask: function(cmp, willShow) {
        var maskEl = cmp.find('mask').getElement();
        var spinnerEl = cmp.find('refreshSpinner').getElement();

        if (willShow) {
            $A.util.removeClass(maskEl, 'slds-hide');
            $A.util.removeClass(spinnerEl, 'slds-hide');
        } else {
            $A.util.addClass(maskEl, 'slds-hide');
            $A.util.addClass(spinnerEl, 'slds-hide');
        }
    },

    insertDataAccessibility: function(cmp) {
        // For accessibility
        if (!cmp.get("v._dataInserted")) {
            $A.createComponent("markup://FinServ:referralPerformanceChartTable",
                {
                    "items": cmp.get("v.data")
                },
                function(newCmp, status, message){
                    if ('SUCCESS' === status) {
                        if (cmp.isValid()) {
                            var box = cmp.find("assistiveBox");
                            box.set("v.body", newCmp);
                        }
                    } else {
                        $A.get("e.force:showMessage").setParams({
                            "message": $A.get("$Label.HeroChart.ErrorInsertingDataMessage"),
                            "severity": "error"
                        }).fire();
                    }
                }
            );
            cmp.set("v._dataInserted", true);
        }
    },
    
    formatDate: function(dateStr, format) {
        var dateFormat;
        if (!$A.util.isUndefinedOrNull(format)) {
            dateFormat = format;
        } else {
            dateFormat = window.UserContext ? UserContext.dateFormat : 'l';
        }
        return $A.localizationService.formatDate(dateStr, dateFormat);
    },

    formatTime: function(timeStr) {
        var format = window.UserContext ? UserContext.timeFormat : null;
        return $A.localizationService.formatTime(timeStr, format);
    }

})