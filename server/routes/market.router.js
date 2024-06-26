const express = require ('express');
const axios = require('axios');
const router =express.Router();

router.get('/:marketId', (req, res)=>{

    const marketId=req.params.marketId;


axios.get('https://www.predictit.org/api/marketdata/markets/${marketId}')
.then(response=> {
    const marketName =response.data.Name;
    res.json({market_id: marketId marketNae: marktName});
})
.catch(error =>{
    console.log("Problem getting market name for Market ID", error.message)
    res.status(500).send('Internal Server Error')
})



})
module.exports =router;