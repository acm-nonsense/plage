var hash = location.hash;
var bardata = [];
var sentiment = [];
var topics = [];
    d3.tsv('data.tsv', function(data) {
        console.log(data);

        for (key in data) {
            bardata.push(data[key].interactions)
            sentiment.push(data[key].sentiment)
            topics.push(data[key].topics)
        }

    var margin = { top: 30, right: 20, bottom: 40, left:10 }

    var height = 400 - margin.top - margin.bottom,
        width = 960 - margin.left - margin.right,
        barWidth = 50,
        barOffset = 5;

    var tempColor;

    var colors = d3.scale.linear()
    .domain([0, 10, 50])
    .range(['#FC354C', '#837A84', '#0ABFBC'])

    var yScale = d3.scale.linear()
            .domain([0, d3.max(bardata)])
            .range([0, 120]);

    var xScale = d3.scale.ordinal()
            .domain(d3.range(0, bardata.length))
            .rangeBands([0, width], 0.2)

    var tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'white')
            .style('opacity', 0)
    
    
    //d3.select('#key').html(topics)

    var myChart = d3.select('#chart').append('svg')
        .style('background', '#FFF')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
        .selectAll('rect').data(bardata)
        .enter().append('rect')
            .style('fill', function(d,i) {
                return colors(sentiment[i]);
            })
            .attr('width', xScale.rangeBand())
            .attr('x', function(d,i) {
                return xScale(i);
            })
            .attr('height', 0)
            .attr('y', height)

        .on('mouseover', function(d,i) {

            tooltip.transition()
                .style('opacity', .9)

            tooltip.html(topics[i])
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top',  (d3.event.pageY - 30) + 'px')


            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .5)
                .style('fill', 'yellow')
        })

        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
        })
        
        .on('click', function(d,i) {
            window.location.href = 'http://127.0.0.1:54071/folder.html#'+topics[i];
        })

    myChart.transition()
        .attr('height', function(d) {
            return yScale(d);
        })
        .attr('y', function(d) {
            return height - yScale(d);
        })
        .delay(function(d, i) {
            return i * 20;
        })
        .duration(1000)
    
    var texs = d3.select('svg').append('g')
        .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
        .selectAll('text').data(bardata)
        .enter().append('text')
        .style('fill', 'white')
        .attr('x', function(d,i) {
                return xScale(i) + 1;
            })
        .attr('y', function(d,i){
                return height - (yScale(d) - 10);
            })
        .attr('font-weight', 'bold')
        .text(function(d,i){return topics[i]})
        .attr("font-size", "10px")

});