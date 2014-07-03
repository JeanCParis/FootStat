function dbError(err) {
    alert("Error processing SQL : " + err.code);
}

function onDeviceReady() {
    database = window.openDatabase("Database", "1.0", "FootStat", 200000);
    database.transaction(
            function(tx) {
                tx.executeSql('DROP TABLE IF EXISTS Championnats');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Championnats (id INTEGER PRIMARY KEY AUTOINCREMENT, nom VARCHAR(30) NOT NULL, pays VARCHAR(30) NOT NULL, nombre_equipes TINYINT NOT NULL)');
                tx.executeSql('DROP TABLE IF EXISTS Equipes');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Equipes (id INTEGER PRIMARY KEY AUTOINCREMENT, nom VARCHAR(30) NOT NULL, abreviation VARCHAR(3) NOT NULL)');
            },
            dbError
            );
    
    $.ready($.get('js/templates.html', function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#main-menu').html(); 
        $("#container").html(header).append(page);
    }, 'html'));
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
                    championnats = "<div>Pas de championnats enregistrés</div></br>";
                }
                else {
                    for(var i=0 ; i<result.rows.length ; ++i) {   
                        var id = result.rows.item(i).id;
                        var nom = result.rows.item(i).nom;
                        championnats += "<div onclick='consulterChampionnat("+ id +",\""+ nom +"\")'>" + nom + "</div>";
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

function consulterChampionnat(id, nom){
    $.get('js/templates.html',
    function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_championnats').html();
        var title = "<h2>" + nom + "</h2>";
        var effacer = "<button onclick=effacerChampionnat("+id+",\""+nom+"\")>Effacer</button>";
        var back_button = "</br></br><button onclick='loadConsulterChampionnats()'>Back</button>";
        $("#container").html(header).append(page).append(title).append(effacer).append(back_button);
    }, 'html');
}

function effacerChampionnat(id, nom){
    database.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM Championnats WHERE id=?',[id],
            function(){
                alert("Championnat "+ nom +" effacé !");
            },
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
    
    var nom = $('#nom');
    var nbr = $('#nbr_equipes');
    var pays = $('#pays');
    var ok = true;
    var test = "lala";
    
    if (nom.val().length == 0) {
        nom.after("<div id='error'>Nom de championnat manquant !</div>");
        ok = false;   
    } else if(nom.val().length > 16) {
        nom.after("<div id='error'>Le nom d'un championnat est limité a 16 caractères</div>");
        ok = false;
    }
    
    if(nbr.val() == 0) {
        nbr.after("<div id='error'>Nombre d'équipes manquant !</div>");
        ok = false;
    }

    if (ok) {
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Championnats WHERE nom=?',[nom.val()],
                function(tx, result) {
                    if(result.rows.length != 0) {
                        nom.after("<div id='error'>Un championnat du même nom existe déjà !</div>");
                    }
                    else {
                        tx.executeSql('INSERT INTO Championnats (nom, pays, nombre_equipes) VALUES (?,?,?)', [nom.val(), pays.val(), parseInt(nbr.val())]);
                        loadConsulterChampionnats();
                    }
                }, dbError);
            },
            dbError);
    }
}

function resetFormulaireChampionnat() { 
    $("#error").each( function(index, element) {
        $(this).remove() });
}

function loadConsulterEquipes() {
    $.get('js/templates.html', function(templates) {
    var header = $(templates).filter('#header').html();
    var page = $(templates).filter('#consulter_equipes').html();
    $("#container").html(header).append(page);
    
    database.transaction(
        function(tx) {
            tx.executeSql('SELECT * FROM Equipes',[],
            function(tx, result) {
                var equipes = "";
                var back_button = "</br><button onclick='loadMain()'>Back</button>";              
                if(result.rows.length == 0) {
                    equipes = "<div>Pas d'équipes enregistrées</div></br>";
                }
                else {
                    for(var i=0 ; i<result.rows.length ; ++i) {   
                        var id = result.rows.item(i).id;
                        var nom = result.rows.item(i).nom;
                        equipes += "<div onclick='consulterEquipe("+ id +",\""+ nom +"\")'>" + nom + "</div>";
                        equipes += "</br>";
                    }
                }
                $("#container").append(equipes).append(back_button);
            },
            dbError
            );   
        },
        dbError
    );
    }, 'html');
}

function consulterEquipe(id, nom){
    $.get('js/templates.html',
    function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_equipes').html();
        var title = "<h2>" + nom + "</h2>";
        var effacer = "<button onclick=effacerEquipe("+id+",\""+nom+"\")>Effacer</button>";
        var back_button = "</br></br><button onclick='loadConsulterEquipes()'>Back</button>";
        $("#container").html(header).append(page).append(title).append(effacer).append(back_button);
    }, 'html');
}

function effacerEquipe(id, nom){
    database.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM Equipes WHERE id=?',[id],
            function(){
                alert("Equipe "+ nom +" effacée !");
            },
            dbError
            );   
        },
        dbError
    );
    loadConsulterEquipes();
}

function loadAjouterEquipe() {
    $.get('js/templates.html', function(templates) {
    var header = $(templates).filter('#header').html();
    var page = $(templates).filter('#ajouter_equipe').html();
    var back_button = "</br><button onclick='loadMain()'>Back</button>"
    $("#container").html(header).append(page).append(back_button);
}, 'html');
}

function enregistrerAjoutEquipe() {    
    resetFormulaireEquipe();
}

function resetFormulaireEquipe() { 
    $("#error").each( function(index, element) {
        $(this).remove() });
}