$('section').each(function(){
    if($(this).attr("id") != "indexPage")$(this).css('display','none');
})

var config = {
    apiKey: "AIzaSyBOzmaikD_lrox31O50TRCtRRz9hdr2ExY",
    authDomain: "tutu-parking.firebaseapp.com",
    projectId: "tutu-parking"
};
firebase.initializeApp(config);

function doLogin(provider) {
    firebase.auth().signInWithPopup(provider);
}

function logOut() {
    firebase.auth().signOut().then(function() {
        window.location = '/api/logout';
    }, function(error) {
        window.location = '/api/logout';
    });
}

function requestSession(idToken) {
    if(firebase.auth().currentUser) {
        firebase.auth().currentUser.getIdToken(false).then(function(idToken) {
            console.log("Login...");
            $('#loadingScreen').css('display','flex');
            $.ajax({
                url: '/api/login/',
                method: 'POST',
                dataType: 'json',
                data: { token: idToken },
                success: function() {
                    console.log("Logged in!");
                    window.location = "/";
                }
            });
        });
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.auth().currentUser.getIdToken(false).then(function(idToken) {
            requestSession(idToken);
        });
    } else {
        requestSession(null);
    }
});

$("#google-login").click(function() {
    doLogin(new firebase.auth.GoogleAuthProvider());
});

$("#facebook-login").click(function() {
    doLogin(new firebase.auth.FacebookAuthProvider());
});

$("#twitter-login").click(function() {
    doLogin(new firebase.auth.GoogleAuthProvider());
});

$("#github-login").click(function() {
    doLogin(new firebase.auth.GithubAuthProvider());
});

$("#register").click(function() {
    firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#pass").val());
});

$('.timepicker').wickedpicker({
    now: '12:00', 
    twentyFour: true,  
});
$('.timepicker').change(function(){
    $("#timeDetail").text($('#timeOne').val() + " - " + $('#timeTwo').val());
    $("input[name='formEntrada']").val($('#timeOne').val());
    $("input[name='formSalida']").val($('#timeTwo').val());
})
$(document).on("click",".progressItem", function(){
    //BARRITA
    $(this).addClass("active");
    $(this).prevAll().addClass("active");
    $(this).nextAll().removeClass("active");

    //MOSTRAR SECCION
    $(".stepSection").each(function(){
        $(this).css('display','none');
    })
    $($(this).attr('target')).css('display','block');

    //MOSTRAR DETALLES
    $($(this).attr('detail')).prevAll().css('display','block');
    $($(this).attr('detail')).css('display','block');
    $($(this).attr('detail')).nextAll().css('display','none');
})
$(document).on("click",".selectParking", function(){
    var slot = $(this).closest(".mdl-card").find(".mdl-card__title-text").text();
    $("#parkDetail").text(slot);
    $("input[name='formSlot']").val(slot);
    goThree();
})
function goTwo(){
    $('#itemTwo').click();
}
function goThree(){
    $('#itemThree').click();
}
function end(){
    var form = $('#payForm').serialize();
    $.ajax({
        method: "POST",
        url: "api/pay",
        data: form,
        success: function(data){
            window.open(data,'_blank');
        }
    });
}

$(document).on('click','a', function(){
    var goto = $(this).attr('goto');
    if(goto){
        $('section').each(function(){
            $(this).css('display','none');
        })
        $('#'+goto).css('display','block');
    }
})