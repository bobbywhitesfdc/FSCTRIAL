({
    displayTime: function(component) {

        if ($A.util.isEmpty(component.get("v.format"))) {
            component.set("v.format", $A.get("$Locale.dateFormat").replace(/y/g,'Y').replace(/d/g, 'D'));
        }

        if (component.get("v.date")) {
            if (component.get("v.showRelativeDate")) {
                moment.locale('en', {
                    calendar: {
                        lastDay: '[' + $A.get("$Label.Feeds.yesterday") + ']',
                        sameDay: '[' + $A.get("$Label.Feeds.today") + ']',
                        nextDay: '[' + $A.get("$Label.Feeds.tomorrow") + ']',
                        lastWeek: component.get("v.format"),
                        nextWeek: component.get("v.format"),
                        sameElse: component.get("v.format")
                    }
                });
                component.set("v.formatDt", moment(component.get("v.date")).calendar());
            } else {
                component.set("v.formatDt", moment(component.get("v.date")).format(component.get("v.format")));
            }
        } else {
            component.set("v.formatDt", "");
        }
    }
})