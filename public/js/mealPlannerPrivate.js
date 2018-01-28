var recipeList, popupRecipe, ingredients, recipeListEdit, recipe, chosenRecipe, ing, recipeCalender;

$(function () {

    var s = window.location.search.substring(1,window.location.search.length).split("&");
    var o = {};
    for(var i = 0; i < s.length;i ++){
        var a = s[i].split("=");
        o[a[0]]=a[1];
    }

    /**
     * This method gets all the recipes saved on different days in the calender in the database.
     * @type {string}
     */
    var recipeNameChosenGroup= "";
    var recipeTimeChosenGroup= "";
    $.ajax({
        url: '/api/recipe/person/' + localStorage.person_id,
        method: 'GET',
        success: function (datatFOod) {
            var events = [];
            for(var i = 0; i <datatFOod.length; i++){
                recipeNameChosenGroup = datatFOod[i].recipe_name;
                recipeTimeChosenGroup = datatFOod[i].meal_datetime.split("T")[0];
                console.log(recipeNameChosenGroup);
                console.log(recipeTimeChosenGroup);
                events.push({
                    title:recipeNameChosenGroup,
                    start:recipeTimeChosenGroup,
                    recipe_id: datatFOod[i].recipe_id
                });
            }

            /**
             * This method creates the standard calender.
             */
            $('#calendar').fullCalendar({
                height: 630,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay,listWeek'
                },
                defaultDate: '2018-01-01',
                navLinks: true, // can click day/week names to navigate views
                eventLimit: true, // allow "more" link when too many events
                events: events,
                editable: true,
                droppable: true, // this allows things to be dropped onto the calendar
                drop: function() {
                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }
                },
                eventColor: '#7ebccc',
                eventDrop: function (e) {
                    console.log(e);
                    console.log(e.start._i)
                },
                eventClick: function (test) {
                    console.log(test.recipe_id);
                    var ingd = "";
                    for(var i = 0; i < recipe.length; i++){
                        if(test.recipe_id==recipe[i].recipe_id){
                            ingd = recipe[i];
                        }
                    }

                    var ab= "";
                    var bc= "";
                    var cd= "";
                    var ingreds = "";

                    for(var i = 0; i <ingd.ingredients.length; i++){
                        ab = ingd.ingredients[i].ingredient_amount;
                        bc = ingd.ingredients[i].ingredient_unit;
                        cd = ingd.ingredients[i].ingredient_name;

                        ingreds += ing({
                            ing_text: ab + ' ' + bc + ' ' + cd,
                            ing_id: i
                        })
                    }
                    console.log(ingd);
                    $('body').append(recipeCalender({
                        divers: ingreds,
                        description: ingd.recipe_directions,
                        cancelrecipe: lang["popup-close-recipe"],

                    }));
                    $("#popup-close-recipe").click(function () {
                        $(this).closest(".pop").remove();
                    });


                }
            });

        }
    });

    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'recipeList.html',
                'popupRecipe.html',
                'recipeListEdit.html',
                'chosenRecipe.html',
                'ing.html',
                'recipeCalender.html'
            ]
        },
        success: function (data){
            recipeList = Handlebars.compile(data['recipeList.html']);
            popupRecipe = Handlebars.compile(data['popupRecipe.html']);
            recipeListEdit = Handlebars.compile(data['recipeListEdit.html']);
            chosenRecipe = Handlebars.compile(data['chosenRecipe.html']);
            ing = Handlebars.compile(data['ing.html']);
            recipeCalender = Handlebars.compile(data['recipeCalender.html']);
            prep();
        }
    });







    /**
     * This method calls the language api and sets the standard language as
     * norwegian.
     */
    $.ajax({
        url: '/api/language',
        method: 'GET',
        data: {
            lang: 'nb_NO',
            path: '/mealPlanner.html'
        },
        success: function (data) {
            lang=data;
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    $("#" + p).html(data[p]);
                }
            }
            $("#meal-filter").attr("placeholder", data["meal-filter"]);
        }
    });

    /**
     * This method calls the language api and sets the language to norwegian
     * if the user clicks on the norwegian flag.
     */
    $('#meal-norway').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'nb_NO'
            },

            success: function () {
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'nb_NO',
                        path: '/mealPlanner.html'
                    },
                    success: function (data) {
                        lang=data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#meal-filter").attr("placeholder", data["meal-filter"]);
                    }
                });
            },
            error: console.error
        });

    });

    /**
     * This method calls the language api and sets the language to english
     * if the user clicks on the british flag.
     */
    $('#meal-england').click(function () {
        $.ajax({
            url: '/api/language',
            method: 'POST',
            data: {
                lang: 'en_US'
            },
            success: function () {
                $.ajax({
                    url: '/api/language',
                    method: 'GET',
                    data: {
                        lang: 'en_US',
                        path: '/mealPlanner.html'
                    },
                    success: function (data) {
                        lang=data;
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                $("#" + p).html(data[p]);
                            }
                        }
                        $("#meal-filter").attr("placeholder", data["meal-filter"]);
                    }
                });
            },
            error: console.error
        });

    });

    $('#meal-filter').keyup(function(){
        console.log("hei");
        var search = $(this).val();
        updateList(recipe.filter(function(obj){
            return obj.recipe_name.toLowerCase().indexOf(search.toLowerCase()) > -1 || search == "";
        }));
    })

});




