// Used for displaying data graph

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(getHistory);

function getHistory() {
	$.ajax({
		url: "/weather/history",
		data: coords,
		type: "get",
		success: function(response) {
			console.log(response)
			var hourlyHistoryData = [["Hour", "Temp", "Precip"]];
			// push all the response data into hourlyHistoryData
			response.forEach(function(day) {
				day.hourly.data.forEach(function(hour) {
					hourlyHistoryData.push(["", hour.temperature, hour.precipProbability*100]);
				})
			});
			drawChart(hourlyHistoryData);
		},
		error: function(response) {
			console.log('error getting ajax')
		}
	});
	
}

function drawChart(hourlyHistoryData) {
	var graphData = google.visualization.arrayToDataTable(hourlyHistoryData);
  var options = {
  	// chartArea: {left: 70, right: 70},
    hAxis: {viewWindowMode: "maximized", textPosition: 'none'},
    vAxis: {viewWindowMode: "maximized"},
    // legend: {position: 'none'},
    tooltip: {trigger: 'none'},
    animation: {startup: true, duration: 1000, easing: 'linear'},
    series: {
    	0: {areaOpacity: '0', color: 'red'},
    	1: {color: 'blue', areaOpacity: 0.1, lineWidth: 1}
    }
  };

  var chart = new google.visualization.AreaChart(document.getElementById('graph'));
  chart.draw(graphData, options);
}