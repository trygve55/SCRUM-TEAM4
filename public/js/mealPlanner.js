var recipeList, popupRecipe, ingredients, recipeListEdit, recipe, chosenRecipe, ing;

$(function () {
    $.ajax({
        url: '/template',
        method: 'GET',
        data: {
            files: [
                'recipeList.html',
                'popupRecipe.html',
                'recipeListEdit.html',
                'chosenRecipe.html',
                'ing.html'
            ]
        },
        success: function (data){
            recipeList = Handlebars.compile(data['recipeList.html']);
            popupRecipe = Handlebars.compile(data['popupRecipe.html']);
            recipeListEdit = Handlebars.compile(data['recipeListEdit.html']);
            chosenRecipe = Handlebars.compile(data['chosenRecipe.html']);
            ing = Handlebars.compile(data['ing.html']);
            prep();
        }
    });

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
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: [
            {
                title: 'All Day Event',
                start: '2018-01-25'
            },
            {
                title: 'Tomatsuppe',
                start: '2018-01-18'
            }
        ]
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
            path: window.location.pathname
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
                        path: window.location.pathname
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
                        path: window.location.pathname
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
            for(var i = 0; i < data.length; i ++) {
                $('.recipelist').append(recipeList({
                    recipe_id: data[i].recipe_id,
                    recipe_text: data[i].recipe_name
                }));
            }

            /**
             * Method for chosing one recipe.
             */
            $('li').click(function () {
                var id = $(this).closest('li').attr('data-id');
                var rec = null;
                var des = "";
                var nameRec = "";
                for(var i = 0; i < recipe.length; i++){
                   if(recipe[i].recipe_id == id){
                       rec = recipe[i];
                       console.log(rec);
                       des = recipe[i].recipe_directions;
                       console.log(des);
                       nameRec = recipe[i].recipe_name;
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
                }))
                $("#popup-cancel-recipe").click(function () {
                    $(this).closest(".pop").remove();
                });


            });
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
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: '/api/recipe',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    recipe_name: name,
                    recipe_directions: dir,
                    recipe_servings: serv,
                    ingredients: ingredients
                }),
                success: function () {
                    $(".pop").remove();
                },
                error: console.error
            });
        });
    });
}

function updateChosenRecipe(){
    $(".recipeIngredientList").html("");
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