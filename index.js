const express = require('express')
const cors = require('cors');

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  origin: '*'
}))

app.get('/test',(req,res)=>{
    res.send("TESTED")
})

app.use('/ee', require('./components/ee/ee'))


  
app.listen(8081, () => {
    console.log("Server is listening on port 8081");
});
