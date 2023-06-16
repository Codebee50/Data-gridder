let hiddenPollcode = document.getElementById('hd-code')
let pollcode = hiddenPollcode.value

let tableCon = document.querySelector('.table-container')
const changeText = document.getElementById('txt-change-file')
const fileInput = document.getElementById('file')
const editPoll = document.getElementById('edit-poll')
const modal  = document.querySelector('.modal-container')
const removeModal = document.getElementById('discard-btn')
const pollNameInput = document.getElementById('poll-name-input')
const saveBtn = document.getElementById('save-btn')
const loadingDiv = document.querySelector('.loading')
const fileName = document.getElementById('file-name')
const content = document.querySelector('.content')
const successDiv = document.querySelector('.success-div')
const peopleCount = document.getElementById('people-count')
const generateBtn = document.getElementById('generate-btn')

const downloadModel = document.querySelector('.download-modal')
const cancelDownload = document.getElementById('cancel-download')
const downloadAlert = document.querySelector('.download-alert')
const downloadContent = document.querySelector('.download-content')


const viewDetails = document.getElementById('see-details')
const displayDetailsModal = document.getElementById('display-details-modal')
const removeDetails = document.getElementById('btn-done')


removeDetails.addEventListener('click', removeDet)
console.log('added events')

let poll;
// const pollname = document.getElementById('')


$('document').ready(function(e){
    $.ajax({
        type: 'GET',
        url: '/getpollandvalues/' + pollcode + '/',
        data: {
            'csrfmiddlewaretoken' : $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(response){
           makeTable(response)
        }
    })
})


changeText.addEventListener('click', function(){
    fileInput.click()
})

fileInput.addEventListener('change', function(){
    fileName.textContent = this.files[0].name
})

editPoll.addEventListener('click', function(){
    modal.classList.add('visible')
    content.classList.add('visible')
})

viewDetails.addEventListener('click', viewDet)

removeModal.addEventListener('click', function(){
    modal.classList.remove('visible')
})

$(document).on('submit', '#edit-form', function(e){
    e.preventDefault()
})

saveBtn.addEventListener('click', function(){
    newname = pollNameInput.value
    if( newname == ''){
        alert('Name cannot be blank')
    }
    else{
    //make the save and cancel not clickable
    saveBtn.disabled = true
    removeModal.disabled= true
    loadingDiv.classList.add('visible')
    
    //send the ajax request
    pollname = poll[0].fields.poll_name
  
    let mData = new FormData()
    mData.append('pollname', newname)
    if(fileInput.files[0] == undefined){
        //this means user did not select any file 
    }
    else{
        mData.append('document', fileInput.files[0])
    }
    
    mData.append('pollcode', pollcode)
    mData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val())
    
    $.ajax({
        type: 'POST',
        url: '/editpoll',
        data: mData,
        contentType:false,
        processData: false,
        success: function(response){
            if(response.status == 'success'){
                
                saveBtn.disabled = false
                removeModal.disabled= false
                loadingDiv.classList.remove('visible')
                content.classList.remove('visible')
                successDiv.classList.add('visible')
                setTimeout(function(){
                    location.reload()
                }, 500)
              
            }
            else{
                saveBtn.disabled = false
                removeModal.disabled= false
                loadingDiv.classList.remove('visible')
                alert(response.message)
            }
        },
        error: function(response){
            saveBtn.disabled = false
            removeModal.disabled= false
            loadingDiv.classList.remove('visible')
            alert(response)
        }
    })
    }
   
})

function makeTable(data){
    //open the table tag, open the table head and open the tr for the table head
    let table = '<table><thead><tr>'
    
    //getting the serialized poll
    poll = JSON.parse(data.poll)
    
    pollNameInput.value = poll[0].fields.poll_name
 
    let originalDocumentName = poll[0].fields.original_doc_name
   
    if(originalDocumentName == 'document_name'){
        fileName.textContent= 'empty'

    }
    else{
        fileName.textContent = originalDocumentName
    }
    let fields = JSON.parse(poll[0].fields.fields)

    fields.forEach(function(field){
        table+= '<th>' + field.name + '</th>'
    })

    //close the tr for the table head, close the table head and open the table body
    table += '</tr></thead><tbody>'

    data.pollvalues.forEach(function(pollvalue){
        let fieldValues = JSON.parse(pollvalue.field_values)
        table += '<tr>'
        let index = 0
        fields.forEach(function(field){
            if(field.datatype == 'empty'){
                table += '<td>  </td>'
            }
            else{
              table += '<td>' + fieldValues[index].value + '</td>'
              index +=1
            } 
        })
    })

    table += '</table>'
    tableCon.innerHTML = table
}

