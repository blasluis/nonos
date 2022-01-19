const express = require('express');
const connection = require('../database/db');
const router = express.Router();

router.get('/',(peticion,respuesta)=>{
    respuesta.render('index');
});
router.get('/login',(peticion,respuesta)=>{
    respuesta.render('login');
});
router.get('/register',(peticion,respuesta)=>{
    respuesta.render('register');
});
router.get('/oferta',(peticion,respuesta)=>{
    respuesta.render('oferta');
});

router.get('/dash',(peticion,respuesta)=>{
    respuesta.render('dash');
});

router.get('/pago',(peticion,respuesta)=>{
    respuesta.render('pago');
});

router.get('/tarjeta',(peticion,respuesta)=>{
    respuesta.render('tarjeta');
});




module.exports = router;