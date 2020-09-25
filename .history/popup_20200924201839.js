// const options = {
//     method: 'post',
//     responseType: 'json',
//     data: {
//         url: 'https://www.marketwatch.com/investing/stock/udhi/profile',
//         apikey: '5f6d3b872715cd034def0a658e4d7467a1bb'
//     },
//     url: 'https://api.wintr.com/fetch'
// }

// axios(options)
//     .then((result) => {
//         console.log(result)
//     })
//     .catch((err) => {
//         console.error(err)
//     })

var r = new XMLHttpRequest();
    r.open('GET', 'https://www.marketwatch.com/investing/stock/udhi/profile', false);
    r.send(null); 
if (r.status == 200) { console.log(r.responseText); }