window.addEventListener('beforeunload', function(event){
    console.log('page closed')
    //deleteTemp()
})

generateBtn.addEventListener('click', function(){
    downloadAlert.classList.remove('visible')
    downloadContent.classList.add('visible')
    downloadModel.classList.add('visible')
    const editName = document.getElementById('edit-name-i')
    const cancelEdit = document.getElementById('cancel-edit')
    const confirmEdit = document.getElementById('confirm-edit')
    const editContainer = document.querySelector('.edit-container')
    const newNameInput = document.getElementById('new-name-edt')
    const txtFileName = document.getElementById('txt-file-name')
    const downloadBtn = document.getElementById('download-btn')
    const isNumberedCheck = document.getElementById('number-document')

  
    
    let linkTag = document.getElementById('download-link-tag')

    let newName = poll[0].fields.original_doc_name
    if(newName == 'document_name'){
        newName = poll[0].fields.poll_name + '.docx'
    }
  
    txtFileName.textContent = newName

   
    editName.addEventListener('click', function(){
        editContainer.classList.add('visible')
    })
    cancelEdit.addEventListener('click', function(){
        editContainer.classList.remove('visible')
    })

    confirmEdit.addEventListener('click', function(){
        if (newNameInput.value == ''){
            
        }
        else{
            inputVal = (newNameInput.value).trim()
           
            newName = inputVal + '.docx'
            console.log(newName)
            txtFileName.textContent = newName
            editContainer.classList.remove('visible')
        }
       
    })

    downloadBtn.addEventListener('click', function(){
        isNumbered = (isNumberedCheck.checked).toString()
        //linkTag.href = '/downloaddoc/' + pollcode + '/' + newName + '/'
        linkTag.href = '/generatedoc/' + pollcode + '/' + newName + '/' + isNumbered + '/'
        linkTag.click()
        downloadAlert.classList.add('visible')
        downloadContent.classList.remove('visible')
        setTimeout(function(){
            downloadAlert.classList.remove('visible')
            downloadModel.classList.remove('visible')
        }, 2000)
    })


})

cancelDownload.addEventListener('click', function(){
    downloadModel.classList.remove('visible')

})




function viewDet(){
   
    displayDetailsModal.classList.add('visible')
    let pollcode = poll[0].fields.poll_code

   let serverLink = 'http://127.0.0.1:8000/regpoll/'
   let polLink = serverLink + pollcode+ '/'
    const txtPollLink = document.getElementById('txt-poll-link')

    txtPollLink.textContent = polLink

    const copyPollCode = document.getElementById('copy-poll-code')
    const copyPollLink = document.getElementById('copy-poll-link')
    const copyPollToolTip = document.getElementById('cpc-tool-tip')
    const cplToolTip = document.getElementById('cpl-tool-tip')

    copyPollCode.addEventListener('click', function(){
        //copy the poll code to clipboard
      
        navigator.clipboard.writeText(pollcode).then(()=>{
            copyPollToolTip.textContent = 'Copied'
            
            console.log('poll code copied..')
           
            setTimeout(function(){
                copyPollToolTip.textContent = 'Copy poll code'
            }, 1300)
        }).catch((error) =>{
            alert(error)
            console.log('error copying poll code')
        })

       
    })

    

    copyPollLink.addEventListener('click', function(){
        //copy the poll link
        navigator.clipboard.writeText(polLink).then(()=>{
            cplToolTip.textContent = 'Copied'
            setTimeout(function(){
                
                cplToolTip.textContent = 'Copy poll link'
            }, 1300)
        }).catch((error) =>{
           
            console.log('error copying poll code')
        })
    })
}

function shareText(title, text, url){
    if (navigator.share){
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(()=>{
            console.log('shared')
        })
    }
    else{
        console.log('cant share')
    }
}

function removeDet(){
    displayDetailsModal.classList.remove('visible')
}


function deleteTemp(){
    $.ajax({
        url: '/deletetemp/' + pollcode + '/',
        type: 'GET',
        success: function(response){
           console.log(response.message)
        },
        error: function(response){
            console.log(response)
        }
    })
}





