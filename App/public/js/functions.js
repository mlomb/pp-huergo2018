// LO QUE ESTA ABAJO DE ESTO LO HICE YO ASI QUE SI SE ROMPE ALGO ES POR ESTO XD
function AppGotoOne(){
    alert("Going to el paso 1 xd");
    document.getElementById("AppMainContainer").style.display = "none";
    document.getElementById("AppPasoUnoContainer").style.display = "block";
}
function AppGotoMain(){
    alert("Going to el main xd");
    document.getElementById("AppMainContainer").style.display = "block";
    document.getElementById("AppPasoUnoContainer").style.display = "none";
}
function AppGotoTwo(){
    alert("Going to el paso 2 xd");
    document.getElementById("AppMainContainer").style.display = "none";
    document.getElementById("AppPasoUnoContainer").style.display = "none";
    document.getElementById("AppPasoDosContainer").style.display = "none";
    document.getElementById("AppPasoTresContainer").style.display = "block";
}
