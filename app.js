//1.importando libreria
const express = require('express');
const app = express(); 
//montando el servidor en la ruta 3000
const port = process.env.PORT || 5000;
var server=app.listen(port,() => {
    console.log(`SERVER RUNNING IN http://localhost:${port}`);
});

///////////////////////////////////
//2. seteamos urlencoded para capturar datos del formulario
app.use(express.urlencoded({extended: false}));
app.use(express.json())

//4 el directorio public
app.use('/resources',express.static('public'));
app.use('resources',express.static(__dirname +'public'));

//5. estableciendo el motor de plantillas
app.set('view engine', 'ejs');

//6. invocamos a bcryptjs
const bcryptjs=require('bcryptjs');

//7 var de session
const session =require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//8. Invocamos al modulo de la conexion de la BD
const connection =require('./database/db');

//9. estableciendo las rutas
app.use('/',require('./routes/routes'));

//10. Registracion
app.post('/register', async (req,res)=>{
    //capturando datos
    const mail=req.body.mail;
    const name=req.body.name;
    const lastname=req.body.lastname;
    const pass=req.body.pass;
    const dni=req.body.dni;
    const address=req.body.address;
    const phone=req.body.phone;
    const date=req.body.date;
    const distrito=req.body.distrito;
    const sexo=req.body.sexo;
    //encriptando la contraseña
    let passwordHaas=await bcryptjs.hash(pass,8);
    //buscamos correo y dni, si ya están en la base de datos no podrá registrarse:
    console.log(req.body);
    connection.query('SELECT * FROM paciente WHERE pac_email= ? ',[mail],async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            if(results.length!=0){
                res.send("USUARIO YA REGISTRADO"); 
            }else{
                connection.query('SELECT * FROM paciente WHERE pac_dni= ? ',[dni],async(error,results)=>{
                    if(error){
                        console.log(error);
                    }else{
                        if(results.length!=0){
                            res.send("USUARIO YA REGISTRADO"); 
                        }else{
                            //si no encuentra los datos, se puede registrar
                            connection.query('INSERT INTO paciente SET ?',{pac_nacimiento:date,pac_dni:dni,pac_apellidos:lastname,pac_nombres:name,pac_email:mail,pac_contrasenia:passwordHaas,pac_celular:phone,pac_direccion:address,pac_distrito:distrito,pac_sexo:sexo,doc_dni:"72865690"},async(error,results)=>{
                                if(error){
                                    console.log(error);
                                }else{
                                    res.send('REGISTRO EXITOSO');
                                }
                            }) 
                        }
                    }
                })
            }
        }
    })

})

//11. autenticacion
app.post('/auth', async(req,res)=>{
    const user= req.body.user;
    const pass= req.body.pass;
    const tipouser=req.body.usertype;
    var ncitas=0;
    let passwordHaash=await bcryptjs.hash(pass,8);
    if(user && pass){
        if(tipouser=="paciente"){
            connection.query('SELECT * FROM paciente WHERE pac_email = ?', [user], async(error,results)=>{
                if(results.length==0 || !(await bcryptjs.compare(pass,results[0].pac_contrasenia))){
                    
                    res.send("Email o contraseña incorrecta");
                    
                }else{
                    
                    connection.query('SELECT * FROM paciente WHERE pac_email = ?', [user], async(error,results)=>{
                        if(error){
                            console.log(error);
                        }else{
                            req.session.loggedin=true;
                            req.session.NOMBRe=results[0].pac_nombres+ " "+ results[0].pac_apellidos;
                            req.session.CORREo=results[0].pac_email;
                            req.session.DIRECCIOn=results[0].pac_direccion;
                            req.session.DNi=results[0].pac_dni;
                            req.session.TELEFONo=results[0].pac_celular;
                            req.session.SEXo=results[0].pac_sexo;
                            req.session.DISTRITo=results[0].pac_distrito;
                            req.session.DNIDOCTOR1=results[0].doc_dni;
                            let fecha=results[0].pac_nacimiento;
                            let a=fecha.toString();
                            let b=a.substring(4,15);
                            req.session.EDAd=b;
                            console.log(req.session.NOMBRe);
                           

                            connection.query('SELECT doc_apellidos, doc_nombres, doc_email,doc_celular,doc_sexo,doc_especialidad FROM paciente INNER JOIN doctores ON paciente.doc_dni=?',["72865690"],async(error,results)=>{
                                if (error){
                                    console.log(error);
                                }else{
                                    req.session.NOMDOC=results[0].doc_nombres+ " "+ results[0].doc_apellidos;
                                    req.session.CORDOC=results[0].doc_email;
                                    req.session.COLDOC=results[0].doc_especialidad;
                                    req.session.SEXODOC=results[0].doc_sexo;
                                    console.log()
                                    res.render('paciente',{
                                        login:true,
                                        NOMBRE: req.session.NOMBRe,
                                        NDOC: req.session.NOMDOC,
                                        NCOR: req.session.CORDOC,
                                        COLDOC: req.session.COLDOC,
                                        SEXODOC: req.session.SEXODOC
                                    });
                                }
                            })
                            
                        }
                    })
                    
                }
            })
        }else{
            connection.query('SELECT * FROM doctores WHERE doc_email= ?', [user], async(error,results)=>{
                
                if(results.length==0  || pass!=results[0].doc_contrasenia){
                    
                    res.send("Email o contraseña incorrecta");
                    
                }else{
                    req.session.loggedin=true;
                    req.session.NOMBREDOCTOR=results[0].doc_nombres+ " "+ results[0].doc_apellidos;
                    req.session.CORREODOCTOR=results[0].doc_email;
                    req.session.TELEFONODOCTOR=results[0].doc_celular;
                    req.session.DNIDOCTOR=results[0].doc_dni;
                    
                    connection.query('SELECT pac_dni FROM paciente', async(error,results)=>{
                        req.session.NUMEROPACIENTES=results.length;
                        
                        var hoy = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
                        
                        connection.query('SELECT * FROM citas WHERE doc_dni=?',[req.session.DNIDOCTOR],async(error,results)=>{
                            for(let i=0;i<results.length;i++){
                                var bbdd=(new Date ((new Date((new Date(new Date(results[i].fecha))).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
                                console.log("BBDD: "+ bbdd+ " HOY: "+hoy);
                                if(hoy==bbdd){
                                    console.log("fechas iguales");
                                    console.log("BBDD: "+ bbdd+ " HOY: "+hoy);
                                }
                            }
                            req.session.NUMEROCITAS=ncitas;
                            res.render('doctor',{
                                npacientes:req.session.NUMEROPACIENTES,
                                ncitas:req.session.NUMEROCITAS
                            }); 
                        })
                    })
                    
                   
                }  
            })

            
        }
     
    } else{
        res.send('Porfavor ingresa un usuario y contraseña!');
        res.end();
    }
});

//12. Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
      console.log('cerraste sesion desde home');
	  res.redirect('login') // siempre se ejecutará después de que se destruya la sesión
	})
});


//13. función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.post('/pagar', async(req,res)=>{
    
    res.redirect('/pago');
})

app.post('/pagar2', async(req,res)=>{
    
    res.redirect('/pago');
})

 
/* Contac Us Js usando nodemailer */
app.use('/',require('./routes/contact-us'));
