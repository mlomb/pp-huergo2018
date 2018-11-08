// LO QUE ESTA ABAJO DE ESTO LO HICE YO ASI QUE SI SE ROMPE ALGO ES POR ESTO XD
function AppGotoOne(){
//    alert("Going to el paso 1 xd");
    document.getElementById("AppMainContainer").style.display = "none";
    document.getElementById("AppPasoDosContainer").style.display = "none";
    document.getElementById("AppPasoUnoContainer").style.display = "block";
}
function AppGotoMain(){
//    alert("Going to el main xd");
    document.getElementById("AppMainContainer").style.display = "block";
    document.getElementById("AppPasoUnoContainer").style.display = "none";
    document.getElementById("AppPasoDosContainer").style.display = "none";
    document.getElementById("AppInicioSesionContainer").style.display = "none";
}
function AppGotoTwo(){
//    alert("Going to el paso 2 xd");
    document.getElementById("AppMainContainer").style.display = "none";
    document.getElementById("AppPasoUnoContainer").style.display = "none";
    document.getElementById("AppPasoDosContainer").style.display = "block";
    document.getElementById("AppPasoTresContainer").style.display = "none";
}

//$("optResImage1").click(function(){
////    $("optResImage1").toggleClass("optResImageActive");
//      $(".optResImage1").addClass("optResImageActive");
//});
function Res1Click(){
    document.getElementsByClassName("optResImage")[0].style.width = "500%";
    document.getElementsByClassName("optResImage2")[0].style.width = "97%";
    document.getElementsByClassName("optResImage3")[0].style.width = "97%";
    
    document.getElementById("discapacitadobtn").style.color = "white";
    document.getElementById("normalbtn").style.color = "orange";
    document.getElementById("premiumbtn").style.color = "white";
    document.getElementById("normalbtn").style.fontSize = "15px";
    document.getElementById("discapacitadobtn").style.fontSize = "14px";
    document.getElementById("premiumbtn").style.fontSize = "14px";
}
function Res2Click(){
    document.getElementsByClassName("optResImage")[0].style.width = "97%";
    document.getElementsByClassName("optResImage2")[0].style.width = "500%";
    document.getElementsByClassName("optResImage3")[0].style.width = "97%";
    
    document.getElementById("discapacitadobtn").style.color = "orange";
    document.getElementById("normalbtn").style.color = "white";
    document.getElementById("premiumbtn").style.color = "white";
    document.getElementById("discapacitadobtn").style.fontSize = "15px";
    document.getElementById("normalbtn").style.fontSize = "14px";
    document.getElementById("premiumbtn").style.fontSize = "14px";
}
function Res3Click(){
    document.getElementsByClassName("optResImage")[0].style.width = "97%";
    document.getElementsByClassName("optResImage2")[0].style.width = "97%";
    document.getElementsByClassName("optResImage3")[0].style.width = "500%";
    
    document.getElementById("discapacitadobtn").style.color = "white";
    document.getElementById("normalbtn").style.color = "white";
    document.getElementById("premiumbtn").style.color = "orange";
    document.getElementById("premiumbtn").style.fontSize = "15px";
    document.getElementById("normalbtn").style.fontSize = "14px";
    document.getElementById("discapacitadobtn").style.fontSize = "14px";
}


function discapacitadoClick(){
    Res2Click();
}
function normalClick(){
    Res1Click();
}
function premiumClick(){
    Res3Click();
}