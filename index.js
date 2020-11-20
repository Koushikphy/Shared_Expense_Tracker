const expenseByDate     = document.getElementById('expenseByDate');
const expenseByUser     = document.getElementById('expenseByUser');
const expenseByCategory = document.getElementById('expenseByCategory');
var currentEditabele=undefined, saved=false, users, categories, records, myTable;



window.onload = () =>{
    Plotly.newPlot(expenseByDate, new Array(4).fill(0).map(u=>clone(lineConfig)),layout, config )
    Plotly.newPlot(expenseByUser, [pieConfig],layout2, config );
    Plotly.newPlot(expenseByCategory, [pieConfig],layout2, config );
    loadDataFromStorage()
    startTable()

    updateListDOMs()
    updateTable()
    if(records.length) updateRecords()
}

window.onbeforeunload = () =>{
    if(!saved) alert('Save first')
}


function loadDataFromStorage(){
    [users, categories, records] = ['users', 'categories', 'records'].map(e=>{
        let uu = localStorage.getItem(e)
        return uu!=null? JSON.parse(uu) : []
    })
}


function saveDataToStorage(){
    ['users', 'categories', 'records'].forEach(e=>{
        localStorage.setItem(e, JSON.stringify(window[e]))
    })
}


function updateListDOMs(){
    $('#uList').val(users.join(','))
    $('#cList').val(categories.join(','))
    myTable.options.columns[1].source = users
    myTable.options.columns[3].source = categories
    myTable.options.columns[5].source = ['All',...users]
}


function updateLists(){
    users = $('#uList').val().split(',').map(e=>e.trim())
    categories = $('#cList').val().split(',').map(e=>e.trim())
    saveDataToStorage()
    updateListDOMs()
    selectPage(0)
}


function calculateShares(){
    var spent  = Object.fromEntries(users.map(i=>[i,0]))
    var totOwe = Object.fromEntries(users.map(i=>[i,0]))
    var netOwe = Object.fromEntries(users.map(i=>[i,0]))

    for(let rec of records){
        let amount = parseFloat(rec.amount);
        let shareBy = rec.shareBy.split(';');
        shareBy = shareBy.length==1 && shareBy[0]=='All' ? users : shareBy;
        let sAmount = amount/shareBy.length;
        // spent calculation
        spent[rec.person] += amount
        //owe calculation
        for(let pp of shareBy) {
            netOwe[pp] += sAmount
            totOwe[pp] += sAmount
        }
        netOwe[rec.person] -= amount
    }

    $("#spendStat").html(users.map(i=>`
    <div class="SpentDetails">
        <div class="sChildName"> ${i} </div>
        <div class="sChildAmount"> ${spent[i].toFixed(2)}</div>
    </div>`).join(''))

    $("#oweStat").html(users.map(i=>`
    <div class="SpentDetails">
        <div class="sChildName"> ${i} </div>
        <div class="sChildAmount"> ${netOwe[i].toFixed(2)} </div>
    </div>`).join(''))

    $("#totOweStat").html(users.map(i=>`
    <div class="SpentDetails">
        <div class="sChildName"> ${i} </div>
        <div class="sChildAmount"> ${totOwe[i].toFixed(2)} </div>
    </div>`).join(''))
}


function updateRecords(){
    calculateShares()
    saveDataToStorage()
    updatePlot()
}


function updatePlot(){
    var tmp = transpose(
            uniqueDates(records.map(i=>i.date)).map(dt=> 
                [dt, ...users.map(u=>sum(records.filter(i=>i.date==dt).filter(i=>i.person==u).map(i=>parseFloat(i.amount))))]
            ).map(arr=>[...arr, sum(arr.slice(1))])
        )

    Plotly.restyle(expenseByDate, {
        x : [tmp[0]],
        y : tmp.splice(1),
        name: [...users,'Total']
    })

    var tmp = transpose(users.map(u=>[u, sum(records.filter(i=>i.person==u).map(i=>parseFloat(i.amount)))]))
    Plotly.restyle(expenseByUser,{
        values: [tmp[1]],
        labels: [tmp[0]],
    })

    var tmp = transpose(categories.map(u=>[u, sum(records.filter(i=>i.category==u).map(i=>parseFloat(i.amount)))]))
    Plotly.restyle(expenseByCategory,{
        values: [tmp[1]],
        labels: [tmp[0]],
    })
}


function importData(){
    alert('This will remove all existing records');
    const fileInput = document.createElement("input")
    fileInput.type='file'
    fileInput.style.display='none'
    fileInput.onchange=(ev)=>{
        var file = ev.target.files[0]
        if(!file) return
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        reader.onload = (event) => {
            let content = JSON.parse(event.target.result); 
            users = content.users
            categories = content.categories
            records = content.records
            updateListDOMs()
            updateRecords()
            updateTable()
            selectPage(0)
        }
    }
    document.body.appendChild(fileInput)
    fileInput.click()
    fileInput.remove()
}


function exportData(){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({users,categories,records},null,4)], {type: "text/plain"}));
    a.setAttribute("download", "data.json");
    document.body.appendChild(a);
    a.click();
    a.remove()
}


function selectPage(m){
    $("#root,#analysis,#settings").hide()
    $(["#root","#analysis","#settings"][m]).show()
    window.dispatchEvent(new Event('resize'));
}


function startTable(){
    myTable = jexcel(document.getElementById('sheet'), {
        columns: [
            {type:'calendar',title:'date', options: { format:'DD-MM-YYYY', resetButton:false, fullscreen:true }},
            {type:'dropdown',title:'Spent By', autocomplete:true, multiple:false, source: users},
            {type:'text',    title:'Item' },
            {type:'dropdown',title:'Category', autocomplete:true, multiple:false, source: categories},
            {type:'numeric', title:'Amount' },
            {type:'dropdown',title:'Shared By',autocomplete:true, multiple:true,  source : ['All',...users]},
        ],
        // tableOverflow:true,
        defaultColWidth         : (document.getElementById('sheet').offsetWidth-55)/6,
        csvFileName             : 'data',
        csvDelimiter            : ',',
        allowRenameColumn       : false,
        search                  : true,
        pagination              : 15,
        csvHeaders              : true,
        minSpareRows            : true,
        includeHeadersOnDownload: true,
        columnDrag              : false,
        rowDrag                 : false,
        allowInsertColumn       : false,
        allowDeleteColumn       : false,
        allowRenameColumn       : false,
        wordWrap                : true,
        selectionCopy           : false,
        onchange                : ()=>{
            let tt = myTable.getData().filter(e=>!e.includes(''))
            if(!isEqual(tt,records.map(Object.values))) {
                records = tt.map(e=>Object.fromEntries(transpose([['date','person','item','category','amount','shareBy'],e])))
                updateRecords()
            }
        }
    });
}


function updateTable(){
    if(records.length) myTable.setData(records.map(e=>[e.date, e.person, e.item, e.category, e.amount, e.shareBy]))
}



const sum = (arr)=> arr.reduce((a, b) => a + b, 0);
const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));
const uniqueDates = (arr)=> arr.sort((a,b)=>a.replaceAll('-','').localeCompare(b.replaceAll('-',''))).filter((i,j,self)=>self.indexOf(i)===j)
const clone = (x) => JSON.parse(JSON.stringify(x));
const isEqual = (arrA,arrB)=> arrA.length == arrB.length && arrA.every(elA=>arrB.some(elB=>elA.every(e=>elB.includes(e))));

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

