var hash = location.hash;
var bardata = [];
var sentiment = [];
var sentiment_temp = [];
var topics = [];

var title_0 = [];
var cid_0 = [];
var sent_0 = [];

var title_1 = [];
var cid_1 = [];
var sent_1 = [];

var title_2 = [];
var cid_2 = [];
var sent_2 = [];

var title_3 = [];
var cid_3 = [];
var sent_3 = [];

var title_4 = [];
var cid_4 = [];
var sent_4 = [];

var titles = [];
var cids = [];
var sents = [];

var piazzalink = 'https://piazza.com/class/ijlshsrl45w472';

function locationHashChanged() {
    location.reload()
}

window.onhashchange = locationHashChanged;

var csvloc = '/folders.csv';
if (hash){
    csvloc = "/"+hash.substr(1)+'.csv'
}

    d3.csv(csvloc, function(data) {
        
        if (hash){
            d3.select('#gotofolder').html("<a href='index.html"+""+"'>Home</a>");
            console.log("wat");
        }
        console.log(data);

        for (key in data) {
            bardata.push(data[key].interactions)
            bardata = bardata.map(function(item) {
                var i = parseInt(item, 10);
                if (i > 20){
                    return i;
                }
                return 20;
            });
            
            sentiment_temp.push(data[key].sentiment);
            sentiment = sentiment_temp;
            sentiment = sentiment_temp.map(function(item) {
                return Math.round(parseFloat(item, 10) * 1000);
            });
            
            topics.push(data[key].name)
            
            title_0.push(data[key].title_0)
            title_1.push(data[key].title_1)
            title_2.push(data[key].title_2)
            title_3.push(data[key].title_3)
            title_4.push(data[key].title_4)
            titles = [title_0, title_1, title_2, title_3, title_4];
            
            cid_0.push(data[key].cid_0)
            cid_1.push(data[key].cid_1)
            cid_2.push(data[key].cid_2)
            cid_3.push(data[key].cid_3)
            cid_4.push(data[key].cid_4)
            cids = [cid_0, cid_1, cid_2, cid_3, cid_4];
            
            sent_0.push(data[key].sentiment_0)
            sent_1.push(data[key].sentiment_1)
            sent_2.push(data[key].sentiment_2)
            sent_3.push(data[key].sentiment_3)
            sent_4.push(data[key].sentiment_4)
            sents = [sent_0, sent_1, sent_2, sent_3, sent_4];
        }

    var margin = { top: 30, right: 20, bottom: 40, left:10 }

    var height = 400 - margin.top - margin.bottom,
        width = 960 - margin.left - margin.right,
        barWidth = 50,
        barOffset = 5;

    var tempColor;
    
    d3.select('#mostDiscussed').html(topics[findArr(bardata, d3.max(bardata))])
    d3.select('#leastLiked').html(topics[findArr(sentiment, d3.min(sentiment))])
    d3.select('#mostLiked').html(topics[findArr(sentiment, d3.max(sentiment))])

    var colors = d3.scale.linear()
    .domain([d3.min(sentiment), d3.max(sentiment)])
    .range(['#FC354C', '#0ABFBC'])
    
    var sentiment_adj = d3.scale.linear()
    .domain([d3.min(sentiment), d3.max(sentiment)])
    .range([0, 100])

    var yScale = d3.scale.linear()
            .domain([0, d3.max(bardata)])
            .range([0, 340]);

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
            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .8)
                .style('fill', '#000000')
        })

        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
        })
        
        .on('click', function(d,i) {
            //window.location.href = '/entity.html#'+topics[i];
            if (!hash){
                d3.select('#gotofolder').html("<a href='index.html#"+topics[i]+"'>Folder View</a>");
            }
            
            d3.select('#post0')
                .html(titles[0][i])
                .style('color', colors(sents[0][i]*1000))
            d3.select('#post1')
                .html(titles[1][i])
                .style('color', colors(sents[1][i]*1000))
            d3.select('#post2')
                .html(titles[2][i])
                .style('color', colors(sents[2][i]*1000))
            d3.select('#post3')
                .html(titles[3][i])
                .style('color', colors(sents[3][i]*1000))
            d3.select('#post4')
                .html(titles[4][i])
                .style('color', colors(sents[4][i]*1000))
            
//            d3.select('#post0s').html(Math.round(sents[0][i]*1000))
//            d3.select('#post1s').html(Math.round(sents[1][i]*1000))
//            d3.select('#post2s').html(Math.round(sents[2][i]*1000))
//            d3.select('#post3s').html(Math.round(sents[3][i]*1000))
//            d3.select('#post4s').html(Math.round(sents[4][i]*1000))
            
            d3.select('#post0a').attr('href', piazzalink+"?cid="+cids[0][i])
            d3.select('#post1a').attr('href', piazzalink+"?cid="+cids[1][i])
            d3.select('#post2a').attr('href', piazzalink+"?cid="+cids[2][i])
            d3.select('#post3a').attr('href', piazzalink+"?cid="+cids[3][i])
            d3.select('#post4a').attr('href', piazzalink+"?cid="+cids[4][i])
            
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