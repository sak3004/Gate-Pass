var express=require('express');
var app=new express();
var mongodb=require('mongodb');
var mongoclient=mongodb.MongoClient;
var url="mongodb://127.0.0.1:27017/face";
var multer=require('multer');
var bodyparser=require('body-parser');
app.set('view engine','ejs');
app.use(express.static('assets/css'));
app.use(express.static('assets/fonts'));
app.use(express.static('assets/js'));
app.use(express.static('images'));
app.use(bodyparser.urlencoded({extended:true}));
var rollno;
var nodemailer=require('nodemailer');
var name;
var branch;
var outdate;
var q_result;
var emailer=nodemailer.createTransport("SMTP",{
    host:"smtp.gmail.com",
    secureConnection:false,
    port:587,
    requiresAuth:true,
    domains: ["gmail.com","googlemail.com"],
    auth:{
        user:"gate.pass.software@gmail.com",
        pass:"gatepass21"
    }
});
app.get('/Page1.html',function(req,res)	{
	console.log("File requested");
	rollno=req.query.rollno;
	console.log("page1");
	console.log(rollno);
	res.render('Page1',{rollno:req.query.rollno});
	});

app.get('/Page2',function(req,res)	{
		console.log("Page2 now");
		var moment=require('moment');
		var propDate = moment(dateForm).format('DD/MM/YYYY');
		console.log(rollno);
		console.log(req.query);
		if(req.query.rollno!=undefined)	{
			rollno=req.query.rollno;
			console.log("set req.query.rollno");
			console.log(rollno);
		}
		
		console.log(typeof rollno);
        var date=new Date();
		console.log("Date:" + date);
        console.log(date.toLocaleDateString());
		 
		var dateForm=date.toLocaleDateString();
        	mongoclient.connect(url,function(err,db)	{
			if(err)	{
				return console.error(err);
			}
			db.collection('Students').find({id:rollno}).toArray(function(err,result)	{
				if(err)	{
					return console.error(err);
				}
				console.log(rollno);
				console.log(result.length);
				console.log(result);
                if(result.length!=0)    {
                    console.log(result[0].id);
                    console.log(result[0].name);
                    result[0].ndate=date;
                    outdate=date;
					q_result=result[0];
                    //res.render("Page2",{details:result[0],status:"readonly",input_place:"",input_adate:"",place:"",arrival:""});  
				   res.render("Page2",{propDate,details:result[0],status:"readonly",input_place:"",input_adate:"",place:"",arrival:""});
				}
				
                else    {
                    console.log("No results");
                    res.end("Sorry, you don't exist in the database");
					console.log(rollno);
				}
            });
		});
		
});

app.post('/Page3',function(req,res)  {
    var moment=require('moment');
	var date=new Date();
	var dateForm=date.toLocaleDateString();
	var propDate;
	propDate = moment(dateForm).format('DD/MM/YYYY');
	//console.log("Modified date:" +propDate);
	var ad=req.body.adate;
	var propaDate;
	console.log('ad: '+ad);
	//var adateForm=ad.toLocaleDateString();
    propaDate = moment(ad,'YYYY-MM-DD',true).format('DD/MM/YYYY');
	//console.log('Adjusted date: '+propaDate);
	console.log(req.body);
    var body="Hello,\n Your gate pass has been generated. \n Details:"+"\n Name: "+req.body.name+"\n ID: "+req.body.Studentid+"\n Branch: "+req.body.Branch+ "\n Out Date: "+ propDate+"\n In Date: "+ propaDate+"\n Year: "+req.body.year+"\n Hostel/Room No: "+req.body.Hrno+"\n Phone Number: "+req.body.tel+"\n Address: "+req.body.address+"\n Place of Visit: "+req.body.povisit;
    var esubject="Gate Pass: "+ propDate+" to "+ propaDate;
	if(req.body.adate==''&&req.body.povisit=='') {
        res.render("Page2",{details:q_result,status:"readonly",input_place:"Field cannot be blank",input_adate:"Field cannot be blank",place:"",arrival:"",propDate});
        return;
    }
    else if(req.body.povisit=='') {
        res.render("Page2",{details:q_result,status:"readonly",input_place:"Field cannot be blank",input_adate:"",place:"",arrival:req.body.adate,propDate});
        return;
    }
    else if(req.body.adate=='')  {
        res.render("Page2",{details:q_result,status:"readonly",input_place:"",input_adate:"Field cannot be blank",place:req.body.povisit,arrival:"",propDate});
        return;
    }
	else{
	var mailOptions =      {
        from:'GatePass Service',
        to:req.body.email,
        subject:esubject,
        text:body
		
    };
	res.render('Page3',{});
    
    
    emailer.sendMail(mailOptions,function(err,info) {
        if(err) {
            return console.error(err);
        }
        else    {
            console.log("Message sent");
        }
    });
	var data={
        "id":req.body.Studentid,
        "Place of Visit":req.body.povisit,
        "Date of Departure":req.body.ddate,
        "EDA":req.body.adate,
    }    
        
        
    mongoclient.connect(url,function(err,db)    {
        db.collection('logs').insert(data,function(err,response)   {
            if(err) {
                return console.error(err);
            }
            console.log(response);
        });
    });
	}
});



	
app.listen(3000,function()	{
	console.log("Listening at port 3000");
});	