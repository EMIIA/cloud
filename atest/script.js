var pivot = new WebDataRocks({
    container: "#pivotContainer",
    toolbar: true,
    height: 580,
    width: "100%",
    report: {
        "dataSource": {
            "dataSourceType": "csv",
            "filename": "https://www.emiia.ai/renga/data.csv"
        },
        
        
      
        
        "slice": {
            "rows": [{
                "uniqueName": "Country"
            }],
            "columns": [{
                    "uniqueName": "Category"
                },
                {
                    "uniqueName": "Measures"
                }
            ],
            "measures": [{
                    "uniqueName": "Price",
                    "aggregation": "median",
                    "format": "3ys5qejd"
                },
                {
                    "uniqueName": "Quantity",
                    "aggregation": "sum",
                    "format": "3ys5q32d"
                },
                {
                    "uniqueName": "Discount",
                    "aggregation": "sum",
                    "format": "3ys5q32d"
                }
            ]
        },
        "options": {
            "grid": {
                "type": "classic"
            }
        },
        "conditions": [{
                "formula": "#value < 5000",
                "measure": "Price",
                "format": {
                    "backgroundColor": "#f45328",
                    "color": "#FFFFFF",
                    "fontFamily": "Arial",
                    "fontSize": "12px"
                }
            },
            {
                "formula": "#value > 700000",
                "measure": "Price",
                "format": {
                    "backgroundColor": "#0598df",
                    "color": "#FFFFFF",
                    "fontFamily": "Arial",
                    "fontSize": "12px"
                }
            }
        ],
        "formats": [{
                "name": "3ys5q32d",
                "thousandsSeparator": " ",
                "decimalSeparator": ".",
                "decimalPlaces": 2,
                "currencySymbol": "",
                "currencySymbolAlign": "left",
                "nullValue": "",
                "textAlign": "right",
                "isPercent": false
            },
            {
                "name": "3ys5qejd",
                "thousandsSeparator": " ",
                "decimalSeparator": ".",
                "decimalPlaces": 2,
                "currencySymbolAlign": "right",
                "nullValue": "",
                "textAlign": "right",
                "isPercent": false
            }
        ]
    },
    reportcomplete: function() {
        createBubbleChart();
    }
});

var chart;

function createBubbleChart() {
    /* Get all the data from the pivot grid (alternatively, a slice can be passed to getData() as the first argument) */
    pivot.amcharts.getData({}, drawChart, updateChart);
}

function drawChart(chartData, rawData) {

    /* Apply amCharts theme */
    am4core.useTheme(am4themes_animated);
    /* Create chart instance */
    chart = am4core.create("chartContainer", am4charts.XYChart);
  /* Add data processed by WebDataRocks to the chart */
    chart.data = chartData.data;
    var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
valueAxisX.renderer.ticks.template.disabled = true;
valueAxisX.renderer.axisFills.template.disabled = true;

var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
valueAxisY.renderer.ticks.template.disabled = true;
valueAxisY.renderer.axisFills.template.disabled = true;

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.valueX = pivot.amcharts.getMeasureNameByIndex(rawData, 0);
var measure1 = pivot.amcharts.getMeasureNameByIndex(rawData, 0);
series.dataFields.valueY = pivot.amcharts.getMeasureNameByIndex(rawData, 1);
var measure2 = pivot.amcharts.getMeasureNameByIndex(rawData, 1);
series.dataFields.value = pivot.amcharts.getMeasureNameByIndex(rawData, 2);
var measure3 = pivot.amcharts.getMeasureNameByIndex(rawData, 2);
series.strokeOpacity = 0;
series.sequencedInterpolation = true;
series.tooltip.pointerOrientation = "vertical";

var bullet = series.bullets.push(new am4core.Circle());
bullet.fill = am4core.color("#ff0000");
bullet.propertyFields.fill = "color";
bullet.strokeOpacity = 0;
bullet.strokeWidth = 2;
bullet.fillOpacity = 0.5;
bullet.stroke = am4core.color("#ffffff");
bullet.hiddenState.properties.opacity = 0;
bullet.tooltipText = `[bold]{Country}:[/]\n ${measure1}: {valueX.value}\n ${measure2}: {valueY.value}\n ${measure3}: {value.value}`;

var outline = chart.plotContainer.createChild(am4core.Circle);
outline.fillOpacity = 0;
outline.strokeOpacity = 0.8;
outline.stroke = am4core.color("#ff0000");
outline.strokeWidth = 2;
outline.hide(0);

var blurFilter = new am4core.BlurFilter();
outline.filters.push(blurFilter);

bullet.events.on("over", function(event) {
    var target = event.target;
    outline.radius = target.pixelRadius + 2;
    outline.x = target.pixelX;
    outline.y = target.pixelY;
    outline.show();
})

bullet.events.on("out", function(event) {
    outline.hide();
})

var hoverState = bullet.states.create("hover");
hoverState.properties.fillOpacity = 1;
hoverState.properties.strokeOpacity = 1;

series.heatRules.push({ target: bullet, min: 2, max: 60, property: "radius" });

bullet.adapter.add("tooltipY", function (tooltipY, target) {
    return -target.radius;
})

chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "zoomXY";
chart.cursor.snapToSeries = series;

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();
}

function updateChart(chartData, rawData) {
    chart.dispose();
    drawChart(chartData, rawData);
}
