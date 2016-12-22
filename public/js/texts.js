/*globals*/

$('.open-conversation').on('click', function (e) {
    var infoElement = $(this);
    var textarea = $('#messageToSend');
    var ul = $('#messages-list').html('');
    textarea.attr('identification', infoElement.attr('identification'))
    var body = {
        username: infoElement.attr('data-username')
    };

    requester.postJSON('/messages/texts', body, '')
        .then((result) => {
            console.log('here1');
            
            appendTexts(result.texts, result.loggedUser)
        })
});

//bgSuccessDark(data-userid=conversation.user.id, data-username=conversation.user.username)
//                        ul(id="messages-list")

function appendTexts(texts, loggedUser) {
    if (!texts) {
        return;
    }
    var ul = $('#messages-list');
    texts.forEach(text => {
        ul.append(buildMessage(text.owner, text.date, text.text, loggedUser));
    })
}

function buildMessage(owner, date, text, loggedUser) {
    if (owner === loggedUser) {
        return `<li class="left display-block bg-light" style="padding: 5px">
        <p>
            <strong>Me</strong>
        <span> on ${date.substring(1,16)} at ${date.substring(18,22)}</span>
        </P>
    <p style="white-space: normal; margin: 0px">
       
       ${text}
    </p>
           </li>
           <hr style="margin: 0px">`
    }
    else {
        return `<li class="right display-block" style="padding: 5px; text-align: right; background-color: #dff0d8; color: #3c763d">
        <p>
            <strong>${owner}</strong>
        <span> on ${date.substring(1,16)} at ${date.substring(18,22)}</span>
        </P>
    <p style="white-space: normal; margin: 0px">
       
       ${text}
    </p>
           </li>
           <hr style="margin: 0px">`
    }

}

$('#send-message').on('click', function (e) {
    var identification = $('#messageToSend').attr('identification');
    var text = $('#messageToSend').val();

    if (!identification) {
        return;
    }
    if (!text) {
        return;
    }
    var body = {
        identification,
        text
    }

    requester.putJSON('/messages', body, '')
        .then((result) => {
            console.log('here22');
            
            appendTexts(result.texts, result.loggedUser)
            $('#messageToSend').val('')
        })

});
