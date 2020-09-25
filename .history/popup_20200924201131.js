var r = new XMLHttpRequest();
    r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
    r.send(null); 
if (r.status == 200) { console.log(r.responseText); }