const mysql =require('mysql2');
const connection =mysql.createConnection({
    host: "localhost",//process.env.HOST || "localhost",
    database:  "mp",   //process.env.DATABASE ||  "covidtrack",
    user: "root",// process.env.USER ||"root",
    password: "root",//process.env.PASSWORD || "",
    multipleStatements: true
});
connection.connect((error)=>{
    if(error){
        console.log('Error: '+error);
        return;
    } 
    console.log('CONECTADO A LA BASE DE DATOS!');
});
module.exports=connection;