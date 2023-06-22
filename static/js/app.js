const mobile = document.getElementById('mobile')
const nav = document.querySelector('.nav-bar')
const header = document.querySelector('.header')
const bar = document.getElementById('bar')
let modalContainer = document.getElementById('modal-container')
const btnNewPoll = document.querySelector('.btn-new-poll')
let submitBtn = document.getElementById('submit-btn')
let loadingPoll = document.querySelector('.loading-poll-div')

// Check if the browser supports smooth scrolling
if ('scrollBehavior' in document.documentElement.style) {
    // Smooth scrolling is supported, enable it
    document.documentElement.style.scrollBehavior = 'smooth';
  }
  

btnNewPoll.addEventListener('click', function(e){
    localStorage.setItem('screen-id', 'new-poll')
    window.location.href = '/dashboard'
})
mobile.addEventListener('click', ()=>{
   header.classList.toggle('open')
   console.log('cllick')
   if(header.classList.contains('open')){
    nav.style.height = `${nav.scrollHeight}px`
    bar.classList.replace('fa-bars', 'fa-xmark')
    console.log(mobile)
   }
   else{
    nav.style.height = '0px'
    bar.classList.replace('fa-xmark', 'fa-bars')
   }
})

$(document).on('submit', '#find-poll-form', function(e){
    e.preventDefault()
    submitBtn.disabled = true
    loadingPoll.classList.add('visible')
    $.ajax({
        type: 'POST',
        url: '/findpoll',
        data: {
            'pollcode': $('#poll-code').val(),
            'csrfmiddlewaretoken' : $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(data){
            submitBtn.disabled= false
            loadingPoll.classList.remove('visible')
            if(data.status== 'success'){
                    modalContainer.classList.add('visible')
                    let content = `<div class="result-container">
                    <div class="left-content">
                        <div class="det">
                            <h4 class="p-name" id="p-name">Prepar</h4>
                        </div>
                        <div class="det">
                            <i class="fa-regular fa-user"></i>
                            <p class="p-author" id="p-author">Udochukwu</p>
                        </div>
                        <div class="det">
                            <i class="fa-solid fa-key"></i>
                            <p class="p-code" id="p-code">DG-UI89756</p>
                        </div>
                    </div>
        
                    <div class="right-content">
                        <button id="btn-go">Go</button>
                        <button id="btn-cancel">Cancel</button>
                    </div>
                </div>`
        
                let modalBox = document.querySelector('.modal-box')
                modalBox.innerHTML = content
        
                let btnCancel = document.getElementById('btn-cancel')
                btnCancel.addEventListener('click', function(){
                    modalContainer.classList.remove('visible')
                })
        
                let pName = document.getElementById('p-name')
                let pAuthor = document.getElementById('p-author')
                let pCode = document.getElementById('p-code')
        
                pName.textContent = data.pollname
                pAuthor.textContent = data.pollauthor
                pCode.textContent = data.pollcode

                let btnGo = document.getElementById('btn-go')
                btnGo.addEventListener('click', function(){
                    window.location.href ='/regpoll/' + data.pollcode + '/nb/' 
                })
            }
            else{
                modalContainer.classList.add('visible')
                const content = `   <div class="warning-div">
                <p id="warning-message">Poll does not exist, check your poll code and try again</p>
                <button id="btn-ok">Ok</button>
            </div>`

            let modalBox = document.querySelector('.modal-box')
            modalBox.innerHTML = content

            const btnOk = document.getElementById('btn-ok')
            btnOk.addEventListener('click', ()=>{
                modalContainer.classList.remove('visible')
            })
            }
           
        },
        error: function(data){
            loadingPoll.classList.remove('visible')
            submitBtn.disabled = false
            alert(data)
        }
    })
})






