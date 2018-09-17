({
    pieChart: function (component) {
        var percent = isNaN(component.get("v.percentage")) ? 0 : component.get("v.percentage");
        var size = component.get("v.size");
        var className = component.get("v.class");
        var fillcolor = component.get("v.color");
        var text = percent.toFixed(0) + (component.get("v.showPercentage")?'%':'');
        var percentage = (percent > 100) ? 100 : percent;

        var svgns = "http://www.w3.org/2000/svg";
        var chart = document.createElementNS(svgns, "svg:svg");
        chart.setAttribute("width", size);
        chart.setAttribute("height", size);
        chart.setAttribute("viewBox", "0 0 " + size + " " + size);
        if (className) {
            chart.setAttribute("class", className);
        }

        // Background circle
        var back = document.createElementNS(svgns, "circle");
        back.setAttributeNS(null, "cx", size / 2);
        back.setAttributeNS(null, "cy", size / 2);
        back.setAttributeNS(null, "r", size / 2);
        var color = "#d0d0d0";
        if (size > 50) {
            color = "#ebebeb";
        }
        back.setAttributeNS(null, "fill", color);
        chart.appendChild(back);
        // primary wedge
        var path = document.createElementNS(svgns, "path");
        var unit = (Math.PI * 2) / 100;
        var startangle = 0;
        var endangle = percentage * unit - 0.001;
        var x1 = (size / 2) + (size / 2) * Math.sin(startangle);
        var y1 = (size / 2) - (size / 2) * Math.cos(startangle);
        var x2 = (size / 2) + (size / 2) * Math.sin(endangle);
        var y2 = (size / 2) - (size / 2) * Math.cos(endangle);
        var big = 0;
        if (endangle - startangle > Math.PI) {
            big = 1;
        }
        var d = "M " + (size / 2) + "," + (size / 2) + // Start at circle center
            " L " + x1 + "," + y1 + // Draw line to (x1,y1)
            " A " + (size / 2) + "," + (size / 2) + // Draw an arc of radius r
            " 0 " + big + " 1 " + // Arc details...
            x2 + "," + y2 + // Arc goes to to (x2,y2)
            " Z"; // Close path back to (cx,cy)
        path.setAttribute("d", d); // Set this path
        path.setAttribute("fill", fillcolor);
        chart.appendChild(path); // Add wedge to chart
        // foreground circle
        var donutThickness = component.get("v.donutThicknessPercentage");
        var innerCircleRadius = 0.5 * (100 - donutThickness)/100; // 0.5 is the back circle radius
        var front = document.createElementNS(svgns, "circle");
        front.setAttributeNS(null, "cx", (size / 2));
        front.setAttributeNS(null, "cy", (size / 2));
        front.setAttributeNS(null, "r", (size * innerCircleRadius)); //about 34% as big as back circle
        front.setAttributeNS(null, "fill", "#fff");
        chart.appendChild(front);

        var data = document.createTextNode(text);
        var text = document.createElementNS(svgns, "text");

        text.setAttributeNS(null, "x", size / 2);
        text.setAttributeNS(null, "y", size / 2);
        text.setAttributeNS(null, "fill", "black");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "dominant-baseline", "central");
        text.setAttributeNS(null, "style", "position: absolute;");
        text.appendChild(data);
        chart.appendChild(text);

        return chart;
    }
})