currentChampionnatId;
currentChampionnatNom;
currentChampionnatNbrEquipes;
currentChampionnatNbrJournees;
currentEquipeId;
currentEquipeNom;
currentEquipeDomId;
currentEquipeExtId;
currentEquipeDomAbr;
currentEquipeExtAbr;
currentScoreDom;
currentScoreExt;

function dbError(err) {
    alert("Error processing SQL : " + err.code);
}

function onDeviceReady() {
    database = window.openDatabase("Database", "1.0", "FootStat", 200000);
    database.transaction(
            function(tx) {
                tx.executeSql('PRAGMA foreign_keys=ON');
                tx.executeSql('DROP TABLE IF EXISTS Championnats');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Championnats (id INTEGER PRIMARY KEY AUTOINCREMENT, nom VARCHAR(30) NOT NULL, pays VARCHAR(30) NOT NULL, nombre_equipes TINYINT NOT NULL)');
                tx.executeSql('DROP TABLE IF EXISTS Equipes');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Equipes (id INTEGER PRIMARY KEY AUTOINCREMENT, nom VARCHAR(30) NOT NULL, abreviation VARCHAR(3) NOT NULL, id_championnat INTEGER, FOREIGN KEY(id_championnat) REFERENCES Championnats(id) ON DELETE CASCADE)');
                tx.executeSql('DROP TABLE IF EXISTS Matchs');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Matchs (id_championnat INTEGER NOT NULL, journee INTEGER NOT NULL, id_equipe_domicile INTEGER NOT NULL, id_equipe_exterieur INTEGER NOT NULL, score_equipe_domicile INTEGER DEFAULT NULL, score_equipe_exterieur INTEGER DEFAULT NULL, PRIMARY KEY (journee, id_equipe_domicile, id_equipe_exterieur) FOREIGN KEY(id_championnat) REFERENCES Championnats(id) ON DELETE CASCADE FOREIGN KEY(id_equipe_domicile) REFERENCES Equipes(id) FOREIGN KEY(id_equipe_exterieur) REFERENCES Equipes(id))');
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
            tx.executeSql('SELECT * FROM Championnats',[],
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
                        championnats += "<div onclick=consulterChampionnat("+ id + ")>" + nom + "</div>";
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
    currentChampionnatId = id;
    
    database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Championnats WHERE id=?',[currentChampionnatId],
                function(tx, result) {
                    currentChampionnatNom = result.rows.item(0).nom;
                    currentChampionnatNbrEquipes = result.rows.item(0).nombre_equipes;
                    currentChampionnatNbrJournees = (currentChampionnatNbrEquipes-1)*2;
                }, dbError);
            },
            dbError);
    
    $.get('js/templates.html',
    function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_championnats').html();
        var title = "<h2>" + currentChampionnatNom + "</h2>";
        var ajouter_match = "<button onclick=loadAjouterMatch()>Creer Match</button>";
        var consulter_matchs = "<button onclick=afficherMatchs()>Afficher Matchs</button>";
        var effacer = "<button onclick=effacerChampionnat()>Effacer</button>";
        var back_button = "</br></br><button onclick='loadConsulterChampionnats()'>Back</button>";
        $("#container").html(header).append(page).append(title).append(ajouter_match).append(consulter_matchs).append(effacer).append(back_button);
    }, 'html');
}

function effacerChampionnat(){
    database.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM Championnats WHERE id=?',[currentChampionnatId],
            function(){
                alert("Championnat "+ currentChampionnatNom +" effacé !");
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
    var back_button = "</br><button onclick='loadMain()'>Back</button>";
    $("#container").html(header).append(page).append(back_button);
}, 'html');
}

function enregistrerAjoutChampionnat() {    
    resetFormulaire();
    
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

function resetFormulaire() { 
    $("#error").each( function(index, element) {
        $(this).remove() });
    //bricolage... verifier pq tous les div error ne sont pas effaces
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
    currentEquipeId = id;
    currentEquipeNom = nom;
    
    $.get('js/templates.html',
    function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_equipes').html();
        var title = "<h2>" + currentEquipeNom + "</h2>";
        var effacer = "<button onclick=effacerEquipe()>Effacer</button>";
        var back_button = "</br></br><button onclick='loadConsulterEquipes()'>Back</button>";
        
        $("#container").html(header).append(page).append(title).append(effacer).append(back_button);
    }, 'html');
}

