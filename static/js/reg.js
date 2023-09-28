setupOpaqueModal('op-one', 'op-message-one', 'Fetching poll..')

document.addEventListener('DOMContentLoaded', function () {
    const mInput = document.getElementById('in-poll-code');
    const inputContainer = document.querySelector('.input-container');
    const submitBtn = document.getElementById('submit');
    const valueIdInput = document.getElementById('value_id');
    const promptTxt = document.getElementById('prompt');
    const messageModal = document.querySelector('.message-modal');
    const checkMark = document.getElementById('check-mark');
    const errorMark = document.getElementById('error-mark');
    const removeMessageModal = document.getElementById('remove-message-modal');
    const txtMessage = document.getElementById('txt-message');
    const progressBar = document.getElementById('progress-bar');
    let valueId = valueIdInput.value;
    let pollvalues;

    let editMode = false;


    class Input {
        constructor(name, value) {
            this.name = name;
            this.value = value;
        }
    }

    if (removeMessageModal !== null) {
        removeMessageModal.addEventListener('click', function () {
            messageModal.classList.remove('visible');
            location.reload();
        });
    }


    let pollcode = mInput.value;
    let inputArray = [];

    fetch('/getpoll/' + pollcode + '/' + valueId + '/')
        .then(response => response.json())
        .then(data => {
            console.log('fetch has returned')
            transitionModal('none')
            let fieldArray = JSON.parse(JSON.parse(data.fields));

            if (data.values !== 'empty') {
                editMode = true;
                pollvalues = JSON.parse(data.values[0].fields.field_values);
                populateUi(fieldArray);
                promptTxt.textContent = 'Modify your entries';
                submitBtn.value = 'Save';
            } else {
                editMode = false;
                populateUi(fieldArray);
            }
        })
        .catch(error => console.error('Error:', error));

    document.querySelector('#submit-form').addEventListener('submit', function (e) {
        e.preventDefault();
        progressBar.classList.add('visible');
        submitBtn.disabled = true;

        let inputValueArray = inputArray.map(item => new Input(item.name, item.value));
        let inputString = JSON.stringify(inputValueArray);
        var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

        let formData = new FormData()
        formData.append('pollcode', pollcode)
        formData.append('values', inputString)
        formData.append('editmode', editMode.toString())
        formData.append('valueid', valueId)

        let jsonData = JSON.stringify({
            'pollcode': pollcode,
            'values': inputString,
            'editmode': editMode.toString(),
            'valueid': valueId,
        })
    
        fetch('/savevalue', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken 
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                progressBar.classList.remove('visible');
                errorMark.style.display = 'none';
                checkMark.style.display = 'block';
                messageModal.classList.add('visible');
            } else {
                progressBar.classList.remove('visible');
                errorMark.style.display = 'block';
                checkMark.style.display = 'none';
                messageModal.classList.add('visible');
            }

            txtMessage.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
    });


    
    function populateUi(fieldArray) {
        fieldArray.forEach(item => {
            if (item.datatype !== 'empty') {
                let inputElement = document.createElement("input");
                inputElement.type = item.datatype;
                inputElement.placeholder = item.name;
                inputElement.required = item.required;
                inputElement.name = item.name;
                inputElement.id = item.name;

                if (editMode) {
                    let matchingValue = pollvalues.find(value => value.name === item.name);
                    if (matchingValue) {
                        inputElement.value = matchingValue.value;
                    }
                }

                inputContainer.appendChild(inputElement);
                inputArray.push(inputElement);
            }
        });
    }
    
});