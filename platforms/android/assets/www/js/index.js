function dbError(err) {
    alert("Error processing SQL : " + err);
}

function onDeviceReady() {
    database = window.openDatabase("Database", "1.0", "FootStat", 200000);
    database.transaction(
            function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS Championnat (id INTEGER PRIMARY KEY, nom TEXT)');
                
            },
            dbError
            );
    
    $.get('js/templates.html', function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#main-menu').html(); 
        $("#container").html(header).append(page);
    }, 'html');
}

function loadMain() {
    $.get('js/templates.html', function(templates) {
    var header = $(templates).filter('#header').html();
    var page = $(templates).filter('#main-menu').html(); 
    $("#container").html(header).append(page);
}, 'html');
}

function loadConsulterChampionnats() {
    $.get('js/templates.html', function(templates) {
    var header = $(templates).filter('#header').html();
    var page = $(templates).filter('#consulter_championnats').html();
    $("#container").html(header).append(page);
    
    database.transaction(
        function(tx) {
            tx.executeSql('SELECT * FROM Championnat',[],
            function(tx, result) {
                var championnats = "";
                var back_button = "</br><button onclick='loadMain()'>Back</button>";              
                if(result.rows.length == 0) {
                    championnats = "<div>Pas de championnats enregistre</div></br>";
                }
                else {
                    for(var i=0 ; i<result.rows.length ; ++i) {
                        championnats += "<div onclick='consulterChampionnat(" + result.rows.item(i).id + ")'>" + result.rows.item(i).nom + "</div>";
                        championnats += "</br>";
                    }
                }
                $("#container").append(championnats).append(back_button);
            },
            dbError
            );   
        },
        dbError
    );
    }, 'html');
}

function consulterChampionnat(id){
    $.get('js/templates.html',
    function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_championnats').html();
        var effacer = "</br><button onclick=effacerChampionnat(" + id + ")>Effacer</button>";
        var back_button = "</br></br><button onclick='loadConsulterChampionnats()'>Back</button>";
        $("#container").html(header).append(page).append(effacer).append(back_button);
    }, 'html');
}

function effacerChampionnat(id){
    database.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM Championnat WHERE id=?',[id],
            dbError
            );   
        },
        dbError
    );
    loadConsulterChampionnats();
}

function loadAjouterChampionnat() {
    $.get('js/templates.html', function(templates) {
    var header = $(templates).filter('#header').html();
    var page = $(templates).filter('#ajouter_championnat').html();
    var back_button = "</br><button onclick='loadMain()'>Back</button>"
    $("#container").html(header).append(page).append(back_button);
}, 'html');
}

function enregistrerAjoutChampionnat() {    
    resetFormulaireChampionnat();
    
    var nom = $('#nom')
    var nbr = $('#nbr_equipes');
    var pays = $('#pays');
    var ok = true;
    
    if(nom.val().length > 16) {
        nom.after("<div id='error'>Trop long !</div>");
        ok = false;
    }
    
    if(!$.isNumeric(nbr.val())) {
        nbr.after("<div id='error'>Ceci n'est pas un nombre</div>");
        ok = false;
    }
    if (ok) {
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Championnat WHERE nom=?',[nom.val()],
                function(tx, result) {
                    if(result.rows.length != 0) {
                        ok = false;
                        nom.after("<div id='error'>Un championnat du meme nom existe deja !</div>");
                    }
                    else {
                        database.transaction(
                            function(tx) {
                            tx.executeSql('INSERT INTO Championnat (nom) VALUES (?)', [nom.val()]);
                            }, dbError);
                    }
                }, dbError);
            });
    }
}

function resetFormulaireChampionnat() { 
    $("#error").each( function(index, element) {
        $(this).remove() });
}