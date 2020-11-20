const sum = (arr)=> arr.reduce((a, b) => a + b, 0)
const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));
const uniqueDates = (arr)=> arr.sort((a,b)=>a.replaceAll('-','').localeCompare(b.replaceAll('-',''))).filter((i,j,self)=>self.indexOf(i)===j)
const clone = (x) => JSON.parse(JSON.stringify(x));
const isEqual = (arrA,arrB)=> arrA.length == arrB.length && arrA.every(elA=>arrB.some(elB=>elA.every(e=>elB.includes(e))))

const layout = {
    autosize: true,
    plot_bgcolor: "#fafafa",
    paper_bgcolor: '#fff',
    hovermode: "closest",
    title: '',
    titlefont:{
        family:"Droid Sans",
        size:20,
        color:'#000000'
    },
    margin: {
        t: 10,
        r: 0,
        b: 10,
        l: 0,
        pad: 0
    },
    xaxis: {
        title: ' ',
        automargin: true,
        zeroline: false,
        showline: true,
        showgrid: false,
        tickformat: "%b %d, %y",
        titlefont:{
            family:"Droid Sans",
            size:20,
            color:'#000000'
        }
    },
    yaxis: {
        title: 'Rupees',
        automargin: true,
        zeroline: false,
        showline: true,
        showgrid: true,
        tickformat: " ,.2f",
        dtick:'',
        hoverformat: " ,.2f",
        titlefont:{
            family:"Droid Sans",
            size:20,
            color:'#000000'
        }
    },
    font: {
        size: 14
    },
    selectdirection: "any",
    showlegend: true,
    legend: {
        x: 0,
        y: 1
    }
}



const layout2 = {
    autosize: true,
    hovermode: true,
    margin: {
        t: 10,
        r: 10,
        b: 10,
        l: 10,
        pad: 0
    },
    showlegend: false,

}


const config = {
    displaylogo:false,
    responsive: true,
    modeBarButtonsToRemove : ["toImage","sendDataToCloud"],
}

const lineConfig = {
    type: 'scatter',
    opacity: 1,
    mode: 'markers+lines',
    marker: {
        symbol: "circle-dot",
        size: 6,
        opacity: 1
    },
    line: {
        width: 2,
        dash: 0,
        shape: 'linear'
    },
    hovertemplate: '%{x}<br>'+ '   <b>%{y}</b> ',
    tickformat: 'dd-mm-yyyy'
    // hoverinfo: 'name+x+y'
}

const pieConfig ={
    type: 'pie',
    textinfo: "label+percent+value",
    textposition: 'inside',
}