function prep(){
    /**
     * This method retrieves all recipes saved on the database, and places them on the
     * side div.
     */
    $.ajax({
        url: '/api/recipe',
        method: 'GET',
        success: function (data) {
            recipe = data;
            updateList(data);
        }
    });

    /**
     * This function creates a popup. Makes it possible for a user to add a recipe to the database.
     */
    $("#meal-addRecipe").unbind("click").click(function(){
        ingredients = [{}];
        $("body").append(popupRecipe({
            recipetitle: lang["add-recipe"],
            recipeingredient: lang["recipe-title"],
            ingredient: lang["recipe-ingredient"],
            recipequantity: lang["recipe-quantity"],
            recipeunit: lang["recipe-unit"],
            recipename: lang["recipe-name"],
            recipeaddIngredient: lang["recipe-ingredientButton"],
            recipedescription: lang["recipe-description"],
            recipeservings: lang["recipe-servings"],
            cancel: lang["recipe-cancel"],
            complete: lang["recipe-complete"]
        }));

        /**
         * If cancel is pressed.
         */
        $("#popup-cancel").click(function () {
            $(this).closest(".pop").remove();
        });

        $('.addIngredients-button').click(function () {
            var ingredient = {
                ingredient_name: $("#ingredient-name").val(),
                ingredient_amount: Number($("#ingredient-quantity").val()),
                ingredient_unit: $("#ingredient-measurement").val()
            };
            ingredients.push(ingredient);
            updateIngedientList();
            $("#ingredient-name").val("");
            $("#ingredient-quantity").val("");
            $("#ingredient-measurement").val("");
        });

        $("#popup-complete").click(function () {
            var data = {
                recipe_name: $('#recipe-name').val(),
                recipe_directions: $('#recipe-description').val(),
                recipe_servings: $('#amount-people').val(),
                ingredients: ingredients
            };
            var name = $('#recipe-name').val();
            var dir = $('#recipe-description').val();
            var serv = $('#amount-people').val();
            console.log(data);
            console.log(ingredients);
            //jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: '/api/recipe',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    recipe_name: name,
                    recipe_directions: dir,
                    recipe_servings: serv,
                    ingredients: JSON.stringify(ingredients)
                }),
                success: function () {
                    $(".pop").remove();
                },
                error: console.error
            });
        });
    });
}

function updateIngedientList(){
    $(".ingredientlist").html("");
    for(var i = 1; i < ingredients.length; i++) {
        $(".ingredientlist").append(recipeListEdit({
            ingredient_text: ingredients[i].ingredient_amount + " " + ingredients[i].ingredient_unit + " " + ingredients[i].ingredient_name,
            ingredient_id: i
        }));
    }
    $(".fa-times").unbind("click").click(function(){
        var li = $(this).closest('li[data-id]');
        $(li.remove());
    });
}

function updateList(data){
    $('.recipelist').html("");
    for(var i = 0; i < data.length; i ++) {
        $('.recipelist').append(recipeList({
            recipe_id: data[i].recipe_id,
            recipe_text: data[i].recipe_name
        }));
    }

    $('#meal-recipe .fc-event').each(function() {
        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
            title: $.trim($(this).text()), // use the element's text as the event title
            stick: true // maintain when user navigates (see docs on the renderEvent method)
        });
        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0,  //  original position after the drag
            helper: "clone",
            start: function(e, ui){
                $(ui.helper).css('background-color', '#7ebccc')
            }
        });
        $(this).css('background', 'transparent').css('color', 'black').css('border', '1px solid lightgray');
    });

    /**
     * Method for chosing one recipe.
     */
    $('li').click(function () {
        var id = $(this).closest('li').attr('data-id');
        var rec = null;
        var des = "";
        var nameRec = "";
        var idRec= "";
        for(var i = 0; i < recipe.length; i++){
            if(recipe[i].recipe_id == id){
                rec = recipe[i];
                console.log(rec);
                des = recipe[i].recipe_directions;
                console.log(des);
                nameRec = recipe[i].recipe_name;
                idRec = recipe[i].recipe_id;
            }
        }
        var ingers = "";
        var ings = null;
        var amounts = null;
        var units = null;

        for(var i = 0; i < rec.ingredients.length; i++){
            console.log(rec.ingredients[i])
            ings = rec.ingredients[i].ingredient_name;
            amounts = rec.ingredients[i].ingredient_amount;
            units = rec.ingredients[i].ingredient_unit;

            ingers += ing({
                ing_text: amounts + ' ' + units + ' ' + ings,
                ing_id: i
            });

            console.log(ings);
        }

        $('body').append(chosenRecipe({
            recipetitle: nameRec,
            divers: ingers,
            description: des,
            cancelrecipe: lang["cancel-recipe"],
            completerecipe: lang["complete-recipe"]
        }));
        $("#from-datepicker").datepicker({
            dateFormat: 'dd-mm-yy',
            altField: '#from-datepicker',
            altFormat: 'yy-mm-dd',
        });



        $("#popup-cancel-recipe").click(function () {
            $(this).closest(".pop").remove();
        });

        $("#popup-complete-recipe").click(function () {
            var d = $('#from-datepicker').val();

            var s = window.location.search.substring(1,window.location.search.length).split("&");
            var o = {};
            for(var i = 0; i < s.length;i ++){
                var a = s[i].split("=");
                o[a[0]]=a[1];
            }

            $.ajax({
                url: '/api/recipe/person/' + localStorage.person_id,
                method: 'POST',
                data: {
                    recipe_id: idRec,
                    meal_datetime: (d == "" ? "NULL" : d)
                },
                success: function () {
                    location.reload();
                },
                error: console.error
            })
        });


    });
};