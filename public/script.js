$(function(){



    $('.addButton').on('click', function(event){


        var myAdd = $(this);

        $.post('/added', {
            title: $(this).data('title'),
            game_id: $(this).data('gameid')
            },
            function(data,created){
                console.log('myAdd',myAdd);
                myAdd.fadeOut('slow');
                alert('Game has been added to your collection.');

        })


    });


    $('.deleteAdded').on('click', function(event){

        event.preventDefault();

        // alert($(this).data('myparam'))
        var thisDeleteButton = $(this);

        $.ajax({
            url: '/added/' + $(this).data('myparam'),
            type: 'DELETE',
            success: function(result) {
                thisDeleteButton.closest('tr').fadeOut('slow', function() {
                    $(this).remove();
                })
            }

        })

    });





});