function effacerEquipe(){
    database.transaction(
        function(tx) {
            tx.executeSql('DELETE FROM Equipes WHERE id=?',[currentEquipeId],
            function(){
                alert("Equipe "+ currentEquipeNom +" effacée !");
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
    var back_button = "</br><button onclick='loadMain()'>Back</button>";
    $("#container").html(header).append(page);
    
    database.transaction(
        function(tx) {
            tx.executeSql('SELECT * FROM Championnats',[],
            function(tx, result) {
                var selec = "<option value=-1>-</option>";
                for(var i=0 ; i<result.rows.length ; ++i) {
                     selec += "<option value=" + result.rows.item(i).id + ">" + result.rows.item(i).nom + "</option>";
                }
                $("#selec_championnat").html(selec);
            }, dbError);
        },
        dbError);
    
    $("#container").append(back_button);
}, 'html');
}

function enregistrerAjoutEquipe() {    
    resetFormulaire();
    var nom = $('#nom');
    var abreviation = $('#abreviation');
    var championnat = $('#selec_championnat');
    var ok = true;
    
    if (nom.val().length == 0) {
        nom.after("<div id='error'>Nom d'equipe manquant !</div>");
        ok = false;
    } else if(nom.val().length > 40) {
        nom.after("<div id='error'>Le nom d'equipe est limité a 40 caractères !</div>");
        ok = false;
    }
    
    if (abreviation.val().length == 0) {
        abreviation.after("<div id='error'>Diminutif d'equipe manquant !</div>");
        ok = false;   
    } else if(abreviation.val().length != 3) {
        abreviation.after("<div id='error'>Le dimutif doit etre constitue de 3 caracteres !</div>");
        ok = false;
    }
    if (championnat.val() == -1) {
        championnat.after("<div id='error'>Choix de chamionnat manquant !</div>");
        ok = false;
    } else {
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT COUNT(Equipes.id) AS nombre_equipes_effectif, nombre_equipes FROM Equipes, Championnats WHERE id_championnat=? AND id_championnat=Championnats.id',[championnat.val()],
                function(tx, result) {
                    var nbreff = result.rows.item(0).nombre_equipes_effectif;
                    var nbr = result.rows.item(0).nombre_equipes;
                    if(nbreff == nbr) {
                        championnat.after("<div id='error'>Le championnat est deja plein !</div>");
                        ok = false;
                    }
                    if (ok) {
                        database.transaction(
                            function(tx) {
                                tx.executeSql('SELECT * FROM Equipes WHERE nom=? OR abreviation=?',[nom.val(), abreviation.val()],
                                function(tx, result) {
                                    if(result.rows.length != 0) {
                                        nom.after("<div id='error'>Une equipe du même nom et/ou avec le même diminutif existe déjà !</div>");
                                    }
                                    else {
                                        tx.executeSql('INSERT INTO Equipes (nom, abreviation, id_championnat) VALUES (?,?,?)', [nom.val(), abreviation.val(), championnat.val()]);
                                        loadConsulterEquipes();
                                    }
                                }, dbError);
                            },
                        dbError);
                    }
                }, dbError);
            },
        dbError);
    }
    
    
}

function loadAjouterMatch() {
    $.get('js/templates.html', function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#ajouter_match').html();
        var enregistrer = "<button onclick=enregistrerAjoutMatch()>Enregistrer</button>";
        var back_button = "</br><button onclick=consulterChampionnat(" + currentChampionnatId + ")>Back</button>";   
        $("#container").html(header).append(page);
        
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Equipes WHERE id_championnat=?' ,[currentChampionnatId],
                function(tx, result) {
                    var selec = "<option value=-1>-</option>";
                    for(var i=0 ; i<result.rows.length ; ++i) {
                         selec += "<option value=" + result.rows.item(i).id + ">" + result.rows.item(i).nom + "</option>";
                    }
                    $("#selec_equip_dom").html(selec);
                    $("#selec_equip_ext").html(selec);
                }, dbError);
            },
        dbError);
        
        var journ;
        for(var i=0 ; i<currentChampionnatNbrJournees ; ++i) {
             journ += "<option value=" + (i+1) + ">" + (i+1) + "</option>";
        }
        $("#journee").html(journ);
        
        $("#container").append(enregistrer).append(back_button);
    }, 'html');
}

function enregistrerAjoutMatch() {
    resetFormulaire();
    
    var eq_dom = $('#selec_equip_dom');
    var eq_ext = $('#selec_equip_ext');
    var sc_dom = $('#selec_score_dom');
    var sc_ext = $('#selec_score_ext');
    var journee = $('#journee');
    var ok = true;
    
    if (parseInt(eq_dom.val()) == -1) {
        eq_dom.after("<div id='error'>Selectionner une equipe !</div>");
        ok = false;
    }
    if (parseInt(eq_ext.val()) == -1) {
        eq_ext.after("<div id='error'>Selectionnez une equipe !</div>");
        ok = false;
    }
    if (ok && parseInt(eq_dom.val()) == parseInt(eq_ext.val())) {
        eq_ext.after("<div id='error'>Une equipe ne peut s'affronter elle-meme !</div>");
        ok = false;
    }
    if (parseInt(journee.val()) == -1) {
        journee.after("<div id='error'>Selectionez une equipe !</div>");
        ok = false;
    }
    
    if(ok) {
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Matchs WHERE id_championnat=? AND journee=? AND (id_equipe_domicile=? OR id_equipe_exterieur=? OR id_equipe_domicile=? OR id_equipe_exterieur=?)' ,[currentChampionnatId, parseInt(journee.val()), parseInt(eq_dom.val()), parseInt(eq_ext.val()), parseInt(eq_ext.val()), parseInt(eq_dom.val())],
                function(tx, result) {
                    if(result.rows.length != 0) {
                        $("#search_error").append("<div id='error'>Au moins une des equipes joue deja pendant cette journee !</div>");
                    } else {
                        database.transaction(
                            function(tx) {
                                tx.executeSql('INSERT INTO Matchs VALUES (?,?,?,?,?,?)', [currentChampionnatId, parseInt(journee.val()), parseInt(eq_dom.val()), parseInt(eq_ext.val()), parseInt(sc_dom.val()), parseInt(sc_ext.val())]);
                                consulterChampionnat(currentChampionnatId);
                            },
                            dbError);
                    }
                }, dbError);
            },
            dbError);
    }
}

function afficherMatchs() { 
    $.get('js/templates.html', function(templates) {
        var header = $(templates).filter('#header').html();
        var page = $(templates).filter('#consulter_matchs').html();
        $("#container").html(header).append(page);
        
        database.transaction(
            function(tx) {
                tx.executeSql('SELECT * FROM Matchs WHERE id_championnat=? ORDER BY journee ASC',[currentChampionnatId],
                function(tx, result) {
                    var res = "";
                    var index = 0;
                    for(var i=0 ; i<currentChampionnatNbrJournees ; ++i) {
                        res += "<h3>Journee " + (i+1) + "</h3>";
                        while(index<result.rows.length && result.rows.item(index).journee == (i+1)) {
                            currentEquipeDomId = result.rows.item(index).id_equipe_domicile;
                            currentEquipeExtId = result.rows.item(index).id_equipe_exterieur;
                            currentScoreDom = result.rows.item(index).score_equipe_domicile;
                            currentScoreExt = result.rows.item(index).score_equipe_exterieur;
                            
                            /*tx.executeSql('SELECT * FROM Equipes WHERE id=?',[currentEquipeDomId],
                                function(tx, result) {
                                    currentEquipeDomAbr = result.rows.item(0).abreviation;
                                }, dbError);
                            
                            tx.executeSql('SELECT * FROM Equipes WHERE id=?',[currentEquipeExtId],
                                function(tx, result) {
                                    currentEquipeExtAbr = result.rows.item(0).abreviation;            
                                }, dbError);*/
                            
                            res += "<div>" + currentEquipeDomId + " VS " + currentEquipeExtId + "</div>";
                            res += "<div>" + currentScoreDom + " - " + currentScoreExt + "</div>";
                            
                            ++index;
                        }
                    }
                    res += "</br>";
                    $("#container").append(res);
                    var back_button = "</br><button onclick=consulterChampionnat(" + currentChampionnatId + ")>Back</button>";   
                    $("#container").append(back_button);
                }, dbError);
            },
        dbError);        
    }, 'html');
}